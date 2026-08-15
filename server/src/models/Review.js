const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  type: {
    type: String,
    enum: ['companion', 'user', 'marketplace'],
    default: 'companion'
  }
}, {
  timestamps: true
});

reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ booking: 1 });

module.exports = mongoose.model('Review', reviewSchema);
