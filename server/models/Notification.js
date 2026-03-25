const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient (Vision Doc Section 4.2 - Police ID Login System)
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Notification Type
  type: {
    type: String,
    enum: [
      'info',
      'success',
      'warning',
      'error',
      'case',
      'document',
      'inmate',
      'security',
      'system'
    ],
    required: true
  },
  
  // Content
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  
  // Action Link (optional - for clickable notifications)
  actionUrl: {
    type: String,
    default: ''
  },
  
  // Related Entity (optional)
  relatedEntity: {
    type: String, // e.g., 'Case', 'Inmate', 'Document'
    default: ''
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  
  // Status (Vision Doc Section 5.2 - Accountability)
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Expiry (for temporary notifications)
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ priority: 1 });

// Auto-delete old notifications after 90 days (Vision Doc Section 5.3 - Cost Reduction)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Notification', notificationSchema);