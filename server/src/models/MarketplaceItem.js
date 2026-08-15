const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Item title is required'],
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  images: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['electronics', 'sports', 'camping', 'photography', 'vehicles', 'books', 'clothing', 'tools', 'furniture', 'other'],
    default: 'other'
  },
  type: {
    type: String,
    enum: ['sell', 'rent', 'share', 'buy'],
    required: [true, 'Listing type is required']
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  priceUnit: {
    type: String,
    enum: ['fixed', 'per-hour', 'per-day', 'per-week', 'free'],
    default: 'fixed'
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    default: 'good'
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
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'rented', 'inactive'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

marketplaceItemSchema.index({ location: '2dsphere' });
marketplaceItemSchema.index({ category: 1 });
marketplaceItemSchema.index({ type: 1 });
marketplaceItemSchema.index({ price: 1 });

module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema);
