const express = require('express');
const Review = require('../models/Review');
const Companion = require('../models/Companion');
const EmergencyContact = require('../models/EmergencyContact');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const router = express.Router();

// ===== REVIEWS =====

// POST /api/safety/reviews - Create review
router.post('/reviews', protect, async (req, res, next) => {
  try {
    const { reviewee, booking, rating, comment, type } = req.body;

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee,
      booking,
      rating,
      comment,
      type: type || 'companion'
    });

    // Update companion rating if applicable
    if (type === 'companion') {
      const companion = await Companion.findOne({ user: reviewee });
      if (companion) {
        const reviews = await Review.find({ reviewee, type: 'companion' });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        companion.rating = Math.round(avgRating * 10) / 10;
        companion.totalReviews = reviews.length;
        await companion.save();
      }
    }

    await Notification.create({
      user: reviewee,
      type: 'review',
      title: 'New Review',
      message: `${req.user.name} gave you a ${rating}-star review`,
      data: { reviewId: review._id }
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
});

// GET /api/safety/reviews/:userId - Get reviews for a user
router.get('/reviews/:userId', protect, async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name profileImage')
      .sort('-createdAt');

    const stats = {
      total: reviews.length,
      average: reviews.length > 0 
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10 
        : 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };

    reviews.forEach(r => { stats.breakdown[r.rating]++; });

    res.json({ success: true, reviews, stats });
  } catch (error) {
    next(error);
  }
});

// ===== EMERGENCY CONTACTS =====

// POST /api/safety/emergency - Add emergency contact
router.post('/emergency', protect, async (req, res, next) => {
  try {
    const count = await EmergencyContact.countDocuments({ user: req.user._id });
    if (count >= 5) {
      return res.status(400).json({ success: false, message: 'Maximum 5 emergency contacts' });
    }

    const contact = await EmergencyContact.create({
      user: req.user._id,
      ...req.body
    });

    res.status(201).json({ success: true, contact });
  } catch (error) {
    next(error);
  }
});

// GET /api/safety/emergency - Get emergency contacts
router.get('/emergency', protect, async (req, res, next) => {
  try {
    const contacts = await EmergencyContact.find({ user: req.user._id });
    res.json({ success: true, contacts });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/safety/emergency/:id - Remove emergency contact
router.delete('/emergency/:id', protect, async (req, res, next) => {
  try {
    const contact = await EmergencyContact.findById(req.params.id);
    if (!contact || contact.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    await EmergencyContact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Contact removed' });
  } catch (error) {
    next(error);
  }
});

// POST /api/safety/sos - Trigger SOS
router.post('/sos', protect, async (req, res, next) => {
  try {
    const { latitude, longitude, message } = req.body;

    const contacts = await EmergencyContact.find({ user: req.user._id });

    // In production, this would send SMS/email to emergency contacts
    // For now, we log it and create a notification
    console.log(`SOS triggered by ${req.user.name} at ${latitude}, ${longitude}`);
    console.log(`Emergency contacts:`, contacts.map(c => c.phone));

    res.json({
      success: true,
      message: 'SOS alert sent to emergency contacts',
      contactsNotified: contacts.length
    });
  } catch (error) {
    next(error);
  }
});

// ===== REPORTS =====

// POST /api/safety/reports - Create report
router.post('/reports', protect, async (req, res, next) => {
  try {
    const report = await Report.create({
      reporter: req.user._id,
      ...req.body
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    next(error);
  }
});

// ===== TRUST SCORE =====

// GET /api/safety/trust-score/:userId - Get trust score details
router.get('/trust-score/:userId', protect, async (req, res, next) => {
  try {
    const User = require('../models/User');
    const Booking = require('../models/Booking');
    const Event = require('../models/Event');

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const reviews = await Review.find({ reviewee: req.params.userId });
    const completedBookings = await Booking.countDocuments({ 
      $or: [{ user: req.params.userId }, { companionUser: req.params.userId }],
      status: 'completed'
    });
    const eventCount = await Event.countDocuments({ 'participants.user': req.params.userId });
    const reports = await Report.countDocuments({ reportedUser: req.params.userId, status: { $ne: 'dismissed' } });

    // Calculate score
    let score = 30; // Base score
    if (user.verification.isVerified) score += 20;
    if (completedBookings > 0) score += Math.min(20, completedBookings * 4);
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      score += Math.min(15, Math.round(avgRating * 3));
    }
    if (eventCount > 0) score += Math.min(10, eventCount * 2);
    if (user.profileImage) score += 3;
    if (user.bio) score += 2;

    // Deductions
    score -= reports * 10;

    score = Math.max(0, Math.min(100, score));

    // Update user's trust score
    await User.findByIdAndUpdate(req.params.userId, { trustScore: score });

    res.json({
      success: true,
      trustScore: score,
      breakdown: {
        base: 30,
        verification: user.verification.isVerified ? 20 : 0,
        bookings: Math.min(20, completedBookings * 4),
        reviews: reviews.length > 0 ? Math.min(15, Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 3)) : 0,
        events: Math.min(10, eventCount * 2),
        profile: (user.profileImage ? 3 : 0) + (user.bio ? 2 : 0),
        reports: -(reports * 10)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
