/* ==========================================================================
   🌿 MATERIA DTC SKINCARE THEME - AJAX CART MANAGER
   Handles Shopify Cart API: /cart/add.js, /cart/change.js, /cart.js
   Dynamic Cart Drawer update + Free Shipping threshold calculation
   ========================================================================== */

function getShopifyRoute(endpoint) {
  const root = window.Shopify?.routes?.root || '/';
  const cleanRoot = root.endsWith('/') ? root : root + '/';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return cleanRoot + cleanEndpoint;
}

class CartManager {
  static async addItem(variantId, quantity = 1, buttonElement = null) {
    if (buttonElement) {
      buttonElement.classList.add('is-loading');
      buttonElement.disabled = true;
    }

    try {
      const response = await fetch(getShopifyRoute('cart/add.js'), {
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

      await response.json();
      await CartManager.refreshCartDrawer();

      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { openDrawer: true } }));
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
      const response = await fetch(getShopifyRoute('cart/change.js'), {
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
      if (document.body.classList.contains('template-cart')) {
        window.location.reload();
        return;
      }
      window.dispatchEvent(new CustomEvent('cart:updated'));
    } catch (error) {
      console.error('Cart Quantity Error:', error);
    }
  }

  static async refreshCartDrawer() {
    try {
      const response = await fetch(getShopifyRoute('?section_id=cart-drawer'));
      if (!response.ok) throw new Error('Failed to load cart section');
      const text = await response.text();
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(text, 'text/html');

      ['.free-shipping-bar', '#CartDrawerContent', '.drawer-footer'].forEach((selector) => {
        const updated = htmlDoc.querySelector(`#CartDrawer ${selector}`);
        const current = document.querySelector(`#CartDrawer ${selector}`);
        if (updated && current) current.innerHTML = updated.innerHTML;
      });

      // Update cart count pills in header
      const cartResponse = await fetch(getShopifyRoute('cart.js'));
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
      const quantity = parseInt(quickAddBtn.closest('.product-form')?.querySelector('input[name="quantity"]')?.value || '1', 10);
      CartManager.addItem(variantId, Number.isInteger(quantity) && quantity > 0 ? quantity : 1, quickAddBtn);
    }
  }

  const removeBtn = event.target.closest('[data-cart-remove]');
  if (removeBtn) {
    event.preventDefault();
    const key = removeBtn.dataset.cartRemove;
    if (key) CartManager.changeQuantity(key, 0);
  }
});

// Quantity Input Live Sync
let quantityDebounceTimer;
document.addEventListener('change', (event) => {
  const input = event.target;
  if (input && input.classList.contains('quantity-field')) {
    const key = input.getAttribute('data-line-key') || input.closest('quantity-input')?.getAttribute('data-line-key');
    const newQty = parseInt(input.value, 10);
    if (key && !isNaN(newQty) && newQty >= 0) {
      clearTimeout(quantityDebounceTimer);
      quantityDebounceTimer = setTimeout(() => {
        CartManager.changeQuantity(key, newQty);
      }, 300);
    }
  }
});
