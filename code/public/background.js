/* global chrome */

// Retrieve cookies for the current tab


async function getCookiesForCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url) {
        console.error("No active tab found.");
        return false;
    }

    console.log("1. Starting Deep Scan for: ", tab.url);

    // STEP A: Inject a script to find ALL resources (Images, Scripts, Pixels, CSS)
    // We use the 'performance' API which lists everything the network fetched.
    const resourceResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            // This runs inside the browser tab
            return performance.getEntriesByType("resource")
                .map(r => r.name) // Get the URL
                .filter(url => url.startsWith('http')); // Valid URLs only
        }
    });

    // Extract the URLs found by the script
    const resourceUrls = (resourceResults[0]?.result) || [];
    
    // Add the main tab URL (and frames just in case)
    const frameResults = await chrome.webNavigation.getAllFrames({ tabId: tab.id });
    const frameUrls = frameResults.map(f => f.url);
    
    // Combine everything into a master list of domains to check
    const allUrls = [...new Set([tab.url, ...resourceUrls, ...frameUrls])];

    console.log(`2. Found ${allUrls.length} total resources. fetching cookies...`);

    // STEP B: Fetch cookies for every single URL found
    // This is 'heavy' but ensures we find Google, Facebook, and hidden trackers

    
    const cookiePromises = allUrls.map(url => chrome.cookies.getAll({ url }));
    const results = await Promise.all(cookiePromises);

    // STEP C: Flatten and Deduplicate
    const uniqueCookies = [];
    const seenCookies = new Set();

    results.flat().forEach(c => {
        // Use a composite key to ensure uniqueness
        const key = `${c.name}|${c.domain}|${c.path}|${c.storeId}`;
        if (!seenCookies.has(key)) {
            seenCookies.add(key);
            uniqueCookies.push(c);
        }
    });

    console.log(`3. Success! Found ${uniqueCookies.length} unique cookies.`);

    // Save to storage
    await chrome.storage.local.set({ 
      'cookies_from_site': uniqueCookies,
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



// 2. The Main Deletion Logic
async function handleCookieDeletion(cookiesToDelete) {
    if (!cookiesToDelete || cookiesToDelete.length === 0) return 0;
        
    let deletedCount = 0;

    const deletionPromises = cookiesToDelete.map(async (cookie) => {
        // 1. Force HTTPS (You already found this is required)
        const url = getCookieUrl(cookie);
        
        // 2. CRITICAL FIX: Handle Store ID
        // Your hardcoded test proved we NEED "0". 
        // If cookie.storeId is missing/null, default it to "0".
        const targetStoreId = cookie.storeId ? cookie.storeId : "0";

        const details = {
            url: url,
            name: cookie.name,
            storeId: targetStoreId, 
        };

        // 3. Handle Partition Key (For Google CHIPS/Frames)
        if (cookie.partitionKey) {
            details.partitionKey = cookie.partitionKey;
        }

        // DEBUG LOG: See exactly what we are sending to Chrome
        console.log(`Attempting Delete -> URL: ${details.url} | Name: ${details.name} | Store: ${details.storeId}`);


        try {
            // 4. Perform Deletion
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

// 3. Helper: Construct the URL (Your version was good, just kept it clean here)
function getCookieUrl(cookie) {
    const domain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
    const path = cookie.path || '/';
    // Always force HTTPS as per your finding
    return `https://${domain}${path}`;
}