const express = require('express');
const router = express.Router();
const foodsData = require('../data/foods.json');

// In-memory orders store with realistic sample orders
let nextOrderSequence = 1024;
let orders = [
  {
    id: "ord-1021",
    orderNumber: "#CB1021",
    studentName: "Pranali Sawant",
    studentId: "CS2023-042",
    collegeEmail: "pranali.s@college.edu",
    phone: "9876543210",
    department: "Computer Engineering",
    year: "3rd Year",
    pickupPreference: "As soon as ready",
    specialInstructions: "Extra green chutney please",
    items: [
      {
        foodId: 1,
        name: "Cheese Burger",
        price: 70,
        quantity: 1,
        itemTotal: 70,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"
      },
      {
        foodId: 9,
        name: "French Fries",
        price: 50,
        quantity: 1,
        itemTotal: 50,
        image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80"
      }
    ],
    subtotal: 120,
    tax: 6,
    total: 126,
    status: "Completed",
    estimatedPrepTime: "10-15 min",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    statusTimestamps: {
      Placed: new Date(Date.now() - 3600000 * 24).toISOString(),
      Accepted: new Date(Date.now() - 3600000 * 24 + 120000).toISOString(),
      Preparing: new Date(Date.now() - 3600000 * 24 + 300000).toISOString(),
      Ready: new Date(Date.now() - 3600000 * 24 + 800000).toISOString(),
      Completed: new Date(Date.now() - 3600000 * 24 + 1100000).toISOString()
    }
  },
  {
    id: "ord-1022",
    orderNumber: "#CB1022",
    studentName: "Aditya Verma",
    studentId: "IT2024-019",
    collegeEmail: "aditya.v@college.edu",
    phone: "9823456781",
    department: "Information Technology",
    year: "2nd Year",
    pickupPreference: "Next break (1:15 PM)",
    specialInstructions: "Make cold coffee extra strong",
    items: [
      {
        foodId: 2,
        name: "Cheese Sandwich",
        price: 55,
        quantity: 2,
        itemTotal: 110,
        image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80"
      },
      {
        foodId: 16,
        name: "Cold Coffee with Chocolate",
        price: 50,
        quantity: 1,
        itemTotal: 50,
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80"
      }
    ],
    subtotal: 160,
    tax: 8,
    total: 168,
    status: "Completed",
    estimatedPrepTime: "10-12 min",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    statusTimestamps: {
      Placed: new Date(Date.now() - 3600000 * 5).toISOString(),
      Accepted: new Date(Date.now() - 3600000 * 5 + 100000).toISOString(),
      Preparing: new Date(Date.now() - 3600000 * 5 + 250000).toISOString(),
      Ready: new Date(Date.now() - 3600000 * 5 + 650000).toISOString(),
      Completed: new Date(Date.now() - 3600000 * 5 + 900000).toISOString()
    }
  }
];

const VALID_STATUSES = ['Placed', 'Accepted', 'Preparing', 'Ready', 'Completed'];

// Helper for email regex
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// GET /api/orders - List all orders, optionally filtered by studentId or email
router.get('/', (req, res) => {
  const { studentId, email } = req.query;
  let result = [...orders];

  if (studentId) {
    result = result.filter(o => o.studentId.toLowerCase() === studentId.toLowerCase());
  } else if (email) {
    result = result.filter(o => o.collegeEmail.toLowerCase() === email.toLowerCase());
  }

  // Sort latest first
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    success: true,
    count: result.length,
    data: result
  });
});

// GET /api/orders/:id - Get specific order by ID or orderNumber
router.get('/:id', (req, res) => {
  const lookup = req.params.id.trim();
  const order = orders.find(
    o => o.id === lookup || o.orderNumber.toLowerCase() === lookup.toLowerCase() || o.orderNumber.replace('#', '').toLowerCase() === lookup.toLowerCase()
  );

  if (!order) {
    return res.status(404).json({
      success: false,
      message: `Order '${req.params.id}' not found. Please check your order number.`
    });
  }

  res.json({
    success: true,
    data: order
  });
});

