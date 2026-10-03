/**
 * CampusBite API Client
 * Seamlessly interfaces with Express backend with automatic fallback to local offline mode
 */

const API_BASE = '/api';

// Fallback catalog in case backend is offline or opened as static HTML file
const FALLBACK_FOODS = [
  {
    id: 1,
    name: "Cheese Burger",
    category: "Fast Food",
    price: 70,
    description: "Crispy spiced veggie patty layered with melted cheddar, fresh lettuce, and our house secret sauce.",
    rating: 4.8,
    reviewsCount: 184,
    isVeg: true,
    prepTime: "8-10 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: true,
    calories: "380 kcal",
    tags: ["Bestseller", "Cheesy"],
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    name: "Cheese Sandwich",
    category: "Fast Food",
    price: 55,
    description: "Golden grilled triple-layer sandwich stuffed with cheese, bell peppers, corn, and fresh herbs.",
    rating: 4.7,
    reviewsCount: 152,
    isVeg: true,
    prepTime: "5-7 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: true,
    calories: "310 kcal",
    tags: ["Quick Bite", "Crispy"],
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    name: "Veg Burger",
    category: "Fast Food",
    price: 60,
    description: "Golden crumb-fried potato and green pea patty with crisp lettuce, onion rings, and tangy mayo.",
    rating: 4.5,
    reviewsCount: 98,
    isVeg: true,
    prepTime: "6-8 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: false,
    calories: "340 kcal",
    tags: ["Classic"],
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    name: "Veg Sandwich",
    category: "Fast Food",
    price: 45,
    description: "Freshly sliced cucumber, tomato, beetroot, and potatoes layered with spicy coriander-mint chutney.",
    rating: 4.4,
    reviewsCount: 76,
    isVeg: true,
    prepTime: "5 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: false,
    calories: "220 kcal",
    tags: ["Light"],
    image: "https://images.unsplash.com/photo-1619096252214-ef06c45683e3?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    name: "Paneer Tikka Burger",
    category: "Fast Food",
    price: 85,
    description: "Tandoori marinated soft paneer slab grilled to perfection, topped with mint slaw and onion rings.",
    rating: 4.9,
    reviewsCount: 210,
    isVeg: true,
    prepTime: "10-12 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: true,
    calories: "420 kcal",
    tags: ["Chef Pick", "Protein"],
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    name: "Masala Cheese Maggi",
    category: "Snacks",
    price: 50,
    description: "Our signature canteen Maggi cooked with butter, sautéed veggies, extra secret tastemaker, and melted cheese.",
    rating: 4.9,
    reviewsCount: 340,
    isVeg: true,
    prepTime: "8-10 min",
    isAvailable: true,
    isSpecial: true,
    isPopular: true,
    calories: "350 kcal",
    tags: ["Today's Special", "Campus Legend"],
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 7,
    name: "Classic Vada Pav",
    category: "Snacks",
    price: 20,
    description: "The quintessential Mumbai snack: spiced golden potato dumpling in soft pav with dry garlic chutney.",
    rating: 4.8,
    reviewsCount: 420,
    isVeg: true,
    prepTime: "3 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: true,
    calories: "280 kcal",
    tags: ["Student Favorite", "Spicy"],
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 8,
    name: "Crispy Samosa (2 Pcs)",
    category: "Snacks",
    price: 25,
    description: "Handmade flaky pastries packed with spiced potatoes, green peas, served with sweet tamarind and mint chutneys.",
    rating: 4.6,
    reviewsCount: 195,
    isVeg: true,
    prepTime: "4 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: false,
    calories: "320 kcal",
    tags: ["Crispy", "Classic"],
    image: "https://images.unsplash.com/photo-1601050690187-573e3a9eb0d3?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 9,
    name: "French Fries",
    category: "Snacks",
    price: 50,
    description: "Golden, crunchy potato batons tossed in sea salt, served piping hot with creamy garlic dip.",
    rating: 4.6,
    reviewsCount: 140,
    isVeg: true,
    prepTime: "5-7 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: false,
    calories: "290 kcal",
    tags: ["Crunchy"],
    image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 10,
    name: "Peri Peri Fries",
    category: "Snacks",
    price: 65,
    description: "Crispy salted fries dusted generously with fiery zesty African bird's eye chili seasoning.",
    rating: 4.7,
    reviewsCount: 115,
    isVeg: true,
    prepTime: "6-8 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: false,
    calories: "310 kcal",
    tags: ["Spicy", "Trending"],
    image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 11,
    name: "Cheese Corn Balls",
    category: "Snacks",
    price: 60,
    description: "Crispy crumb-coated golden balls filled with molten cheese, sweet corn kernels, and jalapenos.",
    rating: 4.7,
    reviewsCount: 89,
    isVeg: true,
    prepTime: "8-10 min",
    isAvailable: false,
    isSpecial: false,
    isPopular: false,
    calories: "340 kcal",
    tags: ["Sold Out Today"],
    image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 12,
    name: "Veg Dum Biryani",
    category: "Meals",
    price: 80,
    description: "Fragrant long-grain basmati rice slow dum-cooked with seasoned veggies, fried onions, and saffron. Served with mint raita.",
    rating: 4.8,
    reviewsCount: 260,
    isVeg: true,
    prepTime: "12-15 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: true,
    calories: "480 kcal",
    tags: ["Hearty", "Bestseller"],
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 13,
    name: "Paneer Rice Bowl",
    category: "Meals",
    price: 90,
    description: "Fluffy steamed cumin rice served with rich, velvety paneer butter masala and fresh coriander garnish.",
    rating: 4.7,
    reviewsCount: 178,
    isVeg: true,
    prepTime: "10-12 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: false,
    calories: "520 kcal",
    tags: ["Comfort Food"],
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 14,
    name: "Veg Hakka Noodles",
    category: "Meals",
    price: 70,
    description: "Wok-tossed noodles with shredded bell peppers, cabbage, spring onions, garlic, and savory Asian sauces.",
    rating: 4.6,
    reviewsCount: 132,
    isVeg: true,
    prepTime: "8-10 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: false,
    calories: "390 kcal",
    tags: ["Street Style"],
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 15,
    name: "Chole Bhature (2 Pcs)",
    category: "Meals",
    price: 85,
    description: "Authentic Punjabi spicy chickpeas curry served with two hot fluffy fried bhaturas and pickled onions.",
    rating: 4.9,
    reviewsCount: 245,
    isVeg: true,
    prepTime: "10-12 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: true,
    calories: "560 kcal",
    tags: ["Heavy Lunch"],
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 16,
    name: "Cold Coffee with Chocolate",
    category: "Drinks",
    price: 50,
    description: "Chilled, thick blended milk coffee served with rich chocolate drizzle and coffee foam on top.",
    rating: 4.9,
    reviewsCount: 380,
    isVeg: true,
    prepTime: "3-5 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: true,
    calories: "210 kcal",
    tags: ["Campus Hero", "Chilled"],
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 17,
    name: "Fresh Lemon Mint Cooler",
    category: "Drinks",
    price: 30,
    description: "Zesty squeezed fresh lemons, garden mint leaves, rock salt, and chilled soda for an instant refresher.",
    rating: 4.6,
    reviewsCount: 110,
    isVeg: true,
    prepTime: "3 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: false,
    calories: "85 kcal",
    tags: ["Refreshing", "Low Cal"],
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 18,
    name: "Masala Chaas",
    category: "Drinks",
    price: 25,
    description: "Traditional spiced buttermilk with crushed roasted cumin, black salt, fresh ginger, and green chili essence.",
    rating: 4.7,
    reviewsCount: 92,
    isVeg: true,
    prepTime: "2 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: false,
    calories: "60 kcal",
    tags: ["Digestive", "Healthy"],
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 19,
    name: "Oreo Thickshake",
    category: "Drinks",
    price: 65,
    description: "Decadent vanilla dairy shake crushed with whole chocolate Oreo biscuits and Belgian chocolate sauce.",
    rating: 4.8,
    reviewsCount: 140,
    isVeg: true,
    prepTime: "5 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: false,
    calories: "390 kcal",
    tags: ["Indulgent"],
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 20,
    name: "Warm Chocolate Brownie",
    category: "Desserts",
    price: 45,
    description: "Fudgy rich Dutch chocolate brownie served warm with a gooey melted chocolate center.",
    rating: 4.8,
    reviewsCount: 165,
    isVeg: true,
    prepTime: "3 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: true,
    calories: "290 kcal",
    tags: ["Sweet Tooth", "Fudgy"],
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 21,
    name: "Sizzling Brownie with Ice Cream",
    category: "Desserts",
    price: 75,
    description: "Hot sizzling brownie plate topped with a scoop of Madagascar vanilla ice cream and streaming hot fudge sauce.",
    rating: 4.9,
    reviewsCount: 215,
    isVeg: true,
    prepTime: "5-7 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: false,
    calories: "440 kcal",
    tags: ["Celebration", "Hot & Cold"],
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 22,
    name: "Classic Vanilla Ice Cream",
    category: "Desserts",
    price: 30,
    description: "Velvety smooth double scoop of classic dairy vanilla ice cream with rainbow sprinkles.",
    rating: 4.5,
    reviewsCount: 84,
    isVeg: true,
    prepTime: "2 min",
    isAvailable: true,
    isSpecial: false,
    isPopular: false,
    calories: "180 kcal",
    tags: ["Cooler"],
    image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80"
  }
];

