const express = require('express');
const Companion = require('../models/Companion');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// POST /api/companions/register - Register as companion
router.post('/register', protect, async (req, res, next) => {
  try {
    const existing = await Companion.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already registered as companion' });
    }

    const companion = await Companion.create({
      user: req.user._id,
      ...req.body,
      location: req.user.location
    });

    await User.findByIdAndUpdate(req.user._id, { isCompanion: true });

    res.status(201).json({ success: true, companion });
  } catch (error) {
    next(error);
  }
});

// GET /api/companions - Get all companions
router.get('/', protect, async (req, res, next) => {
  try {
    const { specialty, minRate, maxRate, search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (specialty) filter.specialties = specialty;
    if (minRate || maxRate) {
      filter.hourlyRate = {};
      if (minRate) filter.hourlyRate.$gte = parseInt(minRate);
      if (maxRate) filter.hourlyRate.$lte = parseInt(maxRate);
    }

    const companions = await Companion.find(filter)
      .populate('user', 'name profileImage bio trustScore verification.isVerified isOnline')
      .sort('-rating')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Companion.countDocuments(filter);

    res.json({ success: true, companions, total });
  } catch (error) {
    next(error);
  }
});

// GET /api/companions/nearby - Nearby companions
router.get('/nearby', protect, async (req, res, next) => {
  try {
    const { lng, lat, maxDistance = 25000 } = req.query;
    const longitude = parseFloat(lng) || req.user.location.coordinates[0];
    const latitude = parseFloat(lat) || req.user.location.coordinates[1];

    const companions = await Companion.find({
      isActive: true,
      availability: 'available',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
    .populate('user', 'name profileImage bio trustScore verification.isVerified isOnline')
    .limit(20);

    res.json({ success: true, companions });
  } catch (error) {
    next(error);
  }
});

// GET /api/companions/:id - Get companion details
router.get('/:id', protect, async (req, res, next) => {
  try {
    const companion = await Companion.findById(req.params.id)
      .populate('user', 'name profileImage bio trustScore verification interests languages isOnline location');

    if (!companion) {
      return res.status(404).json({ success: false, message: 'Companion not found' });
    }

    res.json({ success: true, companion });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/companions/:id - Update companion profile
router.patch('/:id', protect, async (req, res, next) => {
  try {
    const companion = await Companion.findById(req.params.id);
    if (!companion) {
      return res.status(404).json({ success: false, message: 'Companion not found' });
    }

    if (companion.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Companion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, companion: updated });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
