const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server/app');

test('CampusBite Orders and Checkout API', async (t) => {

  await t.test('POST /api/orders should successfully create an order with valid data', async () => {
    const newOrderData = {
      studentName: 'Pranali Sawant',
      studentId: 'CS2023-042',
      collegeEmail: 'pranali@college.edu',
      phone: '9876543210',
      department: 'Computer Engineering',
      year: '3rd Year',
      pickupPreference: 'As soon as ready',
      specialInstructions: 'Less spicy',
      items: [
        { foodId: 1, quantity: 2 }, // Cheese Burger (70 * 2 = 140)
        { foodId: 16, quantity: 1 }  // Cold Coffee (50 * 1 = 50)
      ]
    };

    const res = await request(app)
      .post('/api/orders')
      .send(newOrderData);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.orderNumber.startsWith('#CB'));
    assert.equal(res.body.data.studentName, 'Pranali Sawant');
    assert.equal(res.body.data.subtotal, 190);
    assert.equal(res.body.data.tax, 10); // 5% of 190 is 9.5 rounded to 10
    assert.equal(res.body.data.total, 200);
    assert.equal(res.body.data.status, 'Placed');
  });

  await t.test('POST /api/orders should reject empty cart', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        studentName: 'Pranali Sawant',
        studentId: 'CS2023-042',
        collegeEmail: 'pranali@college.edu',
        phone: '9876543210',
        department: 'Computer Engineering',
        year: '3rd Year',
        items: []
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors.some(e => e.includes('cart is empty')));
  });

  await t.test('POST /api/orders should validate student details (missing email and phone)', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        studentName: '',
        studentId: '',
        collegeEmail: 'invalid-email',
        phone: '123',
        department: '',
        year: '',
        items: [{ foodId: 1, quantity: 1 }]
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors.length >= 4);
  });

  await t.test('POST /api/orders should reject sold out items (Cheese Corn Balls)', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        studentName: 'Pranali Sawant',
        studentId: 'CS2023-042',
        collegeEmail: 'pranali@college.edu',
        phone: '9876543210',
        department: 'Computer Engineering',
        year: '3rd Year',
        items: [{ foodId: 11, quantity: 1 }] // food 11 is Cheese Corn Balls (isAvailable: false)
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('sold out'));
  });

  await t.test('GET /api/orders/:id should fetch order by orderNumber', async () => {
    const res = await request(app).get('/api/orders/CB1021');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.orderNumber, '#CB1021');
  });

  await t.test('PATCH /api/orders/:id/status should update order lifecycle status', async () => {
    const res = await request(app)
      .patch('/api/orders/CB1021/status')
      .send({ status: 'Ready' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'Ready');
    assert.ok(res.body.data.statusTimestamps.Ready);
  });

  await t.test('PATCH /api/orders/:id/status should reject invalid status', async () => {
    const res = await request(app)
      .patch('/api/orders/CB1021/status')
      .send({ status: 'Eating' });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });
});
