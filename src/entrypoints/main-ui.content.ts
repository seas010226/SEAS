import { mount } from "svelte";
import Explorer from "@features/app-explorer/ui/Explorer.svelte";
// @ts-ignore
import mainUiStyles from "../assets/explorer.css?inline";

export default defineContentScript({
  matches: ["*://*.appsheet.com/*"],
  world: "MAIN",
  main() {
    // Create host for the Shadow DOM
    const host = document.createElement("div");
    host.id = "seas-explorer-host";
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    // Inject the extension's CSS into the Shadow Root as a style tag
    // This avoids using browser.runtime.getURL which is not available in the MAIN world
    const style = document.createElement("style");
    style.textContent = mainUiStyles;
    shadow.appendChild(style);

    // Create a mounting point inside the shadow root
    const mountPoint = document.createElement("div");
    shadow.appendChild(mountPoint);

    // Mount the Svelte app
    // Visibility is handled internally by the component listening for events
    mount(Explorer, {
      target: mountPoint,
      props: { visible: false },
    });
  },
});
