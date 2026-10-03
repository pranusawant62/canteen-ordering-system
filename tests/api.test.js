const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server/app');

test('CampusBite API Endpoints', async (t) => {

  await t.test('GET / should serve index.html with 200 status', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('CampusBite'));
    assert.ok(res.text.includes('Skip the queue. Grab your bite.'));
  });

  await t.test('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.service, 'CampusBite API');
  });

  await t.test('GET /api/foods should load complete food menu', async () => {
    const res = await request(app).get('/api/foods');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.count >= 15, 'Should have at least 15 food items');
    
    // Check structure of first item
    const firstItem = res.body.data[0];
    assert.ok(firstItem.id);
    assert.ok(firstItem.name);
    assert.ok(firstItem.price > 0);
    assert.ok(firstItem.category);
    assert.ok(firstItem.rating);
    assert.ok(firstItem.image);
  });

  await t.test('GET /api/foods?category=Snacks should filter snacks only', async () => {
    const res = await request(app).get('/api/foods?category=Snacks');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length > 0);
    res.body.data.forEach(item => {
      assert.equal(item.category, 'Snacks');
    });
  });

  await t.test('GET /api/foods?search=burger should search foods matching "burger"', async () => {
    const res = await request(app).get('/api/foods?search=burger');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length > 0);
    res.body.data.forEach(item => {
      const match = item.name.toLowerCase().includes('burger') || 
                    item.description.toLowerCase().includes('burger');
      assert.ok(match, `Item ${item.name} should match "burger"`);
    });
  });

  await t.test('GET /api/foods?sort=price-asc should sort prices ascending', async () => {
    const res = await request(app).get('/api/foods?sort=price-asc');
    assert.equal(res.status, 200);
    const prices = res.body.data.map(item => item.price);
    for (let i = 0; i < prices.length - 1; i++) {
      assert.ok(prices[i] <= prices[i + 1], `Price ${prices[i]} should be <= ${prices[i+1]}`);
    }
  });

  await t.test('GET /api/foods/specials/today should return today\'s special', async () => {
    const res = await request(app).get('/api/foods/specials/today');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.name);
    assert.equal(res.body.data.isSpecial, true);
  });

  await t.test('GET /api/foods/:id should return single food item', async () => {
    const res = await request(app).get('/api/foods/1');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, 1);
    assert.equal(res.body.data.name, 'Cheese Burger');
  });

  await t.test('GET /api/foods/9999 should return 404 for nonexistent item', async () => {
    const res = await request(app).get('/api/foods/9999');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});
