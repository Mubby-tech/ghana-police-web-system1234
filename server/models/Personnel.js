const mongoose = require('mongoose');

const personnelSchema = new mongoose.Schema({
  // --- 1. Personal Information (Vision Doc Section 4.1) ---
  policeId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
    // Format: GPS-XXXXX
  },
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
  otherNames: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  placeOfBirth: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  nationality: {
    type: String,
    default: 'Ghanaian'
  },
  contactNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  residentialAddress: {
    type: String,
    required: true
  },
  
  // --- 2. Service Information (Vision Doc Section 4.1) ---
  rank: {
    type: String,
    required: true,
    enum: [
      'Constable', 'Corporal', 'Sergeant', 'Staff Sergeant',
      'Inspector', 'Superintendent', 'Deputy Commissioner', 'Commissioner',
      'Assistant Commissioner', 'Deputy Inspector General', 'Inspector General'
    ]
  },
  serviceNumber: {
    type: String,
    unique: true,
    uppercase: true
  },
  dateOfEnlistment: {
    type: Date,
    required: true
  },
  dateOfConfirmation: {
    type: Date
  },
  deploymentStatus: {
    type: String,
    enum: ['Active', 'On Leave', 'Suspended', 'Retired', 'Deceased', 'Dismissed'],
    default: 'Active'
  },
  station: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true,
    enum: [
      'Greater Accra', 'Ashanti', 'Central', 'Western', 'Eastern',
      'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono',
      'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti'
    ]
  },
  department: {
    type: String,
    required: true,
    enum: [
      'Operations', 'CID', 'Traffic', 'Administration', 'Finance',
      'HR', 'Logistics', 'Training', 'Forensic', 'Anti-Narcotics',
      'Cyber Crime', 'Public Affairs', 'Intelligence', 'Other'
    ]
  },
  
  // --- 3. Service History (Vision Doc Section 4.1) ---
  promotions: [{
    rank: String,
    date: Date,
    issuedBy: String,
    referenceNumber: String
  }],
  transfers: [{
    fromStation: String,
    toStation: String,
    fromRegion: String,
    toRegion: String,
    date: Date,
    reason: String,
    approvedBy: String
  }],
  
  // --- 4. Training Records (Vision Doc Section 4.1) ---
  training: [{
    courseName: String,
    institution: String,
    startDate: Date,
    endDate: Date,
    certificate: String,
    grade: String
  }],
  
  // --- 5. Leave Management (Vision Doc Section 4.1) ---
  leaveRecords: [{
    type: {
      type: String,
      enum: ['Annual', 'Sick', 'Maternity', 'Paternity', 'Study', 'Emergency']
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
      default: 'Pending'
    },
    approvedBy: String,
    remarks: String
  }],
  
  // --- 6. Performance & Discipline (Vision Doc Section 4.1) ---
  awards: [{
    title: String,
    date: Date,
    description: String,
    issuedBy: String
  }],
  disciplinaryActions: [{
    type: String,
    date: Date,
    description: String,
    sanction: String,
    issuedBy: String
  }],
  
  // --- 7. Emergency Contact (Vision Doc Section 4.1) ---
  emergencyContact: {
    name: String,
    relationship: String,
    contactNumber: String,
    address: String
  },
  
  // --- 8. Next of Kin (Vision Doc Section 4.1) ---
  nextOfKin: {
    name: String,
    relationship: String,
    contactNumber: String,
    address: String
  },
  
  // --- 9. System Fields (Vision Doc Section 5.4 - Security) ---
  isDeleted: {
    type: Boolean,
    default: false,
    select: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// --- Indexes for Performance (Vision Doc Section 4.1 - Centralized Database) ---
// Note: policeId, serviceNumber, and email already have indexes from unique: true
personnelSchema.index({ rank: 1 });
personnelSchema.index({ station: 1 });
personnelSchema.index({ region: 1 });
personnelSchema.index({ department: 1 });
personnelSchema.index({ deploymentStatus: 1 });
personnelSchema.index({ createdAt: -1 });

// --- Middleware for Soft Delete Protection (Vision Doc Section 5.4) ---
personnelSchema.pre('find', function() {
  this.where({ isDeleted: false });
});

personnelSchema.pre('findOne', function() {
  this.where({ isDeleted: false });
});

// --- Helper Method: Get Full Name ---
personnelSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.otherNames ? this.otherNames + ' ' : ''}${this.lastName}`;
};

// --- Helper Method: Get Years of Service ---
personnelSchema.methods.getYearsOfService = function() {
  const enlistmentDate = new Date(this.dateOfEnlistment);
  const today = new Date();
  const years = today.getFullYear() - enlistmentDate.getFullYear();
  return years;
};

module.exports = mongoose.model('Personnel', personnelSchema);