/* ==========================================================================
   🌿 MATERIA DTC SKINCARE THEME - AJAX CART MANAGER
   Handles Shopify Cart API: /cart/add.js, /cart/change.js, /cart.js
   Dynamic Cart Drawer update + Free Shipping threshold calculation
   ========================================================================== */

class CartManager {
  static async addItem(variantId, quantity = 1, buttonElement = null) {
    if (buttonElement) {
      buttonElement.classList.add('is-loading');
      buttonElement.disabled = true;
    }

    try {
      const response = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: variantId,
          quantity: quantity
        })
      });

      if (!response.ok) throw new Error('فشل في إضافة المنتج إلى السلة');

      const item = await response.json();
      await CartManager.refreshCartDrawer();

      window.dispatchEvent(new CustomEvent('cart:updated'));
    } catch (error) {
      console.error('Cart Error:', error);
      window.dispatchEvent(new CustomEvent('theme:error', { detail: { message: 'تعذر إضافة المنتج. يرجى المحاولة مرة أخرى.' } }));
    } finally {
      if (buttonElement) {
        buttonElement.classList.remove('is-loading');
        buttonElement.disabled = false;
      }
    }
  }

  static async changeQuantity(lineKey, quantity) {
    try {
      const response = await fetch(`${window.Shopify.routes.root}cart/change.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: lineKey,
          quantity: quantity
        })
      });

      if (!response.ok) throw new Error('فشل تحديث الكمية');

      await CartManager.refreshCartDrawer();
      window.dispatchEvent(new CustomEvent('cart:updated'));
    } catch (error) {
      console.error('Cart Quantity Error:', error);
    }
  }

  static async refreshCartDrawer() {
    try {
      const response = await fetch(`${window.Shopify.routes.root}?section_id=cart-drawer`);
      const text = await response.text();
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(text, 'text/html');

      const newContent = htmlDoc.querySelector('#CartDrawerContent');
      const currentContent = document.querySelector('#CartDrawerContent');

      if (newContent && currentContent) {
        currentContent.innerHTML = newContent.innerHTML;
      }

      // Update cart count pills in header
      const cartResponse = await fetch(`${window.Shopify.routes.root}cart.js`);
      const cartData = await cartResponse.json();

      document.querySelectorAll('[data-cart-count]').forEach((badge) => {
        badge.textContent = cartData.item_count;
        badge.classList.toggle('hidden', cartData.item_count === 0);
      });
    } catch (error) {
      console.error('Refresh Drawer Error:', error);
    }
  }
}

// Delegated Quick Add and Cart Change Event Listeners
document.addEventListener('click', (event) => {
  const quickAddBtn = event.target.closest('[data-quick-add]');
  if (quickAddBtn) {
    event.preventDefault();
    const variantId = quickAddBtn.dataset.quickAdd;
    if (variantId) {
      CartManager.addItem(variantId, 1, quickAddBtn);
    }
  }

  const removeBtn = event.target.closest('[data-cart-remove]');
  if (removeBtn) {
    event.preventDefault();
    const key = removeBtn.dataset.cartRemove;
    if (key) CartManager.changeQuantity(key, 0);
  }
});
