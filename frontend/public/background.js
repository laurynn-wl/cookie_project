/* global chrome */

// Listen for the extension icon click
chrome.action.onClicked.addListener(() => {
  // Create a new tab pointing to your dashboard
  chrome.tabs.create({ url: 'index.html' });
});