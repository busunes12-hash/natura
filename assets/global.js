/* ==========================================================================
   🌿 MATERIA DTC SKINCARE THEME - GLOBAL WEB COMPONENTS
   Pure ES6 Native Web Components (Zero jQuery dependency)
   ========================================================================== */

/* 1. Quantity Input Web Component */
class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });

    this.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', this.onButtonClick.bind(this));
    });
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = parseInt(this.input.value, 10);
    const step = parseInt(this.input.step || 1, 10);
    const min = parseInt(this.input.min || 1, 10);
    const max = parseInt(this.input.max || 99, 10);

    if (event.currentTarget.name === 'plus') {
      if (previousValue < max) this.input.value = previousValue + step;
    } else if (event.currentTarget.name === 'minus') {
      if (previousValue > min) this.input.value = previousValue - step;
    }

    if (previousValue !== parseInt(this.input.value, 10)) {
      this.input.dispatchEvent(this.changeEvent);
    }
  }
}
customElements.define('quantity-input', QuantityInput);

/* 2. Drawer Component (Cart Drawer & Mobile Nav) */
class DrawerComponent extends HTMLElement {
  constructor() {
    super();
    this.overlay = this.querySelector('.drawer-overlay');
    this.closeButtons = this.querySelectorAll('[data-drawer-close]');

    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }
    this.closeButtons.forEach((btn) => btn.addEventListener('click', () => this.close()));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.classList.contains('is-active')) {
        this.close();
      }
    });
  }

  open() {
    this.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.classList.remove('is-active');
    document.body.style.overflow = '';
  }
}
customElements.define('drawer-component', DrawerComponent);

/* 3. Modal Dialog Web Component */
class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.overlay = this.querySelector('.modal-overlay');
    this.closeButtons = this.querySelectorAll('[data-modal-close]');

    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }
    this.closeButtons.forEach((btn) => btn.addEventListener('click', () => this.close()));
  }

  open() {
    this.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.classList.remove('is-active');
    document.body.style.overflow = '';
  }
}
customElements.define('modal-dialog', ModalDialog);

/* 4. RTL Enforcer */
class RTLEnforcer {
  static init() {
    if (document.documentElement.getAttribute('dir') !== 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
    }
  }
}
document.addEventListener('DOMContentLoaded', () => RTLEnforcer.init());
