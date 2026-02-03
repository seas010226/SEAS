import { SeasExplorer } from './components/SeasExplorer.js';
import { SeasNode } from './components/SeasNode.js';
import { readProperties } from './utils/object-reader.js';

console.log('SEAS: Content script loaded (Main World).');

function waitForApp() {
  if (window.currentApp?.().appTemplate) {
    init();
  } else {
    // TODO: Review polling robustness. Infinite polling is risky, but AppSheet apps can take a long time to load.
    // Consider backing off or a very high max-retry limit.
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
  
  // Find Prev Expandable
  let prevIndex = index - 1;
  let targetPrevIndex = -1;
  while(prevIndex >= 0) {
    if (nodes[prevIndex].getAttribute('expandable') === 'true') {
      targetPrevIndex = prevIndex;
      break;
    }
    prevIndex--;
  }

  if (targetPrevIndex !== -1) {
    navHandlers.onPrev = () => {
      navigateToNode(nodes, targetPrevIndex, explorer, 'replace', 'prev');
    };
  }

  // Find Next Expandable
  let nextIndex = index + 1;
  let targetNextIndex = -1;
  while(nextIndex < nodes.length) {
    if (nodes[nextIndex].getAttribute('expandable') === 'true') {
      targetNextIndex = nextIndex;
      break;
    }
    nextIndex++;
  }

  if (targetNextIndex !== -1) {
    navHandlers.onNext = () => {
      navigateToNode(nodes, targetNextIndex, explorer, 'replace', 'next');
    };
  }

  if (mode === 'push') {
    explorer.pushView(newList, key, navHandlers);
  } else {
    explorer.replaceView(newList, key, navHandlers, direction);
  }
}

waitForApp();
