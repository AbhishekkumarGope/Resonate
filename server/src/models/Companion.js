const mongoose = require('mongoose');

const companionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  tagline: {
    type: String,
    maxlength: 200,
    default: ''
  },
  about: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  specialties: [{
    type: String,
    enum: ['exploration', 'shopping', 'photography', 'language', 'adventure', 'food', 'nightlife', 'cultural', 'fitness', 'other'],
    trim: true
  }],
  languages: [{
    type: String,
    trim: true
  }],
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: 0
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    city: {
      type: String,
      default: ''
    }
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available'
  },
  schedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String,
    endTime: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  gallery: [{
    type: String
  }]
}, {
  timestamps: true
});

companionSchema.index({ location: '2dsphere' });
companionSchema.index({ hourlyRate: 1 });
companionSchema.index({ rating: -1 });

module.exports = mongoose.model('Companion', companionSchema);
