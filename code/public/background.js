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
// async function getCookiesForCurrentTab() {
//   try {
    
//     // Gets the current active tab
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

//     if (!tab) {
//       console.error("ERROR: No active tab found.");
//       return;
//     }

//     // Check: Don't run on chrome:// settings pages
//     if (tab.url.startsWith("chrome://")) {
//       console.warn("WARNING: Can not extract cookies from a chrome:// page. Try google.com instead.");
//       return;
//     }

//     const frames = await chrome.webNavigation.getAllFrames({ tabId: tab.id });

//     const urls = frames.map(frame => frame.url).filter(url => url.startsWith('http'));

//     if (!urls.includes(tab.url)) {
//       urls.push(tab.url);
//     }

//     const cookiePromises = urls.map(url => chrome.cookies.getAll({ url }));;
//     const results = await Promise.all(cookiePromises);

//     const allCookies = results.flat();
//     const uniqueCookiesMap = [];
//     const seenCookies = new Set();

//     allCookies.forEach(c => {
//       const key = `${c.name}|${c.domain}|${c.path}`;

//       if (!seenCookies.has(key)) {
//         seenCookies.add(key);
//         uniqueCookiesMap.push(c);
//       }
//     });

//     if (uniqueCookiesMap.length === 0) {
//       console.log("No cookies found for this site.");
//     } else {
//       console.log(`Found ${uniqueCookiesMap.length} cookies for this site.`);
//     }

//     // Saves the cookies and URL to local storage for analysis
//     await chrome.storage.local.set({ 
//       'cookies_from_site': uniqueCookiesMap,
//       'active_url': tab.url 
//     });
    
//     console.log("Data saved to local storage.");
//     return true;
//   } catch (error) {
//     console.error("Background script error:", error);
//     return false;
//   }
// }

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
            .then((count) => {
                // Send success response back to UI
                sendResponse({ success: true, deletedCount: count });
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

    // Create an array of deletion promises
    const deletionPromises = cookiesToDelete.map(cookie => {
        
        // CRITICAL: We must reconstruct the URL that "owns" the cookie
        const url = getCookieUrl(cookie);
        
        const details = {
            url: url,
            name: cookie.name,
        };

        if (cookie.storeId) {
            details.storeId = cookie.storeId;
        }

        if (cookie.partitionKey) {
            details.partitionKey = cookie.partitionKey;
        }

        return chrome.cookies.remove(details);
    });

    // Wait for all cookies to be removed
    await Promise.all(deletionPromises);
    return cookiesToDelete.length;
}

// 3. Helper: Construct the URL from cookie data
function getCookieUrl(cookie) {
    // A: Determine protocol
    const protocol = cookie.secure ? 'https:' : 'http:';

    // B: Clean the domain (Remove leading dot if present)
    // e.g., ".google.com" -> "google.com"
    const domain = cookie.domain.startsWith('.') 
        ? cookie.domain.slice(1) 
        : cookie.domain;

    // C: Determine path (default to / if missing)
    const path = cookie.path || '/';

    // Combine them: https://google.com/
    return `${protocol}//${domain}${path}`;
}