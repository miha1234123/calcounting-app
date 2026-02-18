// routes/food.js
const express = require('express');
const FoodEntry = require('../models/FoodEntry');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/food/add
 * Add a new meal entry for the current user
 */
router.post('/add', auth, async (req, res) => {
  try {
    const { mealType, foods } = req.body;

    const newEntry = new FoodEntry({
      userId: req.userId,
      mealType,
      foods,
    });

    // compute totals
    const totals = foods.reduce(
      (sum, f) => {
        sum.calories += f.nutrition?.calories || 0;
        sum.protein += f.nutrition?.protein || 0;
        sum.carbs += f.nutrition?.carbs || 0;
        sum.fat += f.nutrition?.fat || 0;
        return sum;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    newEntry.totalNutrition = totals;
    await newEntry.save();

    res.status(201).json({ message: 'Food entry saved', entry: newEntry });
  } catch (error) {
    res.status(500).json({ message: 'Error saving food entry', error: error.message });
  }
});

/**
 * GET /api/food/history
 * Get all meals logged by the user
 */
router.get('/history', auth, async (req, res) => {
  try {
    const entries = await FoodEntry.find({ userId: req.userId }).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error getting meal history', error: error.message });
  }
});

module.exports = router;
