import { downloadAppDefinition } from '@features/download-app-def/model/download';

export default defineBackground(() => {
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id && tab.url?.includes('appsheet.com')) {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        world: 'MAIN',
        func: downloadAppDefinition,
      });
    }
  });
});
