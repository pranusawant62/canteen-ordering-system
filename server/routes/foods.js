const express = require('express');
const router = express.Router();
const foodsData = require('../data/foods.json');

// GET /api/foods - Retrieve foods with optional search, category, sort, and veg filter
router.get('/', (req, res) => {
  try {
    let result = [...foodsData];
    const { category, search, sort, veg } = req.query;

    // Filter by Category
    if (category && category.toLowerCase() !== 'all') {
      result = result.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Search query (name, description, tags)
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    // Filter by Veg
    if (veg !== undefined && veg !== '') {
      const isVegBool = veg === 'true' || veg === '1';
      result = result.filter(item => item.isVeg === isVegBool);
    }

    // Sorting
    if (sort) {
      if (sort === 'price-asc') {
        result.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-desc') {
        result.sort((a, b) => b.price - a.price);
      } else if (sort === 'popular') {
        result.sort((a, b) => b.rating - a.rating);
      }
    }

    res.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch food items.' });
  }
});

// GET /api/foods/specials - Retrieve today's highlighted special
router.get('/specials/today', (req, res) => {
  const special = foodsData.find(item => item.isSpecial) || foodsData[0];
  res.json({
    success: true,
    data: special
  });
});

// GET /api/foods/:id - Retrieve specific food item
router.get('/:id', (req, res) => {
  const foodId = parseInt(req.params.id, 10);
  const food = foodsData.find(item => item.id === foodId);

  if (!food) {
    return res.status(404).json({
      success: false,
      message: `Food item with ID ${req.params.id} not found.`
    });
  }

  res.json({
    success: true,
    data: food
  });
});

module.exports = router;