const CampusBiteAPI = {
  // Fetch all foods or query
  async getFoods(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE}/foods${query ? `?${query}` : ''}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('API fetch failed');
      const json = await response.json();
      return json.data;
    } catch (err) {
      console.warn('CampusBite API: using local dataset fallback', err.message);
      let list = [...FALLBACK_FOODS];
      if (params.category && params.category.toLowerCase() !== 'all') {
        list = list.filter(item => item.category.toLowerCase() === params.category.toLowerCase());
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(item => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
      }
      if (params.veg === 'true') {
        list = list.filter(item => item.isVeg === true);
      }
      if (params.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
      if (params.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
      if (params.sort === 'popular') list.sort((a, b) => b.rating - a.rating);
      return list;
    }
  },

  // Fetch today's special
  async getTodaySpecial() {
    try {
      const response = await fetch(`${API_BASE}/foods/specials/today`);
      if (!response.ok) throw new Error('API failed');
      const json = await response.json();
      return json.data;
    } catch (err) {
      return FALLBACK_FOODS.find(item => item.isSpecial) || FALLBACK_FOODS[0];
    }
  },

  // Fetch single food item
  async getFoodById(id) {
    try {
      const response = await fetch(`${API_BASE}/foods/${id}`);
      if (!response.ok) throw new Error('API failed');
      const json = await response.json();
      return json.data;
    } catch (err) {
      return FALLBACK_FOODS.find(item => item.id === parseInt(id, 10)) || null;
    }
  },

  // Submit new order
  async createOrder(orderPayload) {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || (data.errors ? data.errors.join(', ') : 'Failed to place order.'));
      }
      return data.data;
    } catch (err) {
      console.warn('CampusBite API: using local order storage fallback', err.message);
      // Local fallback for offline/direct file viewing
      const subtotal = orderPayload.items.reduce((s, i) => s + (i.price * i.quantity), 0);
      const tax = Math.round(subtotal * 0.05);
      const total = subtotal + tax;
      const orderNumber = `#CB${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder = {
        id: `ord-${Date.now()}`,
        orderNumber,
        ...orderPayload,
        subtotal,
        tax,
        total,
        status: 'Placed',
        estimatedPrepTime: '10-15 min',
        createdAt: new Date().toISOString(),
        statusTimestamps: {
          Placed: new Date().toISOString()
        }
      };

      // Save to localStorage
      const stored = JSON.parse(localStorage.getItem('campusbite_orders') || '[]');
      stored.unshift(newOrder);
      localStorage.setItem('campusbite_orders', JSON.stringify(stored));
      return newOrder;
    }
  },

  // Fetch all orders
  async getOrders() {
    try {
      const response = await fetch(`${API_BASE}/orders`);
      if (!response.ok) throw new Error('API failed');
      const json = await response.json();
      return json.data;
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('campusbite_orders') || '[]');
      return stored;
    }
  },

  // Fetch order by ID or orderNumber
  async getOrder(id) {
    try {
      const response = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}`);
      if (!response.ok) throw new Error('API failed');
      const json = await response.json();
      return json.data;
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('campusbite_orders') || '[]');
      return stored.find(o => o.id === id || o.orderNumber === id) || null;
    }
  },

  // Update order status (for Staff / Simulator)
  async updateOrderStatus(id, newStatus) {
    try {
      const response = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('API failed');
      const json = await response.json();
      return json.data;
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('campusbite_orders') || '[]');
      const order = stored.find(o => o.id === id || o.orderNumber === id);
      if (order) {
        order.status = newStatus;
        if (!order.statusTimestamps) order.statusTimestamps = {};
        order.statusTimestamps[newStatus] = new Date().toISOString();
        localStorage.setItem('campusbite_orders', JSON.stringify(stored));
        return order;
      }
      return null;
    }
  }
};

window.CampusBiteAPI = CampusBiteAPI;
