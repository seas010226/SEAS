import { readProperties } from '../utils/object-reader.js';

export class SeasNode extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['key', 'type', 'expandable'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.addEventListener('click', this.handleClick.bind(this));
    this.render();
  }

  handleClick(e) {
    const isExpandable = this.getAttribute('expandable') === 'true';
    if (isExpandable) {
      console.log('SeasNode: Clicked!', this.getAttribute('key'));
      this.handleExpand(e);
    }
  }

  set data(value) {
    this._data = value;
    // Setter triggers render, which uses current attributes
    this.render(); 
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
          padding: 6px 12px;
          border-bottom: 1px solid #3c4043;
          cursor: ${isExpandable ? 'pointer' : 'default'};
          background: #202124;
          font-family: 'Roboto', sans-serif;
          transition: background 0.1s;
        }
        :host(:hover) {
          background: #292a2d;
        }
        /* ... existing styles ... */
        .container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 24px;
        }
        .left {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow: hidden;
        }
        .icon {
          width: 16px;
          height: 16px;
          fill: #9aa0a6;
          flex-shrink: 0;
        }
        .key {
          color: #e8eaed;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .value {
          color: #9aa0a6;
          font-size: 12px;
          font-family: 'Roboto Mono', monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }
        .chevron {
          width: 16px;
          height: 16px;
          fill: #5f6368;
          visibility: ${isExpandable ? 'visible' : 'hidden'};
        }
      </style>
      <div class="container">
        <div class="left">
          ${this.getIcon(type)}
          <span class="key" title="${key}">${key}</span>
        </div>
        <div class="right">
          <span class="value">${this.formatValue(this._data, type)}</span>
          <svg class="chevron" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </div>
      </div>
    `;
    
    // No more addEventListener here
  }

  getIcon(type) {
    const icons = {
      'object': '<svg class="icon" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2.06 11L15 15.28 12.06 17l.78-3.33-2.59-2.24 3.41-.29L15 8l1.34 3.14 3.41.29-2.59 2.24.78 3.33z"/></svg>', // Folder-ish
      'array': '<svg class="icon" viewBox="0 0 24 24"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>', // List
      'function': '<svg class="icon" viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>', // Code
      'string': '<svg class="icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>', // Quote-ish (Help for now)
      'default': '<svg class="icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>' // Doc
    };
    return icons[type] || icons['default'];
  }

  formatValue(val, type) {
    if (type === 'function') return '';
    if (type === 'object' || type === 'array') return '';
    if (type === 'string') return `"${val}"`;
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
