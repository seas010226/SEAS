export class SeasExplorer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stack = []; // View stack
  }

  connectedCallback() {
    this.render();
    this.injectStyles();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        position: fixed;
        top: 0;
        right: 0;
        width: 350px;
        height: 100vh;
        background: #202124;
        color: #e8eaed;
        border-left: 1px solid #5f6368;
        box-shadow: -2px 0 6px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 9999;
        font-family: 'Roboto', sans-serif;
      }
      .header {
        padding: 12px;
        background: #292a2d;
        border-bottom: 1px solid #3c4043;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .title {
        font-size: 14px;
        font-weight: 500;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
      }
      button {
        background: transparent;
        border: none;
        color: #8ab4f8;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
      }
      button:hover:not(:disabled) {
        background: rgba(138, 180, 248, 0.1);
      }
      button:disabled {
        color: #5f6368;
        cursor: default;
      }
      .content-viewport {
        flex: 1;
        position: relative;
        overflow: hidden;
      }
      .slide-view {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        background: #202124;
        transition: transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
      }
      /* Transitions */
      .slide-enter-right { transform: translateX(100%); }
      .slide-enter-left { transform: translateX(-100%); }
      .slide-active { transform: translateX(0); }
      .slide-exit-left { transform: translateX(-100%); }
      .slide-exit-right { transform: translateX(100%); }
    `;
    this.shadowRoot.appendChild(style);
  }

  render() {
    this.shadowRoot.innerHTML = '';
    this.injectStyles();

    const header = document.createElement('div');
    header.className = 'header';
    
    // Back Button
    this.backBtn = document.createElement('button');
    this.backBtn.textContent = '←';
    this.backBtn.title = 'Back';
    this.backBtn.disabled = true;
    this.backBtn.onclick = () => this.popView();

    // Prev Sibling
    this.prevBtn = document.createElement('button');
    this.prevBtn.textContent = '‹';
    this.prevBtn.title = 'Previous';
    this.prevBtn.disabled = true;
    this.prevBtn.onclick = () => this.handleLateral('prev');

    // Title
    this.titleSpan = document.createElement('span');
    this.titleSpan.className = 'title';
    this.titleSpan.textContent = 'App Definition';

    // Next Sibling
    this.nextBtn = document.createElement('button');
    this.nextBtn.textContent = '›';
    this.nextBtn.title = 'Next';
    this.nextBtn.disabled = true;
    this.nextBtn.onclick = () => this.handleLateral('next');

    header.appendChild(this.backBtn);
    header.appendChild(this.prevBtn);
    header.appendChild(this.titleSpan);
    header.appendChild(this.nextBtn);

    this.viewport = document.createElement('div');
    this.viewport.className = 'content-viewport';

    this.shadowRoot.appendChild(header);
    this.shadowRoot.appendChild(this.viewport);
  }

  connectedCallback() {
    // Squeeze the Body
    document.body.style.marginRight = '350px';
    document.body.style.transition = 'margin-right 0.3s ease';
    
    this.render();
    this.injectStyles();
  }

  disconnectedCallback() {
    // Release the Body
    document.body.style.marginRight = '';
  }

  /**
   * Pushes a new view onto the stack.
   * @param {HTMLElement} viewNode
   * @param {string} title
   * @param {Object} navHandlers - { onNext: fn, onPrev: fn }
   */
  pushView(viewNode, title, navHandlers = {}) {
    this.transitionView(viewNode, title, navHandlers, 'push');
  }

  /**
   * Replaces the current view (Lateral Navigation).
   * @param {HTMLElement} viewNode 
   * @param {string} title 
   * @param {Object} navHandlers 
   * @param {string} direction - 'next' or 'prev'
   */
  replaceView(viewNode, title, navHandlers, direction) {
    this.transitionView(viewNode, title, navHandlers, 'replace', direction);
  }

  transitionView(viewNode, title, navHandlers, mode, direction = 'next') {
    const current = this.stack[this.stack.length - 1];

    if (mode === 'push' && current) {
      current.view.classList.add('slide-exit-left');
      current.view.classList.remove('slide-active');
    } else if (mode === 'replace' && current) {
      // Exit opposite to entry
      const exitClass = direction === 'next' ? 'slide-exit-left' : 'slide-exit-right';
      current.view.classList.add(exitClass);
      current.view.classList.remove('slide-active');
      
      // Clean up replaced view
      setTimeout(() => {
        if (current.view.parentNode) current.view.remove();
      }, 300);
    }

    // Prepare new view
    const wrapper = document.createElement('div');
    
    // Determine entry animation
    let enterClass = 'slide-enter-right'; // Default push
    if (mode === 'replace') {
      enterClass = direction === 'next' ? 'slide-enter-right' : 'slide-enter-left';
    }
    
    wrapper.className = `slide-view ${enterClass}`;
    wrapper.appendChild(viewNode);
    
    void wrapper.offsetWidth; // Force Reflow
    this.viewport.appendChild(wrapper);
    
    requestAnimationFrame(() => {
      wrapper.classList.remove(enterClass);
      wrapper.classList.add('slide-active');
    });

    const viewState = { view: wrapper, title, navHandlers };

    if (mode === 'push') {
      this.stack.push(viewState);
    } else {
      // Replace top of stack
      this.stack[this.stack.length - 1] = viewState;
    }

    this.updateHeader(title, navHandlers);
  }

  popView() {
    if (this.stack.length <= 1) return;

    const current = this.stack.pop();
    const prev = this.stack[this.stack.length - 1];

    // Animate out (Always exit right on pop)
    current.view.classList.add('slide-enter-right'); // Helper class abuse: move to right
    current.view.classList.remove('slide-active');

    // Animate prev in (Enter from left)
    prev.view.classList.remove('slide-exit-left');
    prev.view.classList.remove('slide-exit-right'); // Ensure clean state
    prev.view.classList.add('slide-active');

    setTimeout(() => {
      if (current.view.parentNode) current.view.remove();
    }, 300);

    this.updateHeader(prev.title, prev.navHandlers);
  }

  handleLateral(direction) {
    const current = this.stack[this.stack.length - 1];
    if (!current?.navHandlers) return;

    if (direction === 'next' && current.navHandlers.onNext) {
      current.navHandlers.onNext();
    } else if (direction === 'prev' && current.navHandlers.onPrev) {
      current.navHandlers.onPrev();
    }
  }

  updateHeader(title, handlers = {}) {
    this.titleSpan.textContent = title;
    this.backBtn.disabled = this.stack.length <= 1;
    this.nextBtn.disabled = !handlers.onNext;
    this.prevBtn.disabled = !handlers.onPrev;
  }
}

customElements.define('seas-explorer', SeasExplorer);
