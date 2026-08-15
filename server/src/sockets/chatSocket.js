const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

const onlineUsers = new Map();

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins with their ID
    socket.on('user_online', async (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;

      // Update user online status
      await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });

      // Notify friends
      io.emit('user_status', { userId, isOnline: true });
    });

    // Join a chat room
    socket.on('join_room', (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.userId} joined room ${chatId}`);
    });

    // Leave a chat room
    socket.on('leave_room', (chatId) => {
      socket.leave(chatId);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, type = 'text', image, location } = data;

        const message = await Message.create({
          chat: chatId,
          sender: socket.userId,
          content,
          type,
          image,
          location,
          readBy: [{ user: socket.userId }]
        });

        // Update chat's last message
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: {
            content: type === 'image' ? '📷 Image' : (type === 'location' ? '📍 Location' : content),
            sender: socket.userId,
            timestamp: new Date()
          }
        });

        const populated = await Message.findById(message._id)
          .populate('sender', 'name profileImage');

        // Emit to everyone in the room
        io.to(chatId).emit('receive_message', populated);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(data.chatId).emit('user_typing', {
        userId: socket.userId,
        chatId: data.chatId
      });
    });

    socket.on('stop_typing', (data) => {
      socket.to(data.chatId).emit('user_stop_typing', {
        userId: socket.userId,
        chatId: data.chatId
      });
    });

    // Mark messages as read
    socket.on('message_read', async (data) => {
      try {
        const { chatId } = data;
        await Message.updateMany(
          { chat: chatId, 'readBy.user': { $ne: socket.userId } },
          { $push: { readBy: { user: socket.userId } } }
        );

        socket.to(chatId).emit('messages_read', {
          chatId,
          userId: socket.userId
        });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);

      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
        io.emit('user_status', { userId: socket.userId, isOnline: false });
      }
    });
  });
};

module.exports = { initializeSocket, onlineUsers };
