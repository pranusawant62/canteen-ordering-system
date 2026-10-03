/**
 * CampusBite Cart Module
 * Persistent localStorage cart state, price calculations, and event dispatching
 */

class CartManager {
  constructor() {
    this.storageKey = 'campusbite_cart';
    this.items = this.loadCart();
    this.taxRate = 0.05; // 5% Canteen Tax
    this.specialInstructions = localStorage.getItem('campusbite_cart_notes') || '';
    this.listeners = [];
  }

  loadCart() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      localStorage.setItem('campusbite_cart_notes', this.specialInstructions);
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
    this.notify();
  }

  subscribe(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  notify() {
    const data = this.getCartSummary();
    this.listeners.forEach(cb => cb(data));
  }

  addItem(food, quantity = 1) {
    if (!food || food.isAvailable === false) return false;

    const existingIndex = this.items.findIndex(item => item.id === food.id);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        id: food.id,
        name: food.name,
        price: food.price,
        image: food.image,
        isVeg: food.isVeg,
        prepTime: food.prepTime,
        quantity: Math.max(1, quantity)
      });
    }

    this.saveCart();
    return true;
  }

  updateQuantity(foodId, delta) {
    const index = this.items.findIndex(item => item.id === foodId);
    if (index === -1) return;

    this.items[index].quantity += delta;
    if (this.items[index].quantity <= 0) {
      this.items.splice(index, 1);
    }

    this.saveCart();
  }

  removeItem(foodId) {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.id !== foodId);
    if (this.items.length !== initialLength) {
      this.saveCart();
    }
  }

  clearCart() {
    this.items = [];
    this.specialInstructions = '';
    this.saveCart();
  }

  setNotes(notes) {
    this.specialInstructions = (notes || '').trim();
    this.saveCart();
  }

  getCartSummary() {
    const itemCount = this.items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * this.taxRate);
    const total = subtotal + tax;

    return {
      items: [...this.items],
      itemCount,
      subtotal,
      tax,
      total,
      specialInstructions: this.specialInstructions,
      isEmpty: this.items.length === 0
    };
  }
}

// Global Cart Instance
window.campusCart = new CartManager();
