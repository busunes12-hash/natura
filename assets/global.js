/* ==========================================================================
   🌿 MATERIA DTC SKINCARE THEME - GLOBAL WEB COMPONENTS & MOTION
   Pure ES6 Native Web Components & Micro-Interactions (Zero jQuery)
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
    this.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.querySelectorAll(`[aria-controls="${this.id}"]`).forEach(btn => btn.setAttribute('aria-expanded', 'true'));
  }

  close() {
    this.classList.remove('is-active');
    this.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.querySelectorAll(`[aria-controls="${this.id}"]`).forEach(btn => btn.setAttribute('aria-expanded', 'false'));
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
    this.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.querySelectorAll(`[aria-controls="${this.id}"]`).forEach(btn => btn.setAttribute('aria-expanded', 'true'));
  }

  close() {
    this.classList.remove('is-active');
    this.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.querySelectorAll(`[aria-controls="${this.id}"]`).forEach(btn => btn.setAttribute('aria-expanded', 'false'));
  }
}
customElements.define('modal-dialog', ModalDialog);

/* 4. IntersectionObserver Scroll Reveal Manager */
class ScrollRevealManager {
  static init() {
    const reveals = document.querySelectorAll('.reveal-on-scroll');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveals.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach((el) => observer.observe(el));
  }
}

/* 5. Smooth Lazy Image Load Manager */
class ImageLoadManager {
  static init() {
    document.querySelectorAll('img').forEach((img) => {
      if (img.complete) {
        img.classList.add('is-loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('is-loaded'));
      }
    });
  }
}

/* 6. Product Gallery Thumbnail Switcher */
class ProductGallery {
  static init() {
    document.querySelectorAll('.thumbnail-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const targetSrc = btn.getAttribute('data-image-src');
        const mainImg = document.querySelector('.main-image-wrapper img');
        if (mainImg && targetSrc) {
          mainImg.src = targetSrc;
          document.querySelectorAll('.thumbnail-btn').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
        }
      });
    });
  }
}

/* 7. Custom Variant Pill Selector */
class VariantPillPicker {
  static init() {
    document.querySelectorAll('.variant-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const variantId = pill.getAttribute('data-variant-id');
        const hiddenInput = document.querySelector('input[name="id"]');
        const submitBtn = document.querySelector('.product-form [data-quick-add]');

        if (hiddenInput && variantId) {
          hiddenInput.value = variantId;
        }
        if (submitBtn && variantId) {
          submitBtn.setAttribute('data-quick-add', variantId);
        }

        const parent = pill.closest('.variant-pills');
        if (parent) {
          parent.querySelectorAll('.variant-pill').forEach(p => p.classList.remove('is-active'));
        }
        pill.classList.add('is-active');
      });
    });
  }
}

/* 8. RTL Enforcer */
class RTLEnforcer {
  static init() {
    if (document.documentElement.getAttribute('dir') !== 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  RTLEnforcer.init();
  ScrollRevealManager.init();
  ImageLoadManager.init();
  ProductGallery.init();
  VariantPillPicker.init();

  window.addEventListener('cart:updated', () => {
    const cartDrawer = document.querySelector('drawer-component#CartDrawer');
    if (cartDrawer) {
      cartDrawer.open();
    }
  });
});

