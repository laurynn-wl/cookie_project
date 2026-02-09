/* global chrome */

// Retrieve cookies for the current tab
async function getCookiesForCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url) {
        console.error("No active tab found.");
        return false;
    }

    console.log("Starting Deep Scan for: ", tab.url);

    // Gets all resource URLs from the page using the Performance API (works for main page and iframes)
    const resourceResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            // Get all resource entries and extract their URLs
            return performance.getEntriesByType("resource")
                .map(r => r.name) // Get the URL
                .filter(url => url.startsWith('http')); // Valid URLs only (http/https)
        }
    });

    // Extract all resource URLs from the results 
    const resource_URLS = (resourceResults[0]?.result) || [];
    
    // Add the main tab URL (and frames just in case)
    const frameResults = await chrome.webNavigation.getAllFrames({ tabId: tab.id });
    const frame_URLS = frameResults.map(f => f.url);
    
    // Combine everything into a master list of domains to check
    const all_URLS = [...new Set([tab.url, ...resource_URLS, ...frame_URLS])];

    console.log(`Found ${all_URLS.length} total resources. fetching cookies...`);

    // Fetch cookies for all URLs in parallel
    const cookiePromises = all_URLS.map(url => chrome.cookies.getAll({ url }));
    const results = await Promise.all(cookiePromises);

    // Flatten results and remove duplicates (some cookies may appear multiple times across resources)
    const unique_cookies = [];
    const seen_cookies = new Set();

    results.flat().forEach(c => {
        // Create a unique key for each cookie based on its identifying properties
        const key = `${c.name}|${c.domain}|${c.path}|${c.storeId}`;
        if (!seen_cookies.has(key)) {
            seen_cookies.add(key);
            unique_cookies.push(c);
        }
    });

    console.log(`Found ${unique_cookies.length} unique cookies.`);

    // Save to storage
    await chrome.storage.local.set({ 
      'cookies_from_site': unique_cookies,
      'active_url': tab.url 
    });

    return true;

  } catch (error) {
    console.error("Deep Scan Failed:", error);
    return false;
  }
}


// Listens for the extension icon click
chrome.action.onClicked.addListener(async () => {
  console.log("Retrieving cookies...");
  
  const success = await getCookiesForCurrentTab();

  if (success) {
    // Only opens the dashboard if we successfully got data
    chrome.tabs.create({ url: 'index.html' });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    if (request.action === "delete_cookies") {
        handleCookieDeletion(request.cookies)
            .then((result) => {
                // Send success response back to UI
                sendResponse({ success: true, ...result });
            })
            .catch((err) => {
                console.error("Deletion failed:", err);
                sendResponse({ success: false, error: err.message });
            });

        return true; // Keep the message channel open for async response
    }
});



const block_list = new Set();

// Continually listens for any changes to cookies in the browser (additions or modifications)
chrome.cookies.onChanged.addListener((cookie_changes) => {
    // Exit early if the cookie was removed
    if (cookie_changes.removed) return;

    const cookie = cookie_changes.cookie;
    const cookie_info = `${cookie.name}|${cookie.domain}`;

    // Check if this cookie matches any in our block list (i.e., cookies we just deleted)   
    if (block_list.has(cookie_info)) {
        console.log(` Deleted cookie: ${cookie.name} tried to regenerate.`);

        // Remove the cookie again to prevent it from regenerating
        const protocol = cookie.secure ? "https:" : "http:";
        const domain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
        const url = `${protocol}//${domain}${cookie.path}`;

        chrome.cookies.remove({
            url: url,
            name: cookie.name,
            storeId: cookie.storeId
        });
    }
});


// Handles cookie deletion requests from the UI
async function handleCookieDeletion(cookiesToDelete) {
    if (!cookiesToDelete || cookiesToDelete.length === 0) return 0;
        
    let deletedCount = 0;

    const deletionPromises = cookiesToDelete.map(async (cookie) => {
        
        // Add the cookie to the block list to prevent it from regenerating after deletion
        const cookie_info = `${cookie.name}|${cookie.domain}`;
        block_list.add(cookie_info);

        const url = getCookieUrl(cookie);
        const store_ID = cookie.storeId ? cookie.storeId : "0";

        const details = {
            url: url,
            name: cookie.name,
            storeId: store_ID, 
        };

        
        if (cookie.partitionKey) {
            details.partitionKey = cookie.partitionKey;
        }

        
        console.log(`Attempting to delete -> URL: ${details.url} | Name: ${details.name} | Store: ${details.storeId}`);


        try {
            // Delete the cookie and wait for the result before proceeding to the next one
            await new Promise((resolve) => {
            chrome.cookies.remove(details, (result) => {
                if (result) {
                    deletedCount++;
                } else {
                    console.warn(`Failed to delete ${cookie.name}`);
                }
                resolve();
                });
            });

        } catch (err) {
            console.error(err);
        }
    });

    await Promise.all(deletionPromises);
    return deletedCount;
}

// Constructs the URL needed for cookie deletion based on cookie properties
function getCookieUrl(cookie) {
    const domain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
    const path = cookie.path || '/';
    // Always force HTTPS as per your finding
    return `https://${domain}${path}`;
}

