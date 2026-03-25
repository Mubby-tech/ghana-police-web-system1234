const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'Login', 'Logout', 'Create', 'Read', 'Update', 'Delete',
      'Transfer', 'Promote', 'Approve', 'Reject', 'Sign',
      'Upload', 'Download', 'Share', 'Export', 'Import'
    ]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userPoliceId: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },
  module: {
    type: String,
    required: true,
    enum: ['Auth', 'Inmates', 'CID', 'Crime Reports', 'EDMS', 'Personnel', 'Settings', 'Other']
  },
  resourceId: {
    type: String,
    default: ''
  },
  resourceType: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Success', 'Failed', 'Unauthorized', 'Forbidden'],
    required: true
  },
  statusCode: {
    type: Number,
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  // ✅ FIXED - Removed "index: true"
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ✅ Keep these indexes (no duplicates)
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ module: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ status: 1 });

// Auto-delete old logs after 90 days
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);