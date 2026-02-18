// routes/progress.js
const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/progress/photos
 * Return all stored progress photos for the user
 */
router.get('/photos', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('bodyPhotos');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ bodyPhotos: user.bodyPhotos || [] });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving progress photos', error: error.message });
  }
});

/**
 * POST /api/progress/photo
 * Save a new monthly progress photo
 */
router.post('/photo', auth, async (req, res) => {
  try {
    const { photoPath, analysis } = req.body;
    const update = {
      $push: {
        bodyPhotos: {
          photo: photoPath,
          analysis: analysis || {},
          date: new Date(),
        },
      },
    };
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true });
    res.json({ message: 'Progress photo added', bodyPhotos: user.bodyPhotos });
  } catch (error) {
    res.status(500).json({ message: 'Error saving progress photo', error: error.message });
  }
});

/**
 * GET /api/progress/summary
 * Return summary of earliest vs latest photo dates
 */
router.get('/summary', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('bodyPhotos');
    if (!user || !user.bodyPhotos || user.bodyPhotos.length === 0) {
      return res.json({ message: 'No progress photos found' });
    }

    const sorted = user.bodyPhotos.sort((a, b) => new Date(a.date) - new Date(b.date));
    const first = sorted[0];
    const latest = sorted[sorted.length - 1];

    res.json({
      totalPhotos: user.bodyPhotos.length,
      firstDate: first.date,
      latestDate: latest.date,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating summary', error: error.message });
  }
});

module.exports = router;
