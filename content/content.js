import { SeasExplorer } from './components/SeasExplorer.js';
import { SeasNode } from './components/SeasNode.js';
import { readProperties } from './utils/object-reader.js';

console.log('SEAS: Content script loaded (Main World).');

// Wait for AppSheet to be ready (rudimentary check)
function waitForApp() {
  if (window.currentApp && window.currentApp().appTemplate) {
    init();
  } else {
    setTimeout(waitForApp, 1000);
  }
}

function init() {
  console.log('SEAS: App detected. Initializing explorer.');

  // Create Explorer instance
  const explorer = document.createElement('seas-explorer');
  document.body.appendChild(explorer);

  // Initial Data Load
  const appTemplate = window.currentApp().appTemplate;
  const initialProps = readProperties(appTemplate);

  // Create initial view (list of nodes)
  const listContainer = document.createElement('div');
  
  initialProps.forEach(prop => {
    const node = document.createElement('seas-node');
    node.setAttribute('key', prop.key);
    node.setAttribute('type', prop.type);
    node.setAttribute('expandable', String(prop.isExpandable));
    node.data = prop.value;
    listContainer.appendChild(node);
  });

  explorer.pushView(listContainer, 'App Definition');

  // Handle Navigation Events
  explorer.addEventListener('seas-navigate', (e) => {
    const { target, key } = e.detail;
    const props = readProperties(target);
    
    const newList = document.createElement('div');
    props.forEach(p => {
      const node = document.createElement('seas-node');
      node.setAttribute('key', p.key);
      node.setAttribute('type', p.type);
      node.setAttribute('expandable', String(p.isExpandable));
      node.data = p.value;
      newList.appendChild(node);
    });

    explorer.pushView(newList, key);
  });
}

// Start polling
waitForApp();
