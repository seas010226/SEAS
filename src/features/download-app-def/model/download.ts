import { Zip, ZipPassThrough } from "fflate";
import { yieldifyJSON } from "./stream-writer";
import { SEASToast } from "@shared/ui/toast";

/**
 * This function is executed in the MAIN world (page context).
 * It extracts data and streams a ZIP-compressed download.
 */
export async function downloadJSON(targetData?: any, suggestedName?: string) {
  const toast = new SEASToast();

  try {
    let data = targetData;
    let baseName = suggestedName;

    // If no data provided, default to full app definition
    if (!data) {
      // @ts-ignore
      const app = window.currentApp?.();
      data = app?.appTemplate;
      baseName = data?.Name || "app-definition";
    }

    if (!data) {
      toast.show("SEAS: Could not find JSON data to download.");
      setTimeout(() => toast.hide(), 3000);
      return;
    }

    const fileName = `${baseName}.json`;

    // 1. Request file handle
    let fileHandle;
    try {
      // @ts-ignore
      fileHandle = await window.showSaveFilePicker({
        suggestedName: `${fileName}.zip`,
        types: [
          {
            description: "ZIP Archive",
            accept: { "application/zip": [".zip"] },
          },
        ],
      });
    } catch (err) {
      return;
    }

    toast.show("Preparing JSON download...");

    // 2. Setup the fflate ZIP streaming pipeline
    // @ts-ignore
    const writableFileStream = await fileHandle.createWritable();
    let writePromise = Promise.resolve();

    const zip = new Zip((err, zipData, final) => {
      if (err) {
        console.error("SEAS: Zip error:", err);
        return;
      }
      writePromise = writePromise.then(() => writableFileStream.write(zipData));
      if (final) {
        writePromise = writePromise.then(() => writableFileStream.close());
      }
    });

    const jsonFile = new ZipPassThrough(fileName);
    zip.add(jsonFile);

    const encoder = new TextEncoder();
    let totalBytesProcessed = 0;
    let lastUpdate = Date.now();

    // 3. Run the yielding generator
    for await (const chunk of yieldifyJSON(data)) {
      const bytes = encoder.encode(chunk);
      jsonFile.push(bytes);
      totalBytesProcessed += bytes.length;

      if (Date.now() - lastUpdate > 500) {
        const mb = (totalBytesProcessed / (1024 * 1024)).toFixed(1);
        toast.update(`Processed: ${mb} MB...`);
        lastUpdate = Date.now();
      }
    }

    // 4. Finalize
    jsonFile.push(new Uint8Array(0), true);
    zip.end();
    await writePromise;

    toast.update("JSON download complete!");
    setTimeout(() => toast.hide(), 2000);
  } catch (error) {
    console.error("SEAS: Error downloading JSON:", error);
    toast.show("SEAS: Error. See console for details.");
    setTimeout(() => toast.hide(), 5000);
  }
}
