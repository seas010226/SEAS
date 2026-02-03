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
        bottom: 16px;
        right: 16px;
        width: 320px;
        height: 400px;
        background: #202124;
        color: #e8eaed;
        border: 1px solid #5f6368;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 9999;
        font-family: 'Roboto', sans-serif;
      }
      .header {
        padding: 8px 12px;
        background: #292a2d;
        border-bottom: 1px solid #3c4043;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .title {
        font-size: 14px;
        font-weight: 500;
      }
      .back-btn {
        background: transparent;
        border: none;
        color: #8ab4f8;
        cursor: pointer;
        padding: 4px;
      }
      .back-btn:disabled {
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
        transition: transform 0.3s ease;
      }
      /* Transitions */
      .slide-enter { transform: translateX(100%); }
      .slide-active { transform: translateX(0); }
      .slide-exit { transform: translateX(-100%); }
    `;
    this.shadowRoot.appendChild(style);
  }

  render() {
    this.shadowRoot.innerHTML = ''; // Clear for re-render if needed
    this.injectStyles();

    const header = document.createElement('div');
    header.className = 'header';
    
    this.backBtn = document.createElement('button');
    this.backBtn.className = 'back-btn';
    this.backBtn.textContent = '← Back';
    this.backBtn.disabled = true;
    this.backBtn.onclick = () => this.popView();

    this.titleSpan = document.createElement('span');
    this.titleSpan.className = 'title';
    this.titleSpan.textContent = 'App Definition';

    header.appendChild(this.backBtn);
    header.appendChild(this.titleSpan);

    this.viewport = document.createElement('div');
    this.viewport.className = 'content-viewport';

    this.shadowRoot.appendChild(header);
    this.shadowRoot.appendChild(this.viewport);
  }

  /**
   * Pushes a new view onto the stack.
   * @param {HTMLElement} viewNode - The content to show (likely a SeasNode list)
   * @param {string} title - Title for the header
   */
  pushView(viewNode, title) {
    // Current active view exits left
    const current = this.stack[this.stack.length - 1];
    if (current) {
      current.view.classList.add('slide-exit');
      current.view.classList.remove('slide-active');
    }

    // New view enters from right
    const wrapper = document.createElement('div');
    wrapper.className = 'slide-view slide-enter';
    wrapper.appendChild(viewNode);
    
    // Force reflow
    void wrapper.offsetWidth;
    
    this.viewport.appendChild(wrapper);
    
    requestAnimationFrame(() => {
      wrapper.classList.remove('slide-enter');
      wrapper.classList.add('slide-active');
    });

    this.stack.push({ view: wrapper, title });
    this.updateHeader(title);
  }

  popView() {
    if (this.stack.length <= 1) return;

    const current = this.stack.pop();
    const prev = this.stack[this.stack.length - 1];

    // Animate out
    current.view.classList.add('slide-enter'); // Slide back to right
    current.view.classList.remove('slide-active');

    // Animate prev in
    prev.view.classList.remove('slide-exit');
    prev.view.classList.add('slide-active');

    // Remove DOM after transition
    setTimeout(() => {
      if (current.view.parentNode) {
        current.view.parentNode.removeChild(current.view);
      }
    }, 300);

    this.updateHeader(prev.title);
  }

  updateHeader(title) {
    this.titleSpan.textContent = title;
    this.backBtn.disabled = this.stack.length <= 1;
  }
}

customElements.define('seas-explorer', SeasExplorer);
