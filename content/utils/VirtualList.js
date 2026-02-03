/**
 * VirtualList
 * efficiently renders large lists by only creating DOM nodes for visible items.
 */
export class VirtualList {
  constructor(items, rowHeight, renderRowFn) {
    this.items = items;
    this.rowHeight = rowHeight;
    this.renderRowFn = renderRowFn;
    
    // Config
    this.buffer = 5; // Extra items above/below
    this.pool = [];
    this.activeNodes = new Map(); // index -> node
    
    this.container = document.createElement('div');
    this.container.style.position = 'relative';
    this.container.style.height = '100%';
    this.container.style.overflowY = 'auto'; // Logic handles its own scrolling
    
    // The "Ghost" content to force scrollbar size
    this.content = document.createElement('div');
    this.content.style.position = 'relative';
    this.content.style.height = `${items.length * rowHeight}px`;
    this.container.appendChild(this.content);
    
    this.container.addEventListener('scroll', this.onScroll.bind(this));
    
    // Initial Render
    // We need to wait for container to have height? 
    // Usually VirtualList needs to know viewport height. 
    // Since we put this in 'SeasExplorer', it has 100% height of parent.
    // We might need a resize observer or just render initially assuming a default or check offHeight.
    this.onScroll();
  }
  
  getElement() {
    return this.container;
  }
  
  onScroll() {
    const scrollTop = this.container.scrollTop;
    const viewportHeight = this.container.clientHeight || 500; // Fallback only if invisible
    
    const startIndex = Math.max(0, Math.floor(scrollTop / this.rowHeight) - this.buffer);
    const endIndex = Math.min(
      this.items.length - 1,
      Math.ceil((scrollTop + viewportHeight) / this.rowHeight) + this.buffer
    );
    
    // Identification of visible range
    const visibleIndices = new Set();
    for (let i = startIndex; i <= endIndex; i++) {
        visibleIndices.add(i);
    }
    
    // 1. Remove nodes that are no longer visible
    for (const [index, node] of this.activeNodes) {
        if (!visibleIndices.has(index)) {
            node.remove(); // Remove from DOM
            this.pool.push(node); // Add to pool
            this.activeNodes.delete(index);
        }
    }
    
    // 2. Add nodes that are now visible
    for (let i = startIndex; i <= endIndex; i++) {
        if (!this.activeNodes.has(i)) {
            let node;
            if (this.pool.length > 0) {
                node = this.pool.pop();
            } else {
                // Determine type for correct pooling? 
                // SeasNode re-uses same element basically, passing data.
                // Our 'renderRowFn' usually creates a new element.
                // For pooling to work best, we should reuse the element and set data.
                // We'll ask the factory to create one given data, or reuse if we provide an element?
                // For simplicity in V1: we just assume renderRowFn creates fresh if pool empty.
                // But wait, if we pool, we need to *update* the node with new data.
                // PASS: We need a 'updateRowFn' or the renderRowFn needs to handle recycling.
                
                // Let's assume SeasNode has a setter for data.
                node = document.createElement('seas-node');
            }
            
            // Setup Node
            const item = this.items[i];
            const top = i * this.rowHeight;
            
            node.style.position = 'absolute';
            node.style.top = '0'; // We use transform for performance
            node.style.left = '0';
            node.style.width = '100%';
            node.style.height = `${this.rowHeight}px`; // Enforce? Or assume?
            node.style.transform = `translateY(${top}px)`;
            
            // Apply Data
            this.renderRowFn(node, item); 
            
            this.content.appendChild(node);
            this.activeNodes.set(i, node);
        }
    }
  }
}
