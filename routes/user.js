// routes/user.js
const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/user/profile
 * Returns the basic profile of a logged‑in user
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


/**
 * PUT /api/user/profile
 * Allows updating height, weight, activity level, or goal
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body.profile || {};
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { profile: updates } },
      { new: true }
    );
    res.json({
      message: 'Profile updated',
      user: user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

module.exports = router;
