/**
 * CampusBite Main Application Controller
 * Handles SPA view switching, food filtering, search, checkout validation, and tracking
 */

const CampusBiteApp = {
  currentView: 'home',
  allFoods: [],
  filteredFoods: [],
  selectedCategory: 'All',
  searchQuery: '',
  sortBy: 'popular',
  vegOnly: false,
  activeOrder: null,

  async init() {
    console.log('CampusBite: Initializing application...');

    // Load initial foods catalog
    await this.loadFoods();

    // Setup Today's Special banner
    await this.setupTodaySpecial();

    // Subscribe Cart to UI updates
    window.campusCart.subscribe(cartData => {
      CampusBiteUI.renderCartDrawer(cartData);
    });

    // Trigger initial cart render
    window.campusCart.notify();

    // Setup Event Listeners
    this.setupEventListeners();

    // Load existing active order from storage or API
    await this.loadInitialOrders();

    // Check URL hash for routing (e.g. #menu, #orders)
    this.handleHashRouting();
  },

  // Load foods catalog from API
  async loadFoods() {
    try {
      this.allFoods = await CampusBiteAPI.getFoods();
      this.renderPopularFoods();
      this.applyFilters();
    } catch (err) {
      console.error('Failed to load foods', err);
    }
  },

  // Setup Today's Special Section
  async setupTodaySpecial() {
    const special = await CampusBiteAPI.getTodaySpecial();
    const container = document.getElementById('today-special-content');
    if (!container || !special) return;

    container.innerHTML = `
      <div class="special-card">
        <div>
          <span class="special-badge-pill"><i class="fa-solid fa-fire"></i> Today's Special</span>
          <h2 class="special-title">${special.name}</h2>
          <p class="special-desc">${special.description}</p>
          <div class="special-meta">
            <span class="special-price">${CampusBiteUI.formatPrice(special.price)}</span>
            <span class="special-tag"><i class="fa-regular fa-clock"></i> ${special.prepTime}</span>
            <span class="special-tag"><i class="fa-solid fa-star" style="color:#fab005;"></i> ${special.rating}</span>
            <span class="special-tag">Only Available Today!</span>
          </div>
          <button class="btn-primary" onclick="CampusBiteUI.handleAddToCart(event, ${special.id})">
            Order Special Now <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
        <div class="special-img-wrap" onclick="CampusBiteUI.openFoodDetails(${special.id})" style="cursor:pointer;">
          <img src="${special.image}" alt="${special.name}" />
        </div>
      </div>
    `;
  },

  // Render Popular Foods on Home Page
  renderPopularFoods() {
    const popularContainer = document.getElementById('popular-foods-grid');
    if (!popularContainer) return;

    const popularItems = this.allFoods.filter(f => f.isPopular).slice(0, 6);
    popularContainer.innerHTML = popularItems.map(food => CampusBiteUI.renderFoodCard(food)).join('');
  },

  // Apply Search, Category, Veg, and Sort Filters
  applyFilters() {
    let result = [...this.allFoods];

    // Category Filter
    if (this.selectedCategory !== 'All') {
      result = result.filter(item => item.category.toLowerCase() === this.selectedCategory.toLowerCase());
    }

    // Live Search Filter
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    // Veg Only Filter
    if (this.vegOnly) {
      result = result.filter(item => item.isVeg === true);
    }

    // Sort By
    if (this.sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'popular') {
      result.sort((a, b) => b.rating - a.rating);
    }

    this.filteredFoods = result;
    this.renderMenuGrid();
  },

  // Render Menu Page Grid
  renderMenuGrid() {
    const grid = document.getElementById('menu-foods-grid');
    const emptyState = document.getElementById('menu-empty-state');
    const countLabel = document.getElementById('menu-items-count');

    if (!grid) return;

    if (countLabel) {
      countLabel.textContent = `Showing ${this.filteredFoods.length} items`;
    }

    if (this.filteredFoods.length === 0) {
      grid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
    } else {
      grid.style.display = 'grid';
      if (emptyState) emptyState.style.display = 'none';
      grid.innerHTML = this.filteredFoods.map(food => CampusBiteUI.renderFoodCard(food)).join('');
    }
  },

  // Setup Event Listeners
  setupEventListeners() {
    // Search input with dynamic instant search
    const searchInput = document.getElementById('menu-search-input');
    const searchClear = document.getElementById('menu-search-clear');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (searchClear) {
          searchClear.style.display = this.searchQuery ? 'block' : 'none';
        }
        this.applyFilters();
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          this.searchQuery = '';
          searchClear.style.display = 'none';
          this.applyFilters();
          searchInput.focus();
        }
      });
    }

    // Sort Select
    const sortSelect = document.getElementById('menu-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.applyFilters();
      });
    }

    // Veg Only Toggle
    const vegCheckbox = document.getElementById('veg-only-checkbox');
    if (vegCheckbox) {
      vegCheckbox.addEventListener('change', (e) => {
        this.vegOnly = e.target.checked;
        this.applyFilters();
      });
    }

    // Keyboard ESC to close modals/drawers
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        CampusBiteUI.closeCartDrawer();
        CampusBiteUI.closeFoodDetails();
        CampusBiteUI.closeOrderConfirmation();
        this.closeMobileMenu();
      }
    });

    // Special Instructions input in Cart Drawer
    const notesInput = document.getElementById('cart-special-instructions');
    if (notesInput) {
      notesInput.value = window.campusCart.specialInstructions || '';
      notesInput.addEventListener('input', (e) => {
        window.campusCart.setNotes(e.target.value);
      });
    }

    // Header scroll elevation
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.site-header');
      if (header) {
        if (window.scrollY > 20) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });

    // Listen to hash changes for back/forward browser buttons
    window.addEventListener('hashchange', () => {
      this.handleHashRouting();
    });
  },

  // Filter Category Handler
  filterCategory(category) {
    this.selectedCategory = category;

    // Update active class on Category Chips in Menu view
    document.querySelectorAll('.filter-chip-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category.toLowerCase() === category.toLowerCase());
    });

    // Update active class on Quick Categories bar in Home view
    document.querySelectorAll('.category-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.category.toLowerCase() === category.toLowerCase());
    });

    this.applyFilters();
  },

  // Category clicked from Home page: sets category and smoothly switches to menu
  selectCategoryFromHome(category) {
    this.filterCategory(category);
    this.switchView('menu');
  },

  // Reset Filters & Search
  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'All';
    this.vegOnly = false;
    this.sortBy = 'popular';

    const searchInput = document.getElementById('menu-search-input');
    if (searchInput) searchInput.value = '';

    const vegCheckbox = document.getElementById('veg-only-checkbox');
    if (vegCheckbox) vegCheckbox.checked = false;

    const sortSelect = document.getElementById('menu-sort-select');
    if (sortSelect) sortSelect.value = 'popular';

    this.filterCategory('All');
  },

  // View / Tab Switcher (SPA)
  switchView(viewName) {
    this.currentView = viewName;

    // Update nav links active state
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewName);
    });

    document.querySelectorAll('.mobile-nav-item a').forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewName);
    });

    // Update active view section
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active', 'animate-fade-in');
      if (sec.id === `view-${viewName}`) {
        sec.classList.add('active', 'animate-fade-in');
      }
    });

    // Close mobile menu if open
    this.closeMobileMenu();

    // Scroll top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update browser URL hash
    window.location.hash = viewName;

    // Special view triggers
    if (viewName === 'orders') {
      this.refreshOrdersView();
    } else if (viewName === 'checkout') {
      const summary = window.campusCart.getCartSummary();
      if (summary.isEmpty) {
        CampusBiteUI.showToast('Your cart is empty! Add food items first.', 'warning');
        this.switchView('menu');
      } else {
        CampusBiteUI.renderCheckoutSummary(summary);
      }
    }
  },

  handleHashRouting() {
    const hash = window.location.hash.replace('#', '').trim();
    const validViews = ['home', 'menu', 'orders', 'checkout', 'about'];
    if (validViews.includes(hash)) {
      this.switchView(hash);
    } else {
      this.switchView('home');
    }
  },

  toggleMobileMenu() {
    const menu = document.getElementById('mobile-nav-menu');
    if (menu) menu.classList.toggle('open');
  },

  closeMobileMenu() {
    const menu = document.getElementById('mobile-nav-menu');
    if (menu) menu.classList.remove('open');
  },

  // Handle Order Placement from Checkout Form
  async handleCheckoutSubmit(event) {
    event.preventDefault();

    const cart = window.campusCart.getCartSummary();
    if (cart.isEmpty) {
      CampusBiteUI.showToast('Cannot place order: Cart is empty.', 'warning');
      return;
    }

    const form = document.getElementById('checkout-form');
    if (!form) return;

    // Extract student inputs
    const studentName = form['studentName'].value.trim();
    const studentId = form['studentId'].value.trim();
    const collegeEmail = form['collegeEmail'].value.trim();
    const phone = form['phone'].value.trim();
    const department = form['department'].value;
    const year = form['year'].value;
    const pickupOption = form.querySelector('input[name="pickupPreference"]:checked')?.value || 'As soon as ready';
    const instructions = form['specialInstructions'].value.trim() || cart.specialInstructions;

    // Client-side validations
    if (!studentName || studentName.length < 2) {
      CampusBiteUI.showToast('Please enter your full name.', 'warning');
      form['studentName'].focus();
      return;
    }

    if (!studentId) {
      CampusBiteUI.showToast('Please enter your Student ID / Roll Number.', 'warning');
      form['studentId'].focus();
      return;
    }

    if (!collegeEmail || !collegeEmail.includes('@')) {
      CampusBiteUI.showToast('Please enter a valid college email.', 'warning');
      form['collegeEmail'].focus();
      return;
    }

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      CampusBiteUI.showToast('Please enter a valid 10-digit mobile number.', 'warning');
      form['phone'].focus();
      return;
    }

    if (!department) {
      CampusBiteUI.showToast('Please select your department.', 'warning');
      form['department'].focus();
      return;
    }

    if (!year) {
      CampusBiteUI.showToast('Please select your year of study.', 'warning');
      form['year'].focus();
      return;
    }

    const submitBtn = document.getElementById('btn-place-order');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Placing Order...`;

    try {
      const payload = {
        studentName,
        studentId,
        collegeEmail,
        phone,
        department,
        year,
        pickupPreference: pickupOption,
        specialInstructions: instructions,
        items: cart.items.map(item => ({
          foodId: item.id,
          quantity: item.quantity
        }))
      };

      const newOrder = await CampusBiteAPI.createOrder(payload);

      // Order success!
      this.activeOrder = newOrder;
      localStorage.setItem('campusbite_active_order_id', newOrder.id || newOrder.orderNumber);

      // Clear cart
      window.campusCart.clearCart();
      form.reset();

      // Show confirmation modal
      CampusBiteUI.showOrderConfirmation(newOrder);
      CampusBiteUI.showToast(`✓ Order placed! Order ${newOrder.orderNumber}`, 'success');

    } catch (err) {
      CampusBiteUI.showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  },

  // Load Initial Orders
  async loadInitialOrders() {
    const lastActiveId = localStorage.getItem('campusbite_active_order_id');
    const orders = await CampusBiteAPI.getOrders();

    if (lastActiveId) {
      this.activeOrder = orders.find(o => o.id === lastActiveId || o.orderNumber === lastActiveId) || orders[0];
    } else if (orders.length > 0) {
      this.activeOrder = orders[0];
    }
  },

  // Refresh Orders View
  async refreshOrdersView() {
    const orders = await CampusBiteAPI.getOrders();

    // Check if active order exists
    if (!this.activeOrder && orders.length > 0) {
      this.activeOrder = orders[0];
    }

    CampusBiteUI.renderOrderTracking(this.activeOrder);
    CampusBiteUI.renderOrderHistory(orders);
  },

  // View Historical Order in Live Tracker
  async viewHistoricalOrder(orderNumber) {
    const order = await CampusBiteAPI.getOrder(orderNumber);
    if (order) {
      this.activeOrder = order;
      localStorage.setItem('campusbite_active_order_id', order.id || order.orderNumber);
      CampusBiteUI.renderOrderTracking(this.activeOrder);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      CampusBiteUI.showToast(`Now tracking order ${order.orderNumber}`, 'info');
    }
  },

  // Advance Order Status (Staff / Demo Simulator)
  async advanceOrderStatus(orderId, newStatus) {
    try {
      const updated = await CampusBiteAPI.updateOrderStatus(orderId, newStatus);
      if (updated) {
        this.activeOrder = updated;
        CampusBiteUI.renderOrderTracking(updated);
        CampusBiteUI.showToast(`Order status updated to: ${newStatus}`, 'success');

        // Also refresh history
        const orders = await CampusBiteAPI.getOrders();
        CampusBiteUI.renderOrderHistory(orders);
      }
    } catch (err) {
      CampusBiteUI.showToast('Could not update status: ' + err.message, 'error');
    }
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  CampusBiteApp.init();
});

window.CampusBiteApp = CampusBiteApp;
