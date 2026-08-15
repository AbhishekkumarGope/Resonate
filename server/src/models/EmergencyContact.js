const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Contact phone is required'],
    trim: true
  },
  relationship: {
    type: String,
    enum: ['parent', 'sibling', 'spouse', 'friend', 'other'],
    default: 'friend'
  },
  email: {
    type: String,
    default: ''
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

emergencyContactSchema.index({ user: 1 });

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
