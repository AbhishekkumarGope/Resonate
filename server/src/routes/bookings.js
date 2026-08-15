const express = require('express');
const Booking = require('../models/Booking');
const Companion = require('../models/Companion');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const router = express.Router();

// POST /api/bookings - Create booking
router.post('/', protect, async (req, res, next) => {
  try {
    const { companionId, date, startTime, duration, purpose, meetingPoint } = req.body;

    const companion = await Companion.findById(companionId);
    if (!companion) {
      return res.status(404).json({ success: false, message: 'Companion not found' });
    }

    const totalAmount = companion.hourlyRate * duration;

    const booking = await Booking.create({
      user: req.user._id,
      companion: companionId,
      companionUser: companion.user,
      date,
      startTime,
      duration,
      totalAmount,
      purpose,
      meetingPoint
    });

    // Notify companion
    await Notification.create({
      user: companion.user,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `${req.user.name} wants to book you for ${duration} hours`,
      data: { bookingId: booking._id },
      link: `/bookings/${booking._id}`
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings - Get user's bookings
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const filter = {};

    if (type === 'received') {
      filter.companionUser = req.user._id;
    } else {
      filter.user = req.user._id;
    }

    if (status && status !== 'all') filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('user', 'name profileImage')
      .populate('companionUser', 'name profileImage')
      .populate('companion', 'hourlyRate specialties')
      .sort('-createdAt');

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/:id - Get booking details
router.get('/:id', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name profileImage phone')
      .populate('companionUser', 'name profileImage phone')
      .populate('companion', 'hourlyRate specialties tagline');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only allow booking participants to view
    if (booking.user._id.toString() !== req.user._id.toString() &&
        booking.companionUser._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/bookings/:id/status - Update booking status
router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status;
    if (status === 'cancelled') {
      booking.cancellationReason = reason || '';
      booking.cancelledBy = req.user._id;
    }
    await booking.save();

    // Notify the other party
    const notifyUser = booking.user.toString() === req.user._id.toString()
      ? booking.companionUser : booking.user;

    const statusMessages = {
      confirmed: 'Your booking has been confirmed',
      cancelled: 'Your booking has been cancelled',
      rejected: 'Your booking request was declined',
      completed: 'Your booking has been completed'
    };

    await Notification.create({
      user: notifyUser,
      type: status === 'confirmed' ? 'booking_confirmed' : 'booking_cancelled',
      title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: statusMessages[status] || `Booking status updated to ${status}`,
      data: { bookingId: booking._id },
      link: `/bookings/${booking._id}`
    });

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
