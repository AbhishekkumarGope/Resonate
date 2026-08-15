const express = require('express');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET /api/users/nearby - Get nearby users
router.get('/nearby', protect, async (req, res, next) => {
  try {
    const { lng, lat, maxDistance = 25000 } = req.query; // maxDistance in meters
    const longitude = parseFloat(lng) || req.user.location.coordinates[0];
    const latitude = parseFloat(lat) || req.user.location.coordinates[1];

    if (!longitude || !latitude) {
      return res.status(400).json({ success: false, message: 'Location required' });
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      isBlocked: false,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
    .select('name profileImage bio interests isOnline location trustScore verification.isVerified')
    .limit(50);

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/search - Search users
router.get('/search', protect, async (req, res, next) => {
  try {
    const { q, interests, gender, minAge, maxAge } = req.query;
    const filter = { _id: { $ne: req.user._id }, isBlocked: false };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ];
    }

    if (interests) {
      filter.interests = { $in: interests.split(',') };
    }

    if (gender && gender !== 'all') {
      filter.gender = gender;
    }

    const users = await User.find(filter)
      .select('name profileImage bio interests isOnline location trustScore verification.isVerified')
      .limit(50);

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Get user profile
router.get('/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -blockedUsers')
      .populate('friends', 'name profileImage isOnline');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/:id - Update user profile
router.patch('/:id', protect, async (req, res, next) => {
  try {
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only update your own profile' });
    }

    const allowedFields = ['name', 'phone', 'bio', 'gender', 'dateOfBirth', 'interests', 'languages', 'availability', 'location', 'profileImage', 'coverImage'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/update-location - Update user location
router.post('/update-location', protect, async (req, res, next) => {
  try {
    const { latitude, longitude, address, city } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        address: address || '',
        city: city || ''
      }
    });

    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/verification - Submit verification
router.post('/verification', protect, async (req, res, next) => {
  try {
    const { document } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      'verification.status': 'pending',
      'verification.document': document
    });

    res.json({ success: true, message: 'Verification submitted' });
  } catch (error) {
    next(error);
  }
});

// Friend request routes
// POST /api/users/friend-request/:id - Send friend request
router.post('/friend-request/:id', protect, async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if already friends
    if (req.user.friends.includes(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Already friends' });
    }

    // Check if request already exists
    const existingRequest = targetUser.friendRequests.find(
      r => r.from.toString() === req.user._id.toString() && r.status === 'pending'
    );
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Friend request already sent' });
    }

    targetUser.friendRequests.push({ from: req.user._id });
    await targetUser.save({ validateBeforeSave: false });

    // Create notification
    await Notification.create({
      user: targetUser._id,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${req.user.name} sent you a friend request`,
      data: { userId: req.user._id },
      link: `/profile/${req.user._id}`
    });

    res.json({ success: true, message: 'Friend request sent' });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/friend-request/:id - Accept/reject friend request
router.patch('/friend-request/:id', protect, async (req, res, next) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const requestIndex = req.user.friendRequests.findIndex(
      r => r.from.toString() === req.params.id && r.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(404).json({ success: false, message: 'Friend request not found' });
    }

    if (action === 'accept') {
      req.user.friendRequests[requestIndex].status = 'accepted';
      req.user.friends.push(req.params.id);
      await req.user.save({ validateBeforeSave: false });

      // Add to other user's friends
      await User.findByIdAndUpdate(req.params.id, {
        $push: { friends: req.user._id }
      });

      // Notification
      await Notification.create({
        user: req.params.id,
        type: 'friend_accepted',
        title: 'Friend Request Accepted',
        message: `${req.user.name} accepted your friend request`,
        data: { userId: req.user._id },
        link: `/profile/${req.user._id}`
      });
    } else {
      req.user.friendRequests[requestIndex].status = 'rejected';
      await req.user.save({ validateBeforeSave: false });
    }

    res.json({ success: true, message: `Friend request ${action}ed` });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/friends/list - Get friends list
router.get('/friends/list', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name profileImage bio isOnline lastSeen');

    res.json({ success: true, friends: user.friends });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/friend-requests/pending - Get pending friend requests
router.get('/friend-requests/pending', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friendRequests.from', 'name profileImage bio');

    const pending = user.friendRequests.filter(r => r.status === 'pending');
    res.json({ success: true, requests: pending });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
