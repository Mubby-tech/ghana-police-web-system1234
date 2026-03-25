const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Vision Doc Section 4.2: Police ID Login
  policeId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^GPS-\d{5,}$/, 'Please enter a valid Police ID (e.g., GPS-12345)']
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  // Security (Vision Doc Section 4.2)
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // Don't return password in queries
  },
  
  // Role-Based Access (Vision Doc Section 4.2)
  role: {
    type: String,
    enum: ['officer', 'cid', 'hr', 'command', 'admin'],
    default: 'officer'
  },
  
  // Regional Assignment (Vision Doc Section 4.1)
  region: {
    type: String,
    required: true,
    enum: [
      'Greater Accra', 'Ashanti', 'Central', 'Western', 'Eastern',
      'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono',
      'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti'
    ]
  },
  station: {
    type: String,
    required: true
  },
  
  // 2FA Setup (Vision Doc Section 4.2)
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  
  // Activity Logging (Vision Doc Section 5.2)
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Creates createdAt and updatedAt
});

// ✅ FIXED: Use async WITHOUT next() - Mongoose 6.x+ style
userSchema.pre('save', async function() {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // No next() needed - async handles it automatically
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);