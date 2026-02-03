import { SeasExplorer } from './components/SeasExplorer.js';
import { SeasNode } from './components/SeasNode.js';
import { readProperties } from './utils/object-reader.js';
import { VirtualList } from './utils/VirtualList.js';

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

  const listContainer = createVirtualList(initialProps);
  
  // Initial view has no siblings to navigate to
  explorer.pushView(listContainer, 'App Definition');

  explorer.addEventListener('seas-navigate', (e) => {
    handleNavigate(e, explorer);
  });
}

function createVirtualList(props) {
  // Row height Estimate: SeasNode padding(8+8) + content ~35-40px?
  // Let's check CSS:
  // padding 8px 12px. line-height normal (~1.2em?).
  // Font 13px + 12px.
  // Container: flex align center.
  // It seems roughly 36px or 40px. Let's pick 36px for now.
  const ROW_HEIGHT = 36;
  
  const vList = new VirtualList(props, ROW_HEIGHT, (node, prop) => {
    node.setAttribute('key', prop.key);
    node.setAttribute('type', prop.type);
    node.setAttribute('expandable', String(prop.isExpandable));
    node.data = prop.value;
  });
  
  const container = vList.getElement();
  container._seasProps = props; // Store full props for navigation lookup
  
  return container;
}

function handleNavigate(e, explorer) {
  // e.target is retargeted to the Shadow Host (seas-explorer) because of Shadow DOM.
  // We must use the explicit node passed in detail.
  const clickedNode = e.detail.node;
  
  // In VirtualList, the node is inside 'content' div, inside 'container' div.
  // But we don't rely on parent structure for data.
  // We rely on the *path* or just passing the navigation logic.
  
  // WAIT. 'handleNavigate' logic utilized `listContainer.children` to find SIBLINGS.
  // With VirtualList, DOM siblings DO NOT EXIST for off-screen items.
  // We CANNOT use DOM Traversal to find next/prev keys anymore.
  // We MUST pass the full property list (context) to the navigation handler or lookup.
  
  // To fix this:
  // 1. When we create the VirtualList, we have the 'props' array.
  // 2. We can't attach it to the DOM node easily without leaking.
  // 3. Or, `SeasNode` fires event. 
  // 4. We need to know WHICH index in the 'props' array this node corresponds to.
  //    Fortunately, `VirtualList` can tell us index? Or we can look up by key?
  //    Keys might not be unique in some weird structures, but usually are in object. Arrays? indices.
  
  // Solution:
  // We need to look up the clicked prop in the *source list*.
  // But we handled 'navigate' globally on the explorer.
  // We don't have access to the 'props' array of the *current view* here easily, 
  // *unless* we stored it on the view element or something.
  
  // Refactor: Store 'props' on the container?
  // listContainer.dataset.props? No, too big.
  // listContainer._props = props;
  
  const listContainer = getVirtualContainer(clickedNode);
  const props = listContainer?._seasProps || [];
  
  // Find index in the PROPS array, not DOM
  const clickedKey = clickedNode.getAttribute('key');
  // Matching by reference might be hard if we use objects.
  // We passed `prop.value` to node.data.
  // Let's use referencing the original prop object?
  // Or just find index by key?
  
  const currentIndex = props.findIndex(p => p.key === clickedKey);
  
  navigateToNode(props, currentIndex, explorer, 'push');
}

function getVirtualContainer(node) {
  // node -> content -> container
  if (node.parentElement?.parentElement?._seasProps) return node.parentElement.parentElement;
  return null;
}

/**
 * Common function to load a node and set up sibling navigation
 * @param {Array} allProps - Array of property objects (NOT nodes)
 * @param {number} index - Index of the target node
 * @param {SeasExplorer} explorer 
 * @param {string} mode - 'push' or 'replace'
 * @param {string} direction - 'next' or 'prev' (for animation)
 */
function navigateToNode(allProps, index, explorer, mode = 'push', direction = 'next') {
  const targetProp = allProps[index];
  if (!targetProp) return;

  const key = targetProp.key;
  const targetData = targetProp.value;
  const newProps = readProperties(targetData);
  
  const newList = createVirtualList(newProps);
  newList._seasProps = newProps; // Store for Sibling Lookup
  
  // Define Handlers
  const navHandlers = {};
  
  // Find Prev Expandable
  let prevIndex = index - 1;
  let targetPrevIndex = -1;
  while(prevIndex >= 0) {
    if (allProps[prevIndex].isExpandable) { // Use Prop data, not DOM attribute
      targetPrevIndex = prevIndex;
      break;
    }
    prevIndex--;
  }

  if (targetPrevIndex !== -1) {
    navHandlers.onPrev = () => {
      navigateToNode(allProps, targetPrevIndex, explorer, 'replace', 'prev');
    };
  }

  // Find Next Expandable
  let nextIndex = index + 1;
  let targetNextIndex = -1;
  while(nextIndex < allProps.length) {
    if (allProps[nextIndex].isExpandable) {
      targetNextIndex = nextIndex;
      break;
    }
    nextIndex++;
  }

  if (targetNextIndex !== -1) {
    navHandlers.onNext = () => {
      navigateToNode(allProps, targetNextIndex, explorer, 'replace', 'next');
    };
  }

  if (mode === 'push') {
    explorer.pushView(newList, key, navHandlers);
  } else {
    explorer.replaceView(newList, key, navHandlers, direction);
  }
}

waitForApp();
