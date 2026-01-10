
export default defineBackground(() => {
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id && tab.url?.includes('appsheet.com')) {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          window.dispatchEvent(new CustomEvent('SEAS_TRIGGER_DOWNLOAD'));
        },
      });
    }
  });
});
