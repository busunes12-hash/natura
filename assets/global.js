/* ==========================================================================
   🌿 NATURA DTC SKINCARE THEME - GLOBAL WEB COMPONENTS & MOTION
   Phase 2: Focus trap in DrawerComponent, badge bump animation hook,
            improved scroll reveal, variant picker
   Pure ES6 Native Web Components — Zero jQuery
   ========================================================================== */

/* ==========================================================================
   1. QuantityInput Web Component
   ========================================================================== */
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
    const min  = parseInt(this.input.min  || 1, 10);
    const max  = parseInt(this.input.max  || 99, 10);

    if (event.currentTarget.name === 'plus' && previousValue < max) {
      this.input.value = previousValue + step;
    } else if (event.currentTarget.name === 'minus' && previousValue > min) {
      this.input.value = previousValue - step;
    }

    if (previousValue !== parseInt(this.input.value, 10)) {
      this.input.dispatchEvent(this.changeEvent);
    }
  }
}
customElements.define('quantity-input', QuantityInput);

/* ==========================================================================
   2. DrawerComponent Web Component
   Manages: open/close state, body scroll lock, focus trap, Escape key
   ========================================================================== */
class DrawerComponent extends HTMLElement {
  constructor() {
    super();
    this.overlay     = this.querySelector('.drawer-overlay');
    this.closeButtons = this.querySelectorAll('[data-drawer-close]');
    this._boundKeydown = this._onKeydown.bind(this);

    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }
    this.closeButtons.forEach((btn) => btn.addEventListener('click', () => this.close()));
  }

  /* Focus trap helper: get all keyboard-focusable elements inside drawer */
  _getFocusable() {
    return Array.from(this.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.closest('[aria-hidden="true"]'));
  }

  _onKeydown(e) {
    if (e.key === 'Escape') {
      this.close();
      return;
    }

    /* Focus trap: Tab key cycles within drawer */
    if (e.key === 'Tab') {
      const focusable = this._getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  open() {
    this.classList.add('is-active');
    this.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this._boundKeydown);

    /* Update all trigger buttons */
    document.querySelectorAll(`[aria-controls="${this.id}"]`)
      .forEach(btn => btn.setAttribute('aria-expanded', 'true'));

    /* Move focus to first focusable element inside drawer */
    requestAnimationFrame(() => {
      const focusable = this._getFocusable();
      if (focusable.length) focusable[0].focus();
    });
  }

  close() {
    this.classList.remove('is-active');
    this.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._boundKeydown);

    /* Update all trigger buttons + restore focus */
    const triggers = document.querySelectorAll(`[aria-controls="${this.id}"]`);
    triggers.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    /* Return focus to the trigger that opened this drawer */
    if (triggers.length) triggers[triggers.length - 1].focus();
  }
}
customElements.define('drawer-component', DrawerComponent);

/* ==========================================================================
   3. ModalDialog Web Component
   ========================================================================== */
class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.overlay      = this.querySelector('.modal-overlay');
    this.closeButtons = this.querySelectorAll('[data-modal-close]');
    this._boundKeydown = (e) => { if (e.key === 'Escape') this.close(); };

    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }
    this.closeButtons.forEach((btn) => btn.addEventListener('click', () => this.close()));
  }

  open() {
    this.classList.add('is-active');
    this.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this._boundKeydown);
    document.querySelectorAll(`[aria-controls="${this.id}"]`)
      .forEach(btn => btn.setAttribute('aria-expanded', 'true'));
  }

  close() {
    this.classList.remove('is-active');
    this.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._boundKeydown);
    document.querySelectorAll(`[aria-controls="${this.id}"]`)
      .forEach(btn => btn.setAttribute('aria-expanded', 'false'));
  }
}
customElements.define('modal-dialog', ModalDialog);

/* ==========================================================================
   4. ScrollRevealManager — IntersectionObserver with stagger support
   ========================================================================== */
class ScrollRevealManager {
  static init() {
    const reveals = document.querySelectorAll('.reveal-on-scroll');

    /* Skip animation for reduced-motion users */
    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
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
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

    reveals.forEach((el) => observer.observe(el));
  }
}

/* ==========================================================================
   5. ImageLoadManager — Smooth lazy load fade-in
   ========================================================================== */
class ImageLoadManager {
  static init() {
    document.querySelectorAll('img').forEach((img) => {
      if (img.complete) {
        img.classList.add('is-loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
        img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true }); /* prevent stuck opacity:0 */
      }
    });
  }
}

/* ==========================================================================
   6. ProductGallery — Thumbnail switcher
   ========================================================================== */
class ProductGallery {
  static init() {
    document.querySelectorAll('.thumbnail-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetSrc = btn.getAttribute('data-image-src');
        const targetAlt = btn.getAttribute('data-image-alt') || '';
        const mainImg   = document.querySelector('.main-image-wrapper img');
        if (mainImg && targetSrc) {
          mainImg.classList.remove('is-loaded');
          mainImg.src = targetSrc;
          mainImg.alt = targetAlt;
          document.querySelectorAll('.thumbnail-btn').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
        }
      });
    });
  }
}

