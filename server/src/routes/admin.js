const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const Community = require('../models/Community');
const Companion = require('../models/Companion');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const MarketplaceItem = require('../models/MarketplaceItem');
const Report = require('../models/Report');
const Review = require('../models/Review');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// All routes require admin
router.use(protect, adminOnly);

// GET /api/admin/stats - Dashboard stats
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      onlineUsers,
      blockedUsers,
      totalCompanions,
      totalEvents,
      upcomingEvents,
      totalBookings,
      completedBookings,
      totalCommunities,
      totalMarketplaceItems,
      pendingReports,
      totalReviews,
      totalPayments
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ 'verification.isVerified': true }),
      User.countDocuments({ isOnline: true }),
      User.countDocuments({ isBlocked: true }),
      Companion.countDocuments(),
      Event.countDocuments(),
      Event.countDocuments({ status: 'upcoming' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Community.countDocuments(),
      MarketplaceItem.countDocuments({ status: 'active' }),
      Report.countDocuments({ status: 'pending' }),
      Review.countDocuments(),
      Payment.countDocuments({ status: 'captured' })
    ]);

    // Revenue calculation
    const revenue = await Payment.aggregate([
      { $match: { status: 'captured' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Users by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const usersByDay = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, verified: verifiedUsers, online: onlineUsers, blocked: blockedUsers, new: newUsers },
        companions: totalCompanions,
        events: { total: totalEvents, upcoming: upcomingEvents },
        bookings: { total: totalBookings, completed: completedBookings },
        communities: totalCommunities,
        marketplace: totalMarketplaceItems,
        reports: pendingReports,
        reviews: totalReviews,
        revenue: revenue[0]?.total || 0,
        usersByDay
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users - Get all users
router.get('/users', async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role && role !== 'all') filter.role = role;
    if (status === 'blocked') filter.isBlocked = true;
    if (status === 'verified') filter['verification.isVerified'] = true;
    if (status === 'online') filter.isOnline = true;

    const users = await User.find(filter)
      .select('-password')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({ success: true, users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/users/:id/block - Block/unblock user
router.patch('/users/:id/block', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: user.isBlocked ? 'User blocked' : 'User unblocked', user });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/users/:id/verify - Verify user
router.patch('/users/:id/verify', async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'

    const update = action === 'approve'
      ? { 'verification.isVerified': true, 'verification.status': 'verified', 'verification.verifiedAt': new Date() }
      : { 'verification.status': 'rejected' };

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/verifications - Get pending verifications
router.get('/verifications', async (req, res, next) => {
  try {
    const users = await User.find({ 'verification.status': 'pending' })
      .select('name email profileImage verification createdAt');

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/reports - Get reports
router.get('/reports', async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const filter = {};
    if (status !== 'all') filter.status = status;

    const reports = await Report.find(filter)
      .populate('reporter', 'name email profileImage')
      .populate('reportedUser', 'name email profileImage')
      .sort('-createdAt');

    res.json({ success: true, reports });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/reports/:id - Update report status
router.patch('/reports/:id', async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, {
      status,
      adminNotes,
      resolvedBy: req.user._id
    }, { new: true });

    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/events/:id - Delete event
router.delete('/events/:id', async (req, res, next) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/communities/:id - Delete community
router.delete('/communities/:id', async (req, res, next) => {
  try {
    await Community.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Community deleted' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/marketplace/:id - Delete listing
router.delete('/marketplace/:id', async (req, res, next) => {
  try {
    await MarketplaceItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Listing deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
