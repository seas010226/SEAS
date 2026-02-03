import { readProperties } from '../utils/object-reader.js';

export class SeasNode extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['key', 'type', 'expandable'];
  }

  connectedCallback() {
    this.render();
  }

  set data(value) {
    this._data = value;
    this.render(); // Re-render with value preview if needed
  }

  get data() {
    return this._data;
  }

  render() {
    const key = this.getAttribute('key') ?? '';
    const type = this.getAttribute('type') ?? 'unknown';
    const isExpandable = this.getAttribute('expandable') === 'true';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 8px 12px;
          border-bottom: 1px solid #3c4043;
          cursor: ${isExpandable ? 'pointer' : 'default'};
          background: #202124;
        }
        :host(:hover) {
          background: #292a2d;
        }
        .container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .key {
          color: #8ab4f8;
          font-family: monospace;
          font-size: 13px;
        }
        .value {
          color: #9aa0a6;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }
        .chevron {
          color: #5f6368;
          font-size: 16px;
          visibility: ${isExpandable ? 'visible' : 'hidden'};
        }
      </style>
      <div class="container">
        <div>
          <span class="key">${key}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="value">${this.formatValue(this._data, type)}</span>
          <span class="chevron">›</span>
        </div>
      </div>
    `;

    if (isExpandable) {
      this.addEventListener('click', this.handleExpand.bind(this));
    }
  }

  formatValue(val, type) {
    if (type === 'function') return 'f()';
    if (type === 'object' || type === 'array') return type;
    return String(val);
  }

  handleExpand(e) {
    e.stopPropagation();
    // Dispatch event to parent Explorer to push new view
    this.dispatchEvent(new CustomEvent('seas-navigate', {
      bubbles: true,
      composed: true,
      detail: {
        target: this._data,
        key: this.getAttribute('key'),
        node: this
      }
    }));
  }
}

customElements.define('seas-node', SeasNode);
