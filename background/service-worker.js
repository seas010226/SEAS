// SEAS Service Worker
console.log('SEAS: Service Worker loaded.');

chrome.runtime.onInstalled.addListener(() => {
  console.log('SEAS: Extension installed/updated.');
});
