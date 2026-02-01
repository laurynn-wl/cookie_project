/* global chrome */

// Retrieve cookies for the current tab
async function getCookiesForCurrentTab() {
  try {
    
    // Gets the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      console.error("ERROR: No active tab found.");
      return;
    }

    // Check: Don't run on chrome:// settings pages
    if (tab.url.startsWith("chrome://")) {
      console.warn("WARNING: Can not extract cookies from a chrome:// page. Try google.com instead.");
      return;
    }

    const frames = await chrome.webNavigation.getAllFrames({ tabId: tab.id });

    const urls = frames.map(frame => frame.url).filter(url => url.startsWith('http'));

    if (!urls.includes(tab.url)) {
      urls.push(tab.url);
    }

    const cookiePromises = urls.map(url => chrome.cookies.getAll({ url }));;
    const results = await Promise.all(cookiePromises);

    const allCookies = results.flat();
    const uniqueCookiesMap = [];
    const seenCookies = new Set();

    allCookies.forEach(c => {
      const key = `${c.name}|${c.domain}|${c.path}`;

      if (!seenCookies.has(key)) {
        seenCookies.add(key);
        uniqueCookiesMap.push(c);
      }
    });

    if (uniqueCookiesMap.length === 0) {
      console.log("No cookies found for this site.");
    } else {
      console.log(`Found ${uniqueCookiesMap.length} cookies for this site.`);
    }

    // Saves the cookies and URL to local storage for analysis
    await chrome.storage.local.set({ 
      'cookies_from_site': uniqueCookiesMap,
      'active_url': tab.url 
    });
    
    console.log("Data saved to local storage.");
    return true;
  } catch (error) {
    console.error("Background script error:", error);
    return false;
  }
  //   // Retrieves all cookies for the specified URL
  //   const cookies = await chrome.cookies.getAll({ url: tab.url });
  
  //   // Log whether any cookies were found
  //   if (cookies.length === 0) {
  //     console.log("No cookies found for this site.");
  //   } else {
  //     console.log(`Found ${cookies.length} cookies for this site.`);
  //   }

  //   // Saves the cookies and URL to local storage for analysis
  //   await chrome.storage.local.set({ 
  //     'cookies_from_site': cookies,
  //     'active_url': tab.url 
  //   });

  //   console.log("Data saved to local storage.");
  //   return true;

  // } catch (error) {
  //   console.error("Background script error:", error);
  //   return false;
  // }
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