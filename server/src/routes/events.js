const express = require('express');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const router = express.Router();

// POST /api/events - Create event
router.post('/', protect, async (req, res, next) => {
  try {
    const event = await Event.create({
      ...req.body,
      organizer: req.user._id,
      participants: [{ user: req.user._id }],
      participantCount: 1
    });

    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
});

// GET /api/events - Get events
router.get('/', protect, async (req, res, next) => {
  try {
    const { category, status = 'upcoming', search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (status && status !== 'all') filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const events = await Event.find(filter)
      .populate('organizer', 'name profileImage')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(filter);

    res.json({ success: true, events, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/nearby - Get nearby events
router.get('/nearby', protect, async (req, res, next) => {
  try {
    const { lng, lat, maxDistance = 25000 } = req.query;
    const longitude = parseFloat(lng) || req.user.location.coordinates[0];
    const latitude = parseFloat(lat) || req.user.location.coordinates[1];

    const events = await Event.find({
      status: 'upcoming',
      date: { $gte: new Date() },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
    .populate('organizer', 'name profileImage')
    .limit(20);

    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/my - Get user's events
router.get('/my', protect, async (req, res, next) => {
  try {
    const events = await Event.find({
      $or: [
        { organizer: req.user._id },
        { 'participants.user': req.user._id }
      ]
    })
    .populate('organizer', 'name profileImage')
    .sort({ date: 1 });

    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/:id - Get event details
router.get('/:id', protect, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name profileImage')
      .populate('participants.user', 'name profileImage')
      .populate('community', 'name image');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
});

// POST /api/events/:id/join - Join event
router.post('/:id/join', protect, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const isParticipant = event.participants.some(p => p.user.toString() === req.user._id.toString());
    if (isParticipant) {
      return res.status(400).json({ success: false, message: 'Already joined' });
    }

    if (event.participantCount >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    event.participants.push({ user: req.user._id });
    event.participantCount += 1;
    await event.save();

    // Notify organizer
    await Notification.create({
      user: event.organizer,
      type: 'event_reminder',
      title: 'New Participant',
      message: `${req.user.name} joined your event "${event.title}"`,
      data: { eventId: event._id },
      link: `/events/${event._id}`
    });

    res.json({ success: true, message: 'Joined event' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/events/:id/leave - Leave event
router.delete('/:id/leave', protect, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    event.participants = event.participants.filter(p => p.user.toString() !== req.user._id.toString());
    event.participantCount = Math.max(0, event.participantCount - 1);
    await event.save();

    res.json({ success: true, message: 'Left event' });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/events/:id - Update event
router.patch('/:id', protect, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, event: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
