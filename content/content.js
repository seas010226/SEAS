import { SeasExplorer } from './components/SeasExplorer.js';
import { SeasNode } from './components/SeasNode.js';
import { readProperties } from './utils/object-reader.js';

console.log('SEAS: Content script loaded (Main World).');

function waitForApp() {
  if (window.currentApp && window.currentApp().appTemplate) {
    init();
  } else {
    setTimeout(waitForApp, 1000);
  }
}

function init() {
  console.log('SEAS: App detected. Initializing explorer.');

  const explorer = document.createElement('seas-explorer');
  document.body.appendChild(explorer);

  const appTemplate = window.currentApp().appTemplate;
  const initialProps = readProperties(appTemplate);

  const listContainer = renderList(initialProps);
  
  // Initial view has no siblings to navigate to
  explorer.pushView(listContainer, 'App Definition');

  explorer.addEventListener('seas-navigate', (e) => {
    handleNavigate(e, explorer);
  });
}

function renderList(props) {
  const container = document.createElement('div');
  props.forEach(prop => {
    const node = document.createElement('seas-node');
    node.setAttribute('key', prop.key);
    node.setAttribute('type', prop.type);
    node.setAttribute('expandable', String(prop.isExpandable));
    node.data = prop.value;
    container.appendChild(node);
  });
  return container;
}

function handleNavigate(e, explorer) {
  // e.target is retargeted to the Shadow Host (seas-explorer) because of Shadow DOM.
  // We must use the explicit node passed in detail.
  const clickedNode = e.detail.node;
  const listContainer = clickedNode.parentElement; 
  
  // Get all 'seas-node' siblings in order
  const allNodes = Array.from(listContainer.children).filter(n => n.tagName === 'SEAS-NODE');
  const currentIndex = allNodes.indexOf(clickedNode);
  
  navigateToNode(allNodes, currentIndex, explorer, 'push');
}

/**
 * Common function to load a node and set up sibling navigation
 * @param {Array<HTMLElement>} nodes - Array of sibling seas-node elements
 * @param {number} index - Index of the target node
 * @param {SeasExplorer} explorer 
 * @param {string} mode - 'push' or 'replace'
 * @param {string} direction - 'next' or 'prev' (for animation)
 */
function navigateToNode(nodes, index, explorer, mode = 'push', direction = 'next') {
  const targetNode = nodes[index];
  if (!targetNode) return;

  const key = targetNode.getAttribute('key');
  const targetData = targetNode.data;
  const props = readProperties(targetData);
  const newList = renderList(props);

  // Define Handlers
  const navHandlers = {};
  
  // Prev Handler
  if (index > 0) {
    navHandlers.onPrev = () => {
      // Find previous expandable node? Or just previous node?
      // Assuming we navigate to *any* sibling, but usually we only want expandable ones?
      // For now, let's navigate to immediate sibling.
      // If sibling is NOT expandable, we might show a "leaf" view or skip it.
      // Let's assume we skip non-expandable siblings for now or show them.
      
      // Let's try recursive check for previous expandable sibling
      let prevIndex = index - 1;
      while(prevIndex >= 0) {
        if (nodes[prevIndex].getAttribute('expandable') === 'true') {
          navigateToNode(nodes, prevIndex, explorer, 'replace', 'prev');
          break;
        }
        prevIndex--;
      }
    };
  }

  // Next Handler
  if (index < nodes.length - 1) {
    navHandlers.onNext = () => {
      let nextIndex = index + 1;
      while(nextIndex < nodes.length) {
        if (nodes[nextIndex].getAttribute('expandable') === 'true') {
          navigateToNode(nodes, nextIndex, explorer, 'replace', 'next');
          break;
        }
        nextIndex++;
      }
    };
  }

  if (mode === 'push') {
    explorer.pushView(newList, key, navHandlers);
  } else {
    explorer.replaceView(newList, key, navHandlers, direction);
  }
}

waitForApp();
