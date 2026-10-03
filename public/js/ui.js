/**
 * CampusBite UI Renderer & Component Manager
 */

const CampusBiteUI = {
  // Format Indian Rupee currency
  formatPrice(amount) {
    return `₹${amount}`;
  },

  // Create HTML for a food card
  renderFoodCard(food) {
    const isSoldOut = food.isAvailable === false;
    const dietIcon = food.isVeg
      ? `<span class="food-diet-badge" title="Pure Vegetarian"><span class="veg-icon"><span class="veg-dot"></span></span></span>`
      : `<span class="food-diet-badge" title="Non-Vegetarian"><span class="nonveg-icon"><span class="nonveg-triangle"></span></span></span>`;

    const tagBadge = food.tags && food.tags[0]
      ? `<span class="special-tag" style="font-size:0.72rem; padding: 0.2rem 0.5rem;">${food.tags[0]}</span>`
      : '';

    return `
      <article class="food-card ${isSoldOut ? 'sold-out' : ''}" data-id="${food.id}">
        <div class="card-img-wrap" onclick="CampusBiteUI.openFoodDetails(${food.id})">
          <img src="${food.image}" alt="${food.name}" loading="lazy" />
          <div class="card-top-badges">
            ${dietIcon}
            <span class="card-rating-badge"><i class="fa-solid fa-star"></i> ${food.rating.toFixed(1)}</span>
          </div>
        </div>

        <div class="card-body">
          <div class="card-meta-row">
            <span><i class="fa-regular fa-clock"></i> ${food.prepTime}</span>
            <span>•</span>
            <span>${food.category}</span>
            ${tagBadge ? `<span>•</span> ${tagBadge}` : ''}
          </div>

          <h3 class="card-title" onclick="CampusBiteUI.openFoodDetails(${food.id})" style="cursor:pointer;">${food.name}</h3>
          <p class="card-desc">${food.description}</p>

          <div class="card-footer">
            <span class="card-price">${this.formatPrice(food.price)}</span>
            ${isSoldOut ? `
              <span class="card-unavailable-badge">Sold Out</span>
            ` : `
              <button class="btn-add-cart" id="btn-add-${food.id}" onclick="CampusBiteUI.handleAddToCart(event, ${food.id})">
                <i class="fa-solid fa-plus"></i> Add
              </button>
            `}
          </div>
        </div>
      </article>
    `;
  },

  // Handle Add to Cart button feedback animation
  handleAddToCart(event, foodId) {
    event.stopPropagation();
    const btn = document.getElementById(`btn-add-${foodId}`);

    // Fetch food details from API or local fallback
    CampusBiteAPI.getFoodById(foodId).then(food => {
      if (!food) return;

      const success = window.campusCart.addItem(food, 1);
      if (success) {
        // Visual feedback on button
        if (btn) {
          const originalHTML = btn.innerHTML;
          btn.classList.add('btn-added');
          btn.innerHTML = `<i class="fa-solid fa-check"></i> Added ✓`;
          btn.disabled = true;

          setTimeout(() => {
            btn.classList.remove('btn-added');
            btn.innerHTML = originalHTML;
            btn.disabled = false;
          }, 1200);
        }

        // Cart icon bounce
        const cartBadge = document.getElementById('nav-cart-badge');
        if (cartBadge) {
          cartBadge.classList.remove('cart-bounce');
          void cartBadge.offsetWidth; // trigger reflow
          cartBadge.classList.add('cart-bounce');
        }

        CampusBiteUI.showToast(`✓ ${food.name} added to cart!`, 'success');
      }
    });
  },

  // Toast Notification System
  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} toast-enter`;

    let icon = '<i class="fa-solid fa-info-circle"></i>';
    if (type === 'success') icon = '<i class="fa-solid fa-circle-check"></i>';
    if (type === 'warning') icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
    if (type === 'error') icon = '<i class="fa-solid fa-circle-xmark"></i>';

    toast.innerHTML = `
      ${icon}
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto dismiss after 3.2 seconds
    setTimeout(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 320);
    }, 3200);
  },

  // Render Cart in Drawer & Checkout Summary
  renderCartDrawer(cartData) {
    const drawerList = document.getElementById('drawer-cart-items');
    const drawerSubtotal = document.getElementById('drawer-subtotal');
    const drawerTax = document.getElementById('drawer-tax');
    const drawerTotal = document.getElementById('drawer-total');
    const drawerCount = document.getElementById('drawer-item-count');
    const navCartBadge = document.getElementById('nav-cart-badge');
    const checkoutBtn = document.getElementById('btn-drawer-checkout');

    if (navCartBadge) {
      navCartBadge.textContent = cartData.itemCount;
    }

    if (drawerCount) {
      drawerCount.textContent = `(${cartData.itemCount} ${cartData.itemCount === 1 ? 'item' : 'items'})`;
    }

    if (!drawerList) return;

    if (cartData.isEmpty) {
      drawerList.innerHTML = `
        <div class="empty-state" style="padding: 2.5rem 1rem;">
          <div class="empty-icon-wiggle" style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
          <h3 style="font-size: 1.25rem;">Your cart is empty</h3>
          <p style="font-size: 0.88rem; margin-bottom: 1.25rem;">Looks like you haven't added anything delicious yet.</p>
          <button class="btn-primary" onclick="CampusBiteApp.switchView('menu'); CampusBiteUI.closeCartDrawer();" style="padding: 0.65rem 1.4rem; font-size: 0.9rem;">
            Browse Menu 🍴
          </button>
        </div>
      `;
      if (drawerSubtotal) drawerSubtotal.textContent = '₹0';
      if (drawerTax) drawerTax.textContent = '₹0';
      if (drawerTotal) drawerTotal.textContent = '₹0';
      if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.5';
        checkoutBtn.style.cursor = 'not-allowed';
      }
      return;
    }

    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.style.opacity = '1';
      checkoutBtn.style.cursor = 'pointer';
    }

    drawerList.innerHTML = cartData.items.map(item => `
      <div class="cart-item-row" data-id="${item.id}">
        <div class="cart-item-thumb">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span class="cart-item-price-unit">${this.formatPrice(item.price)} each</span>
          <div class="cart-item-controls">
            <div class="qty-control-wrap">
              <button class="qty-btn" onclick="window.campusCart.updateQuantity(${item.id}, -1)">
                <i class="fa-solid fa-minus"></i>
              </button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn" onclick="window.campusCart.updateQuantity(${item.id}, 1)">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="cart-item-right">
          <span class="cart-item-total">${this.formatPrice(item.price * item.quantity)}</span>
          <button class="cart-item-remove-btn" onclick="window.campusCart.removeItem(${item.id})">
            <i class="fa-solid fa-trash-can"></i> Remove
          </button>
        </div>
      </div>
    `).join('');

    if (drawerSubtotal) drawerSubtotal.textContent = this.formatPrice(cartData.subtotal);
    if (drawerTax) drawerTax.textContent = this.formatPrice(cartData.tax);
    if (drawerTotal) drawerTotal.textContent = this.formatPrice(cartData.total);

    // Also update checkout view summary if active
    this.renderCheckoutSummary(cartData);
  },

  renderCheckoutSummary(cartData) {
    const summaryList = document.getElementById('checkout-summary-items');
    const summarySubtotal = document.getElementById('checkout-subtotal');
    const summaryTax = document.getElementById('checkout-tax');
    const summaryTotal = document.getElementById('checkout-total');
    const btnPlaceOrder = document.getElementById('btn-place-order');

    if (!summaryList) return;

    if (cartData.isEmpty) {
      summaryList.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No items in cart.</p>`;
      if (summarySubtotal) summarySubtotal.textContent = '₹0';
      if (summaryTax) summaryTax.textContent = '₹0';
      if (summaryTotal) summaryTotal.textContent = '₹0';
      if (btnPlaceOrder) btnPlaceOrder.disabled = true;
      return;
    }

    if (btnPlaceOrder) {
      btnPlaceOrder.disabled = false;
      btnPlaceOrder.innerHTML = `Place Order • ${this.formatPrice(cartData.total)} <i class="fa-solid fa-arrow-right"></i>`;
    }

    summaryList.innerHTML = cartData.items.map(item => `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem; font-size:0.92rem;">
        <div>
          <strong>${item.name}</strong>
          <span style="color:var(--text-muted); font-size:0.85rem;"> × ${item.quantity}</span>
        </div>
        <span style="font-weight:700;">${this.formatPrice(item.price * item.quantity)}</span>
      </div>
    `).join('');

    if (summarySubtotal) summarySubtotal.textContent = this.formatPrice(cartData.subtotal);
    if (summaryTax) summaryTax.textContent = this.formatPrice(cartData.tax);
    if (summaryTotal) summaryTotal.textContent = this.formatPrice(cartData.total);
  },

  // Open & Close Cart Drawer
  openCartDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) overlay.classList.add('open');
  },

  closeCartDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) overlay.classList.remove('open');
  },

  // Food Details Modal
  openFoodDetails(foodId) {
    CampusBiteAPI.getFoodById(foodId).then(food => {
      if (!food) return;

      const modalOverlay = document.getElementById('food-modal-overlay');
      const modalContent = document.getElementById('food-modal-content');
      if (!modalOverlay || !modalContent) return;

      const isSoldOut = food.isAvailable === false;

      modalContent.innerHTML = `
        <div style="position:relative;">
          <button onclick="CampusBiteUI.closeFoodDetails()" style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.6); color:#fff; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; z-index:3;">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <img src="${food.image}" alt="${food.name}" style="width:100%; height:240px; object-fit:cover; border-radius:var(--radius-lg) var(--radius-lg) 0 0;" />
        </div>
        <div style="padding:1.75rem; text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span style="font-size:0.82rem; font-weight:700; color:var(--accent-primary); background:var(--accent-primary-light); padding:0.25rem 0.65rem; border-radius:var(--radius-full);">${food.category}</span>
            <span style="font-size:0.85rem; font-weight:700; color:var(--text-primary);"><i class="fa-solid fa-star" style="color:#fab005;"></i> ${food.rating} (${food.reviewsCount} reviews)</span>
          </div>

          <h2 style="font-size:1.6rem; font-weight:800; margin-bottom:0.5rem;">${food.name}</h2>
          <p style="color:var(--text-secondary); font-size:0.95rem; margin-bottom:1.25rem; line-height:1.5;">${food.description}</p>

          <div style="display:flex; gap:1.5rem; background:var(--bg-main); padding:0.85rem 1rem; border-radius:var(--radius-md); margin-bottom:1.5rem; font-size:0.85rem;">
            <div><strong>Prep Time:</strong> ${food.prepTime}</div>
            <div><strong>Calories:</strong> ${food.calories || '320 kcal'}</div>
            <div><strong>Diet:</strong> ${food.isVeg ? 'Vegetarian 🟢' : 'Non-Veg 🔴'}</div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:1.75rem; font-weight:800; color:var(--text-primary);">${this.formatPrice(food.price)}</span>
            ${isSoldOut ? `
              <span class="card-unavailable-badge" style="padding:0.6rem 1.25rem; font-size:0.9rem;">Currently Sold Out</span>
            ` : `
              <button class="btn-primary" onclick="CampusBiteUI.handleAddToCart(event, ${food.id}); CampusBiteUI.closeFoodDetails();">
                Add to Cart <i class="fa-solid fa-cart-shopping"></i>
              </button>
            `}
          </div>
        </div>
      `;

      modalOverlay.classList.add('open');
    });
  },

  closeFoodDetails() {
    const modalOverlay = document.getElementById('food-modal-overlay');
    if (modalOverlay) modalOverlay.classList.remove('open');
  },

  // Order Confirmation Modal
  showOrderConfirmation(order) {
    const confModal = document.getElementById('confirmation-modal-overlay');
    const confNum = document.getElementById('conf-order-number');
    const confGreeting = document.getElementById('conf-greeting');
    const confPrepTime = document.getElementById('conf-prep-time');

    if (confNum) confNum.textContent = order.orderNumber;
    if (confGreeting) confGreeting.textContent = `Hi ${order.studentName} 👋`;
    if (confPrepTime) confPrepTime.textContent = order.estimatedPrepTime || '10–15 minutes';

    if (confModal) confModal.classList.add('open');
  },

  closeOrderConfirmation() {
    const confModal = document.getElementById('confirmation-modal-overlay');
    if (confModal) confModal.classList.remove('open');
  },

  // 5-Stage Live Status Timeline Renderer
  renderOrderTracking(order) {
    const trackingContainer = document.getElementById('active-order-tracking');
    if (!trackingContainer) return;

    if (!order) {
      trackingContainer.innerHTML = `
        <div class="empty-state">
          <div style="font-size: 3rem; margin-bottom: 0.75rem;">📋</div>
          <h3>No Active Order Found</h3>
          <p>You don't have any ongoing orders at the moment. Browse our canteen menu to grab a bite!</p>
          <button class="btn-primary" onclick="CampusBiteApp.switchView('menu')">Browse Canteen Menu</button>
        </div>
      `;
      return;
    }

    const stages = [
      { key: 'Placed', label: 'Order Placed', desc: 'Your order has been received.', icon: 'fa-file-invoice' },
      { key: 'Accepted', label: 'Accepted', desc: 'The canteen has accepted your order.', icon: 'fa-thumbs-up' },
      { key: 'Preparing', label: 'Preparing', desc: 'Your food is being prepared 👨‍🍳', icon: 'fa-fire-burner' },
      { key: 'Ready', label: 'Ready for Pickup', desc: 'Your order is ready! Come pick it up 🎉', icon: 'fa-bell-concierge' },
      { key: 'Completed', label: 'Completed', desc: 'Enjoy your meal! ❤️', icon: 'fa-heart' }
    ];

    const currentStatusIndex = stages.findIndex(s => s.key === order.status);
    const progressPercent = currentStatusIndex >= 0 ? (currentStatusIndex / (stages.length - 1)) * 100 : 0;

    trackingContainer.innerHTML = `
      <div class="tracking-card">
        <div class="tracking-header">
          <div>
            <span style="font-size:0.8rem; font-weight:700; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.04em;">Active Order Tracking</span>
            <h2>${order.orderNumber}</h2>
            <p style="color:var(--text-secondary); font-size:0.9rem; margin-top:0.25rem;">
              Placed by <strong>${order.studentName}</strong> (${order.studentId}) • Pickup: <strong>${order.pickupPreference}</strong>
            </p>
          </div>
          <div style="text-align:right;">
            <span class="status-tag ${order.status.toLowerCase()}">${order.status}</span>
            <div style="font-size:1.35rem; font-weight:800; color:var(--accent-primary); margin-top:0.4rem;">
              ${this.formatPrice(order.total)}
            </div>
          </div>
        </div>

        <!-- 5-Stage Animated Timeline -->
        <div class="timeline-stages">
          <div class="timeline-progress-track">
            <div class="timeline-progress-fill" style="width: ${progressPercent}%;"></div>
          </div>

          ${stages.map((stage, idx) => {
            let stateClass = '';
            let stepIcon = `<i class="fa-solid ${stage.icon}"></i>`;

            if (idx < currentStatusIndex) {
              stateClass = 'completed';
              stepIcon = `<i class="fa-solid fa-check"></i>`;
            } else if (idx === currentStatusIndex) {
              stateClass = 'active';
            }

            return `
              <div class="timeline-step ${stateClass}">
                <div class="step-icon-wrap">
                  ${stepIcon}
                </div>
                <div class="step-label">${stage.label}</div>
                <div class="step-desc">${stage.desc}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Order Items Summary in Tracker -->
        <div style="background:var(--bg-main); border:1px solid var(--border-light); border-radius:var(--radius-md); padding:1.25rem; margin-top:1.5rem;">
          <h4 style="font-size:0.95rem; font-weight:800; margin-bottom:0.75rem;">Order Items:</h4>
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            ${order.items.map(item => `
              <div style="display:flex; justify-content:space-between; font-size:0.9rem;">
                <span>${item.name} × ${item.quantity}</span>
                <span style="font-weight:700;">${this.formatPrice(item.price * item.quantity)}</span>
              </div>
            `).join('')}
            ${order.specialInstructions ? `
              <div style="margin-top:0.5rem; padding-top:0.5rem; border-top:1px dashed var(--border-light); font-size:0.85rem; color:var(--text-secondary);">
                <strong>Special Note:</strong> "${order.specialInstructions}"
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Demo Presentation Status Simulator -->
        <div class="sim-controls-card">
          <div>
            <strong style="font-size:0.88rem; color:var(--text-primary);"><i class="fa-solid fa-wand-magic-sparkles"></i> Presentation Demo Controls:</strong>
            <span style="font-size:0.78rem; color:var(--text-muted); display:block;">Advance kitchen status in real time during college viva / demo</span>
          </div>
          <div class="sim-buttons-group">
            <button class="btn-sim" onclick="CampusBiteApp.advanceOrderStatus('${order.id || order.orderNumber}', 'Placed')">Placed</button>
            <button class="btn-sim" onclick="CampusBiteApp.advanceOrderStatus('${order.id || order.orderNumber}', 'Accepted')">Accepted</button>
            <button class="btn-sim" onclick="CampusBiteApp.advanceOrderStatus('${order.id || order.orderNumber}', 'Preparing')">Preparing</button>
            <button class="btn-sim" onclick="CampusBiteApp.advanceOrderStatus('${order.id || order.orderNumber}', 'Ready')">Ready 🎉</button>
            <button class="btn-sim" onclick="CampusBiteApp.advanceOrderStatus('${order.id || order.orderNumber}', 'Completed')">Completed ❤️</button>
          </div>
        </div>
      </div>
    `;
  },

  // Render Previous Order History Cards
  renderOrderHistory(ordersList) {
    const historyContainer = document.getElementById('order-history-list');
    if (!historyContainer) return;

    if (!ordersList || ordersList.length === 0) {
      historyContainer.innerHTML = `<p style="color:var(--text-muted);">No order history yet.</p>`;
      return;
    }

    historyContainer.innerHTML = ordersList.map(ord => {
      const formattedDate = new Date(ord.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const itemsSummary = ord.items.map(i => `${i.name} × ${i.quantity}`).join(', ');

      return `
        <div class="history-card">
          <div>
            <div class="history-card-top">
              <span class="history-ord-num">${ord.orderNumber}</span>
              <span class="status-tag ${ord.status.toLowerCase()}">${ord.status}</span>
            </div>
            <span style="font-size:0.8rem; color:var(--text-muted); display:block; margin-bottom:0.75rem;">
              <i class="fa-regular fa-clock"></i> ${formattedDate}
            </span>
            <p style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:1rem; line-height:1.4;">
              ${itemsSummary}
            </p>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; padding-top:0.75rem; border-top:1px solid var(--border-light);">
            <strong style="font-size:1.15rem; color:var(--text-primary);">${this.formatPrice(ord.total)}</strong>
            <button class="btn-secondary" style="padding:0.45rem 0.95rem; font-size:0.85rem;" onclick="CampusBiteApp.viewHistoricalOrder('${ord.orderNumber}')">
              Track Order <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
};

window.CampusBiteUI = CampusBiteUI;
