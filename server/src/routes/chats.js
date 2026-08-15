const express = require('express');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');
const router = express.Router();

// POST /api/chats - Create or get private chat
router.post('/', protect, async (req, res, next) => {
  try {
    const { userId, type = 'private', name } = req.body;

    if (type === 'private') {
      // Check if chat already exists
      let chat = await Chat.findOne({
        type: 'private',
        participants: { $all: [req.user._id, userId] }
      }).populate('participants', 'name profileImage isOnline');

      if (chat) {
        return res.json({ success: true, chat });
      }

      chat = await Chat.create({
        type: 'private',
        participants: [req.user._id, userId]
      });

      chat = await Chat.findById(chat._id).populate('participants', 'name profileImage isOnline');

      return res.status(201).json({ success: true, chat });
    }

    // Group chat
    const { participants } = req.body;
    const chat = await Chat.create({
      type: 'group',
      name: name || 'Group Chat',
      participants: [req.user._id, ...participants],
      admin: req.user._id
    });

    const populated = await Chat.findById(chat._id).populate('participants', 'name profileImage isOnline');
    res.status(201).json({ success: true, chat: populated });
  } catch (error) {
    next(error);
  }
});

// GET /api/chats - Get user's chats
router.get('/', protect, async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'name profileImage isOnline lastSeen')
    .populate('lastMessage.sender', 'name')
    .sort('-updatedAt');

    res.json({ success: true, chats });
  } catch (error) {
    next(error);
  }
});

// GET /api/chats/:id/messages - Get chat messages
router.get('/:id/messages', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }

    const messages = await Message.find({ chat: req.params.id, isDeleted: false })
      .populate('sender', 'name profileImage')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    next(error);
  }
});

// POST /api/chats/:id/messages - Send message (REST fallback)
router.post('/:id/messages', protect, async (req, res, next) => {
  try {
    const { content, type = 'text', image, location } = req.body;

    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const message = await Message.create({
      chat: req.params.id,
      sender: req.user._id,
      content,
      type,
      image,
      location,
      readBy: [{ user: req.user._id }]
    });

    // Update last message in chat
    chat.lastMessage = {
      content: type === 'image' ? '📷 Image' : (type === 'location' ? '📍 Location' : content),
      sender: req.user._id,
      timestamp: new Date()
    };
    await chat.save();

    const populated = await Message.findById(message._id).populate('sender', 'name profileImage');

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
