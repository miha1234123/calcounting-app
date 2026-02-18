const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { calculateDailyCalories } = require('../utils/nutritionCalculator');
const upload = require('../middleware/upload');

const router = express.Router();

// Register
router.post('/register', upload.single('bodyPhoto'), async (req, res) => {
  try {
    const { email, password, height, weight, age, gender, activityLevel, goal } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Calculate daily calorie goal
    const dailyCalorieGoal = calculateDailyCalories({
      height: parseInt(height),
      weight: parseInt(weight),
      age: parseInt(age),
      gender,
      activityLevel: activityLevel || 'moderate',
      goal: goal || 'maintain_weight'
    });

    const user = new User({
      email,
      password,
      profile: {
        height: parseInt(height),
        weight: parseInt(weight),
        age: parseInt(age),
        gender,
        activityLevel: activityLevel || 'moderate',
        goal: goal || 'maintain_weight',
        dailyCalorieGoal,
        initialBodyPhoto: req.file ? req.file.path : null
      }
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