// POST /api/orders - Place a new order
router.post('/', (req, res) => {
  try {
    const {
      studentName,
      studentId,
      collegeEmail,
      phone,
      department,
      year,
      pickupPreference,
      specialInstructions,
      items
    } = req.body;

    // Field validation
    const errors = [];
    if (!studentName || studentName.trim().length < 2) {
      errors.push('Full name must be at least 2 characters.');
    }
    if (!studentId || studentId.trim().length < 2) {
      errors.push('Valid Student ID is required.');
    }
    if (!collegeEmail || !isValidEmail(collegeEmail)) {
      errors.push('A valid college email address is required.');
    }
    if (!phone || phone.trim().replace(/\D/g, '').length < 10) {
      errors.push('Phone number must have at least 10 digits.');
    }
    if (!department || department.trim() === '') {
      errors.push('Please select or specify your department.');
    }
    if (!year || year.trim() === '') {
      errors.push('Please select your study year.');
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      errors.push('Your cart is empty. Please add food items before placing an order.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors
      });
    }

    // Item verification & price calculation
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const foodItem = foodsData.find(f => f.id === parseInt(item.foodId || item.id, 10));

      if (!foodItem) {
        return res.status(400).json({
          success: false,
          message: `Food item #${item.foodId || item.id} is invalid or no longer available.`
        });
      }

      if (foodItem.isAvailable === false) {
        return res.status(400).json({
          success: false,
          message: `'${foodItem.name}' is currently sold out. Please remove it from your cart.`
        });
      }

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for '${foodItem.name}'. Must be at least 1.`
        });
      }

      const itemTotal = foodItem.price * qty;
      subtotal += itemTotal;

      processedItems.push({
        foodId: foodItem.id,
        name: foodItem.name,
        price: foodItem.price,
        quantity: qty,
        itemTotal,
        image: foodItem.image,
        isVeg: foodItem.isVeg
      });
    }

    // 5% canteen GST/tax rounded to whole rupees (minimum 1 if subtotal > 0)
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    const orderNumber = `#CB${nextOrderSequence++}`;
    const newOrderId = `ord-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newOrder = {
      id: newOrderId,
      orderNumber,
      studentName: studentName.trim(),
      studentId: studentId.trim().toUpperCase(),
      collegeEmail: collegeEmail.trim().toLowerCase(),
      phone: phone.trim(),
      department: department.trim(),
      year: year.trim(),
      pickupPreference: pickupPreference || 'As soon as ready',
      specialInstructions: (specialInstructions || '').trim(),
      items: processedItems,
      subtotal,
      tax,
      total,
      status: 'Placed',
      estimatedPrepTime: '10-15 min',
      createdAt: nowIso,
      statusTimestamps: {
        Placed: nowIso
      }
    };

    orders.unshift(newOrder);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: newOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error while placing order.',
      error: error.message
    });
  }
});

// PATCH /api/orders/:id/status - Update order status (Staff / Demo simulator)
router.patch('/:id/status', (req, res) => {
  const lookup = req.params.id.trim();
  const order = orders.find(
    o => o.id === lookup || o.orderNumber.toLowerCase() === lookup.toLowerCase() || o.orderNumber.replace('#', '').toLowerCase() === lookup.toLowerCase()
  );

  if (!order) {
    return res.status(404).json({
      success: false,
      message: `Order '${req.params.id}' not found.`
    });
  }

  const { status } = req.body;
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status '${status}'. Allowed statuses: ${VALID_STATUSES.join(', ')}`
    });
  }

  order.status = status;
  if (!order.statusTimestamps) {
    order.statusTimestamps = {};
  }
  order.statusTimestamps[status] = new Date().toISOString();

  res.json({
    success: true,
    message: `Order status updated to '${status}'.`,
    data: order
  });
});

module.exports = router;
