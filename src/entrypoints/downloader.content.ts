import { downloadAppDefinition } from '@features/download-app-def/model/download';

export default defineContentScript({
  matches: ['*://*.appsheet.com/*'],
  // This script runs in the MAIN world to access window.currentApp()
  world: 'MAIN',
  main() {
    window.addEventListener('SEAS_TRIGGER_DOWNLOAD', () => {
      downloadAppDefinition();
    });
  },
});
