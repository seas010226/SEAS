/**
 * This function is executed in the MAIN world (page context).
 * It extracts the app definition and triggers a browser download.
 */
export function downloadAppDefinition() {
  try {
    // @ts-ignore: currentApp is available in AppSheet page context
    const app = window.currentApp();
    if (!app || !app.appTemplate) {
      console.error('SEAS: Could not find app definition. Are you in the AppSheet editor?');
      alert('SEAS: Could not find app definition. Are you in the AppSheet editor?');
      return;
    }

    const appTemplate = app.appTemplate;
    const appName = appTemplate.Name || 'app-definition';
    const json = JSON.stringify(appTemplate, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appName}.json`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);

    console.log('SEAS: App definition download triggered successfully.');
  } catch (error) {
    console.error('SEAS: Error downloading app definition:', error);
    alert('SEAS: Error downloading app definition. See console for details.');
  }
}
