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

    // We define an async function so we can use 'await'
    const performDelete = async () => {
      
      // 1. Create a list of "Deletion Promises"
      // This lets us track when every single delete request has finished
      const deletePromises = cookies_to_delete.map((cookie) => {
        return new Promise((resolve) => {
          
          const protocol = cookie.secure ? 'https:' : 'http:';
          const clean_domain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
          const cookie_url = `${protocol}//${clean_domain}${cookie.path}`;

          chrome.cookies.remove({
            url: cookie_url,
            name: cookie.name,
            storeId: cookie.storeId,
          }, (details) => {
            if (details) {
              console.log(`Deleted: ${details.name}`);
            } else {
              console.error(`Failed to delete: ${cookie.name}`, chrome.runtime.lastError);
            }
            resolve(); // Mark this specific deletion as done
          });
        });
      });

      // 2. Wait for ALL deletions to finish
      await Promise.all(deletePromises);

      // 3. RE-FETCH: Get the fresh list of cookies for this domain to prove they are gone
      if (cookies_to_delete.length > 0) {
        // Use the domain from the first cookie to find remaining ones
        const first = cookies_to_delete[0];
        const domain_to_check = first.domain.startsWith('.') ? first.domain.substring(1) : first.domain;

        const remaining_cookies = await chrome.cookies.getAll({ domain: domain_to_check });

        // This log will appear exactly like "Real Data Found" in your screenshot
        console.log("Real Data (Remaining):", remaining_cookies);
      }

      // 4. Send response back to the dashboard
      sendResponse({ 
        success: true, 
        message: `Deletion complete. Checked for remaining cookies.` 
      });
    };

    // Execute the function
    performDelete();

    return true; // Keep the message channel open for the async response
  }
});