const express = require('express');
const Community = require('../models/Community');
const { protect } = require('../middleware/auth');
const router = express.Router();

// POST /api/communities - Create community
router.post('/', protect, async (req, res, next) => {
  try {
    const community = await Community.create({
      ...req.body,
      creator: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
      memberCount: 1
    });

    res.status(201).json({ success: true, community });
  } catch (error) {
    next(error);
  }
});

// GET /api/communities - Get all communities
router.get('/', protect, async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const communities = await Community.find(filter)
      .populate('creator', 'name profileImage')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Community.countDocuments(filter);

    res.json({ success: true, communities, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// GET /api/communities/nearby - Get nearby communities
router.get('/nearby', protect, async (req, res, next) => {
  try {
    const { lng, lat, maxDistance = 25000 } = req.query;
    const longitude = parseFloat(lng) || req.user.location.coordinates[0];
    const latitude = parseFloat(lat) || req.user.location.coordinates[1];

    const communities = await Community.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
    .populate('creator', 'name profileImage')
    .limit(20);

    res.json({ success: true, communities });
  } catch (error) {
    next(error);
  }
});

// GET /api/communities/my - Get user's communities
router.get('/my', protect, async (req, res, next) => {
  try {
    const communities = await Community.find({
      'members.user': req.user._id
    }).populate('creator', 'name profileImage');

    res.json({ success: true, communities });
  } catch (error) {
    next(error);
  }
});

// GET /api/communities/:id - Get community details
router.get('/:id', protect, async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('creator', 'name profileImage')
      .populate('members.user', 'name profileImage isOnline');

    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    res.json({ success: true, community });
  } catch (error) {
    next(error);
  }
});

// POST /api/communities/:id/join - Join community
router.post('/:id/join', protect, async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    const isMember = community.members.some(m => m.user.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    community.members.push({ user: req.user._id });
    community.memberCount += 1;
    await community.save();

    res.json({ success: true, message: 'Joined community' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/communities/:id/leave - Leave community
router.delete('/:id/leave', protect, async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    community.members = community.members.filter(m => m.user.toString() !== req.user._id.toString());
    community.memberCount = Math.max(0, community.memberCount - 1);
    await community.save();

    res.json({ success: true, message: 'Left community' });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/communities/:id - Update community
router.patch('/:id', protect, async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    if (community.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Community.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, community: updated });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
