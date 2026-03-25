const mongoose = require('mongoose');

const crimeReportSchema = new mongoose.Schema({
  // --- 1. Report Identification (Vision Doc Section 4.1) ---
  reportNumber: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
    // Format: CR-YYYYMMDD-XXXX (e.g., CR-20260321-001)
    // Will be auto-generated
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // --- 2. Crime Classification (Vision Doc Section 4.1) ---
  crimeType: {
    type: String,
    enum: [
      'Theft', 'Assault', 'Murder', 'Fraud', 'Cyber Crime',
      'Traffic Offense', 'Narcotics', 'Robbery', 'Burglary',
      'Kidnapping', 'Domestic Violence', 'Economic Crime',
      'Weapons Offense', 'Public Order', 'Other'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['Minor', 'Moderate', 'Serious', 'Critical'],
    default: 'Moderate'
  },
  category: {
    type: String,
    enum: ['Felony', 'Misdemeanor', 'Infraction'],
    default: 'Misdemeanor'
  },
  
  // --- 3. Incident Details (Vision Doc Section 4.1) ---
  incidentDate: {
    type: Date,
    required: true
  },
  incidentTime: {
    type: String,
    required: true
  },
  incidentLocation: {
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
  district: {
    type: String,
    required: true
  },
  
  // --- 4. Reporting & Assignment (Vision Doc Section 4.2) ---
  reportingOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  station: {
    type: String,
    required: true
  },
  
  // --- 5. Victims & Suspects (Vision Doc Section 4.1) ---
  victims: [{
    name: { type: String, required: true },
    age: Number,
    gender: String,
    contact: String,
    address: String,
    injuryStatus: {
      type: String,
      enum: ['None', 'Minor', 'Serious', 'Fatal'],
      default: 'None'
    }
  }],
  suspects: [{
    name: String,
    status: {
      type: String,
      enum: ['Identified', 'At Large', 'Arrested', 'Released', 'Unknown'],
      default: 'Unknown'
    },
    inmateRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inmate',
      default: null
    }
  }],
  
  // --- 6. Evidence & Attachments (Vision Doc Section 4.1) ---
  evidence: [{
    type: {
      type: String,
      enum: ['Photo', 'Video', 'Document', 'Physical', 'Digital']
    },
    description: String,
    filePath: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // --- 7. Investigation Status (Vision Doc Section 4.4 Integration) ---
  status: {
    type: String,
    enum: [
      'Filed',
      'Under Review',
      'Under Investigation',
      'Referred to CID',
      'Pending Court',
      'Closed',
      'Archived'
    ],
    default: 'Filed'
  },
  investigationNotes: [{
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  
  // --- 8. Linked CID Case (Vision Doc Section 4.4 Integration) ---
  linkedCase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    default: null
  },
  
  // --- 9. Activity Log & Accountability (Vision Doc Section 5.2) ---
  activityLog: [{
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    details: String,
    ipAddress: String
  }],
  
  // --- 10. System Fields (Security & Audit - Vision Doc Section 5.4) ---
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
crimeReportSchema.index({ status: 1 });
crimeReportSchema.index({ reportingOfficer: 1 });
crimeReportSchema.index({ crimeType: 1 });
crimeReportSchema.index({ region: 1 });
crimeReportSchema.index({ incidentDate: -1 });

// --- Middleware for Soft Delete Protection ---
crimeReportSchema.pre('find', function() {
  this.where({ isDeleted: false });
});

crimeReportSchema.pre('findOne', function() {
  this.where({ isDeleted: false });
});

// --- Auto-Generate Report Number ---
crimeReportSchema.pre('save', async function() {
  if (!this.isModified('reportNumber') && !this.reportNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0,10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.reportNumber = `CR-${dateStr}-${random}`;
  }
});

module.exports = mongoose.model('CrimeReport', crimeReportSchema);