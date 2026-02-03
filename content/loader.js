/**
 * SEAS Loader
 * Injects the main content script as a module to support ES6 imports/exports
 * in the Main World.
 */
(function() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('content/content.js');
  script.type = 'module';
  
  // Clean up script tag after loading to keep DOM clean
  script.onload = () => {
    script.remove();
  };
  
  (document.head || document.documentElement).appendChild(script);
})();
