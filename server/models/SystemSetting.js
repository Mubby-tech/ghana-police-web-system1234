const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
  // ✅ FIXED - unique: true already creates index, removed duplicate schema.index()
  key: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  value: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['String', 'Number', 'Boolean', 'JSON', 'Array'],
    default: 'String'
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['General', 'Security', 'Email', 'SMS', 'Storage', 'Backup', 'Other'],
    required: true
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// ✅ FIXED - Removed duplicate key index, kept category index
systemSettingSchema.index({ category: 1 });

module.exports = mongoose.model('SystemSetting', systemSettingSchema);