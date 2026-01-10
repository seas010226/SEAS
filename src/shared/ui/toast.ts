/**
 * Simple, self-contained toast utility for injected UI.
 */
export class SEASToast {
  private el: HTMLDivElement;
  private messageEl: HTMLSpanElement;

  constructor() {
    this.el = document.createElement('div');
    this.el.id = 'seas-toast';
    
    // Inline styles to avoid external CSS dependencies in injected context
    Object.assign(this.el.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '12px 20px',
      backgroundColor: '#323232',
      color: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      zIndex: '999999',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      opacity: '0',
      transform: 'translateY(10px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      pointerEvents: 'none',
    });

    this.messageEl = document.createElement('span');
    this.el.appendChild(this.messageEl);

    document.body.appendChild(this.el);
  }

  show(message: string) {
    this.messageEl.textContent = message;
    this.el.style.opacity = '1';
    this.el.style.transform = 'translateY(0)';
  }

  update(message: string) {
    this.messageEl.textContent = message;
  }

  hide() {
    this.el.style.opacity = '0';
    this.el.style.transform = 'translateY(10px)';
    setTimeout(() => {
      if (this.el.parentNode) {
        document.body.removeChild(this.el);
      }
    }, 300);
  }
}

export function showToast(message: string, duration = 3000): SEASToast {
  const toast = new SEASToast();
  toast.show(message);
  if (duration > 0) {
    setTimeout(() => toast.hide(), duration);
  }
  return toast;
}