/* ==========================================================================
   7. VariantPillPicker — Custom pill selector
   ========================================================================== */
class VariantPillPicker {
  static init() {
    document.querySelectorAll('.variant-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const variantId  = pill.getAttribute('data-variant-id');
        const hiddenInput = document.querySelector('input[name="id"]');
        const submitBtn  = document.querySelector('.product-form [data-quick-add]');

        if (hiddenInput && variantId) hiddenInput.value = variantId;
        if (submitBtn  && variantId) submitBtn.setAttribute('data-quick-add', variantId);

        const parent = pill.closest('.variant-pills');
        if (parent) {
          parent.querySelectorAll('.variant-pill').forEach(p => p.classList.remove('is-active'));
          parent.querySelectorAll('.variant-pill').forEach(p => p.setAttribute('aria-pressed', 'false'));
        }
        pill.classList.add('is-active');
        pill.setAttribute('aria-pressed', 'true');
      });
    });
  }
}

/* ==========================================================================
   8. RTLEnforcer — Guarantee direction attribute is set
   ========================================================================== */
class RTLEnforcer {
  static init() {
    if (document.documentElement.getAttribute('dir') !== 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    }
  }
}

/* ==========================================================================
   9. AccordionManager — Accessible accordion/FAQ collapse
   ========================================================================== */
class AccordionManager {
  static init() {
    document.querySelectorAll('[data-accordion-trigger]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const target   = document.getElementById(trigger.getAttribute('aria-controls'));
        const expanded = trigger.getAttribute('aria-expanded') === 'true';

        trigger.setAttribute('aria-expanded', String(!expanded));
        if (target) {
          target.hidden = expanded;
          target.style.maxHeight = expanded ? '0' : target.scrollHeight + 'px';
        }
      });
    });
  }
}

/* ==========================================================================
   10. ScrollToCODManager — Smooth scroll mobile sticky CTA to COD form
   ========================================================================== */
class ScrollToCODManager {
  static init() {
    document.querySelectorAll('[data-scroll-to-cod]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const codForm = document.getElementById('QuickCODForm') || document.getElementById('DirectCODExpressForm');
        if (codForm) {
          const offsetTop = codForm.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });

          // Focus first empty required input field
          setTimeout(() => {
            const emptyInput = codForm.querySelector('input[required]:placeholder-shown, select[required]:has(option[value=""]:checked)');
            if (emptyInput) {
              emptyInput.focus();
            } else {
              const nameInput = document.getElementById('CodCustomerName');
              if (nameInput) nameInput.focus();
            }
          }, 450);
        }
      });
    });
  }
}

/* ==========================================================================
   11. LightboxZoomManager — Product image high-res zoom lightbox
   ========================================================================== */
class LightboxZoomManager {
  static init() {
    const mainImg = document.getElementById('MainProductImage');
    const zoomBtn = document.getElementById('GalleryZoomBtn');

    const openLightbox = () => {
      if (!mainImg || !mainImg.src) return;
      
      let lightbox = document.getElementById('GalleryLightbox');
      if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'GalleryLightbox';
        lightbox.className = 'fixed inset-0 z-[900] bg-dark/95 backdrop-blur-xl flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-300';
        lightbox.innerHTML = `
          <button type="button" class="absolute top-4 right-4 text-white text-3xl font-light p-2 focus:outline-none" id="CloseLightboxBtn" aria-label="إغلاق">&times;</button>
          <img src="" alt="صورة مكبرة" class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl transition-transform duration-300" id="LightboxImage">
        `;
        document.body.appendChild(lightbox);

        lightbox.querySelector('#CloseLightboxBtn').addEventListener('click', () => {
          lightbox.classList.add('opacity-0', 'pointer-events-none');
        });
        lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox) {
            lightbox.classList.add('opacity-0', 'pointer-events-none');
          }
        });
      }

      const lightboxImg = lightbox.querySelector('#LightboxImage');
      lightboxImg.src = mainImg.src;
      lightbox.classList.remove('opacity-0', 'pointer-events-none');
    };

    if (mainImg) mainImg.addEventListener('click', openLightbox);
    if (zoomBtn) zoomBtn.addEventListener('click', openLightbox);
  }
}

/* ==========================================================================
   DOMContentLoaded — Boot sequence
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  RTLEnforcer.init();
  ScrollRevealManager.init();
  ImageLoadManager.init();
  ProductGallery.init();
  VariantPillPicker.init();
  AccordionManager.init();
  ScrollToCODManager.init();
  LightboxZoomManager.init();

  /* Open cart drawer on cart:updated event */
  window.addEventListener('cart:updated', () => {
    const cartDrawer = document.querySelector('drawer-component#CartDrawer');
    if (cartDrawer && !cartDrawer.classList.contains('is-active')) {
      cartDrawer.open();
    }
  });
});
