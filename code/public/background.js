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