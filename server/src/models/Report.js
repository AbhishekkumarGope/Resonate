const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportedContent: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'contentType'
  },
  contentType: {
    type: String,
    enum: ['User', 'Event', 'Community', 'MarketplaceItem', 'Message'],
    default: 'User'
  },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'inappropriate', 'fake', 'scam', 'safety', 'other'],
    required: true
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

reportSchema.index({ status: 1 });
reportSchema.index({ reporter: 1 });

module.exports = mongoose.model('Report', reportSchema);
