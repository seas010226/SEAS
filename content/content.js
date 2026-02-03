// SEAS Content Script
console.log('SEAS: Content script loaded on AppSheet.');

// Example: Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ status: 'pong' });
  }
});
