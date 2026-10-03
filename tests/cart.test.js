const test = require('node:test');
const assert = require('node:assert/strict');

// Cart calculation helper matching client-side logic
function calculateCartTotals(items, taxRate = 0.05) {
  if (!items || items.length === 0) {
    return { subtotal: 0, tax: 0, total: 0, itemCount: 0 };
  }

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return { subtotal, tax, total, itemCount };
}

function addToCart(cart, food, quantity = 1) {
  const existingIndex = cart.findIndex(item => item.id === food.id);
  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
      isVeg: food.isVeg,
      quantity
    });
  }
  return cart;
}

function updateQuantity(cart, foodId, change) {
  const itemIndex = cart.findIndex(item => item.id === foodId);
  if (itemIndex === -1) return cart;

  cart[itemIndex].quantity += change;
  if (cart[itemIndex].quantity <= 0) {
    cart.splice(itemIndex, 1);
  }
  return cart;
}

test('Cart Logic & Math Calculations', async (t) => {
  await t.test('calculates empty cart correctly', () => {
    const totals = calculateCartTotals([]);
    assert.equal(totals.subtotal, 0);
    assert.equal(totals.tax, 0);
    assert.equal(totals.total, 0);
    assert.equal(totals.itemCount, 0);
  });

  await t.test('adds new food item to cart', () => {
    const cart = [];
    const food = { id: 1, name: 'Cheese Burger', price: 70, image: 'img.jpg', isVeg: true };
    addToCart(cart, food, 1);

    assert.equal(cart.length, 1);
    assert.equal(cart[0].id, 1);
    assert.equal(cart[0].quantity, 1);

    const totals = calculateCartTotals(cart);
    assert.equal(totals.subtotal, 70);
    assert.equal(totals.tax, 4); // 70 * 0.05 = 3.5 -> 4
    assert.equal(totals.total, 74);
    assert.equal(totals.itemCount, 1);
  });

  await t.test('increments quantity when existing food item is added again', () => {
    const cart = [{ id: 1, name: 'Cheese Burger', price: 70, quantity: 1 }];
    const food = { id: 1, name: 'Cheese Burger', price: 70 };
    addToCart(cart, food, 2);

    assert.equal(cart.length, 1);
    assert.equal(cart[0].quantity, 3);

    const totals = calculateCartTotals(cart);
    assert.equal(totals.subtotal, 210);
    assert.equal(totals.tax, 11); // 210 * 0.05 = 10.5 -> 11
    assert.equal(totals.total, 221);
    assert.equal(totals.itemCount, 3);
  });

  await t.test('decrements quantity and removes item when reaching 0', () => {
    let cart = [
      { id: 1, name: 'Cheese Burger', price: 70, quantity: 2 },
      { id: 2, name: 'Cold Coffee', price: 50, quantity: 1 }
    ];

    updateQuantity(cart, 1, -1);
    assert.equal(cart.find(i => i.id === 1).quantity, 1);

    updateQuantity(cart, 2, -1);
    assert.equal(cart.find(i => i.id === 2), undefined);
    assert.equal(cart.length, 1);
  });
});
