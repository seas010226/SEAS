import { Zip, ZipPassThrough } from 'fflate';
import { yieldifyJSON } from './stream-writer';
import { SEASToast } from '@shared/ui/toast';

/**
 * This function is executed in the MAIN world (page context).
 * It extracts the app definition and streams a ZIP-compressed download.
 */
export async function downloadAppDefinition() {
  const toast = new SEASToast();
  
  try {
    // @ts-ignore: currentApp is available in AppSheet page context
    const app = window.currentApp();
    if (!app || !app.appTemplate) {
      toast.show('SEAS: Could not find app definition.');
      setTimeout(() => toast.hide(), 3000);
      return;
    }

    const appTemplate = app.appTemplate;
    const appName = appTemplate.Name || 'app-definition';
    
    // 1. Request file handle (Must be called before any async work to preserve user gesture)
    let fileHandle;
    try {
      // @ts-ignore: showSaveFilePicker is a modern API
      fileHandle = await window.showSaveFilePicker({
        suggestedName: `${appName}.json.zip`,
        types: [{
          description: 'ZIP Archive',
          accept: { 'application/zip': ['.zip'] },
        }],
      });
    } catch (err) {
      // User cancelled
      return;
    }

    toast.show('Preparing ZIP download...');

    // 2. Setup the fflate ZIP streaming pipeline
    // @ts-ignore
    const writableFileStream = await fileHandle.createWritable();
    
    // We need to track writes to ensure they complete before closing
    let writePromise = Promise.resolve();

    // Setup ZIP container
    const zip = new Zip((err, data, final) => {
      if (err) {
        console.error('SEAS: Zip error:', err);
        return;
      }
      // Chain the write promises to handle the stream asynchronously
      writePromise = writePromise.then(() => writableFileStream.write(data));
      
      if (final) {
        writePromise = writePromise.then(() => writableFileStream.close());
      }
    });

    // Create the JSON file inside the ZIP
    const jsonFile = new ZipPassThrough(`${appName}.json`);
    zip.add(jsonFile);

    const encoder = new TextEncoder();
    let totalBytesProcessed = 0;
    let lastUpdate = Date.now();

    // 3. Run the yielding generator
    for await (const chunk of yieldifyJSON(appTemplate)) {
      const bytes = encoder.encode(chunk);
      jsonFile.push(bytes);
      
      totalBytesProcessed += bytes.length;
      
      // Update UI every 500ms
      if (Date.now() - lastUpdate > 500) {
        const mb = (totalBytesProcessed / (1024 * 1024)).toFixed(1);
        toast.update(`Processed: ${mb} MB...`);
        lastUpdate = Date.now();
      }
    }

    // 4. Finalize
    jsonFile.push(new Uint8Array(0), true); // Signal end of file within ZIP
    zip.end(); // Finalize the ZIP archive (writes Central Directory)
    
    // Wait for all writes to finish
    await writePromise;
    
    toast.update('Download complete!');
    setTimeout(() => toast.hide(), 2000);

  } catch (error) {
    console.error('SEAS: Error downloading app definition:', error);
    toast.show('SEAS: Error. See console for details.');
    setTimeout(() => toast.hide(), 5000);
  }
}
