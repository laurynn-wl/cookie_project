/* global chrome */

/**
 * Gets all cookies for the current active tab 
 */
async function getCookiesForCurrentTab() {
  try {
    // gets the current active tab in the current window 
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url) {
        console.error("No active tab found.");
        return false;
    }

    console.log("Starting Deep Scan for: ", tab.url);

    /**
     * Gets all resourceU URLs from the page using the performance API
     * This includes the main page and any iframe resources 
     */

    const resource_results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            // Get all resource entries and extract their URLs
            return performance.getEntriesByType("resource")
                .map(r => r.name) 
                .filter(url => url.startsWith('http'));
        }
    });

    // Extract all resource URLs from the results 
    const resource_URLS = (resource_results[0]?.result) || [];
    
   // main + iframes(embedded)
    const frame_results = await chrome.webNavigation.getAllFrames({ tabId: tab.id });
    const frame_URLS = frame_results.map(f => f.url);
    
    // Combine everything into a master list of domains to check
    const all_URLS = [...new Set([tab.url, ...resource_URLS, ...frame_URLS])];

    // console.log(`Found ${all_URLS.length} total resources. fetching cookies...`);

    // Fetch cookies for all URLs
    const cookiePromises = all_URLS.map(url => chrome.cookies.getAll({ url }));
    const results = await Promise.all(cookiePromises);

    // Flatten and remove duplicate results 
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

    // Store cookies in local Chrome storage for the dashboard 
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


/**
 * Listen for extension click 
 * When clicked retrieve cookies for current tab and open dashboard 
 */
chrome.action.onClicked.addListener(async () => {
  console.log("Retrieving cookies...");
  const success = await getCookiesForCurrentTab();

  if (success) {
    chrome.tabs.create({ url: 'index.html' });
  }
});

/**
 * Listens for delete_cookie request from dashboard 
 */
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

        return true;
    }
});



const block_list = new Set();

// Listens for any changes to cookies in the browser (additions or modifications)
chrome.cookies.onChanged.addListener((cookie_changes) => {
    if (cookie_changes.removed) return;

    const cookie = cookie_changes.cookie;
    const cookie_info = `${cookie.name}|${cookie.domain}`;

    // If this cookie matches any in our block list (recently deleted cookies), remove it again   
    if (block_list.has(cookie_info)) {
        console.log(` Deleted cookie: ${cookie.name} tried to regenerate.`);

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


/**
 * Handles deletion of cookies 
 */
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
    return `https://${domain}${path}`;
}

