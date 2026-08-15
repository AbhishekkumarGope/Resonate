const express = require('express');
const MarketplaceItem = require('../models/MarketplaceItem');
const { protect } = require('../middleware/auth');
const router = express.Router();

// POST /api/marketplace - Create listing
router.post('/', protect, async (req, res, next) => {
  try {
    const item = await MarketplaceItem.create({
      ...req.body,
      seller: req.user._id,
      location: req.body.location || req.user.location
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
});

// GET /api/marketplace - Get listings
router.get('/', protect, async (req, res, next) => {
  try {
    const { category, type, minPrice, maxPrice, search, condition, page = 1, limit = 20 } = req.query;
    const filter = { status: 'active' };

    if (category && category !== 'all') filter.category = category;
    if (type && type !== 'all') filter.type = type;
    if (condition) filter.condition = condition;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    const items = await MarketplaceItem.find(filter)
      .populate('seller', 'name profileImage trustScore')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await MarketplaceItem.countDocuments(filter);

    res.json({ success: true, items, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// GET /api/marketplace/nearby - Nearby items
router.get('/nearby', protect, async (req, res, next) => {
  try {
    const { lng, lat, maxDistance = 25000 } = req.query;
    const longitude = parseFloat(lng) || req.user.location.coordinates[0];
    const latitude = parseFloat(lat) || req.user.location.coordinates[1];

    const items = await MarketplaceItem.find({
      status: 'active',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
    .populate('seller', 'name profileImage')
    .limit(20);

    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

// GET /api/marketplace/my - My listings
router.get('/my', protect, async (req, res, next) => {
  try {
    const items = await MarketplaceItem.find({ seller: req.user._id }).sort('-createdAt');
    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

// GET /api/marketplace/:id - Get item details
router.get('/:id', protect, async (req, res, next) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id)
      .populate('seller', 'name profileImage bio trustScore verification.isVerified location');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Increment views
    item.views += 1;
    await item.save();

    res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/marketplace/:id - Update listing
router.patch('/:id', protect, async (req, res, next) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await MarketplaceItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, item: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/marketplace/:id - Delete listing
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await MarketplaceItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Listing deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
