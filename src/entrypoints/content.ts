export default defineContentScript({
  matches: ['*://*.appsheet.com/*'],
  main() {
    console.log('SEAS: Content script loaded.');
  },
});
