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

    // Retrieves all cookies for the specified URL
    const cookies = await chrome.cookies.getAll({ url: tab.url });
  
    // Log whether any cookies were found
    if (cookies.length === 0) {
      console.log("No cookies found for this site.");
    } else {
      console.log(`Found ${cookies.length} cookies for this site.`);
    }

    // Saves the cookies and URL to local storage for analysis
    await chrome.storage.local.set({ 
      'cookies_from_site': cookies,
      'active_url': tab.url 
    });

    console.log("Data saved to local storage.");
    return true;

  } catch (error) {
    console.error("Background script error:", error);
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

  if (request.type === 'delete_cookies') {
    const cookies_to_delete = request.payload;
    
    const performCookieDeletion = async () => {
    
            // 2. EXECUTE DELETION (Attempt Standard + Fallback)
            const processPromises = cookies_to_delete.map(async (cookie) => {
              const clean_domain = cookie.domain.startsWith('.')
                    ? cookie.domain.substring(1)
                    : cookie.domain;

                // Cookies must be deleted using the correct protocol
                const protocol = cookie.secure ? 'https:' : 'http:';

                // Construct a valid URL required by the Chrome Cookies API
                const cookie_url = `${protocol}//${clean_domain}${cookie.path}`;

                
                // Attempt 1: Standard Remove
                await new Promise(resolve => {
                    chrome.cookies.remove({
                        url: cookie_url,
                        name: cookie.name,
                        storeId: cookie.storeId
                    }, resolve);
                });

                // Attempt 2: Expiration Overwrite (Nuclear Option)
                await new Promise(resolve => {
                     chrome.cookies.set({
                        url: cookie_url,
                        name: cookie.name,
                        domain: cookie.domain,
                        path: cookie.path,
                        expirationDate: 0, // 1970
                        storeId: cookie.storeId,
                        secure: cookie.secure,
                        httpOnly: cookie.httpOnly,
                        sameSite: cookie.sameSite
                    }, resolve);
                });
            });

            // Wait for all attempts to finish
            await Promise.all(processPromises);

            // Wait for Chrome to update its internal database
            await new Promise(r => setTimeout(r, 500));

            // 3. VERIFICATION (Correct Scope & Correct API Usage)
            if (cookies_to_delete.length > 0) {

                // Use the domain of the first cookie as the verification scope
                const first = cookies_to_delete[0];
                const domain_to_check = first.domain.startsWith('.')
                    ? first.domain.substring(1)
                    : first.domain;

                // Get ALL cookies still present on this domain
                const remaining_cookies = await chrome.cookies.getAll({
                    domain: domain_to_check
                });

                console.log("Real Data (Remaining):", remaining_cookies);

                // Build a fast lookup set of remaining cookie names
                const remaining_names = new Set(remaining_cookies.map(c => c.name));

                const confirmed_deleted = [];
                const failed_to_delete = [];

                cookies_to_delete.forEach((target) => {
                    if (remaining_names.has(target.name)) {
                        failed_to_delete.push(target.name);
                    } else {
                        confirmed_deleted.push(target.name);
                    }
                });

                // REPORTING
                console.log(`Summary:`);
                console.log(`✅ Successfully Deleted (${confirmed_deleted.length}):`, confirmed_deleted);
                console.log(`❌ Failed to Delete (${failed_to_delete.length}):`, failed_to_delete);

                if (failed_to_delete.length > 0) {
                    sendResponse({
                        success: false,
                        message: `Partial success. Deleted: ${confirmed_deleted.length}. Failed: ${failed_to_delete.length}`
                    });
                } else {
                    sendResponse({
                        success: true,
                        message: `Success! All ${confirmed_deleted.length} selected cookies were deleted.`
                    });
                }

            } else {
                sendResponse({ success: true, message: "No cookies selected." });
            }

                    };

        performCookieDeletion();
        return true; // Keep channel open
    }
});