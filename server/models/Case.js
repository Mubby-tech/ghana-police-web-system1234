const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  // --- 1. Case Identification (Vision Doc Section 4.1) ---
  caseNumber: {
    type: String,
    required: true,
    unique: true,
    // Format: CID-YYYYMMDD-XXXX (e.g., CID-20231025-001)
    // Will be auto-generated in Controller
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
  category: {
    type: String,
    enum: ['Theft', 'Assault', 'Murder', 'Fraud', 'Cyber Crime', 'Traffic', 'Narcotics', 'Other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'Under Investigation', 'Pending Court', 'Closed', 'Archived'],
    default: 'Open'
  },

  // --- 2. Personnel & Assignment (Vision Doc Section 4.2 & 4.4) ---
  reportingOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to Authentication Module
    required: true
  },
  assignedDetective: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Assigned by CID Head or Command
  },
  station: {
    type: String,
    required: true,
    // e.g., "Accra Central", "Kumasi North"
    // Helps in Centralized Database filtering (Section 4.1)
  },

  // --- 3. Digital Statements (Vision Doc Section 4.4) ---
  statements: [{
    personName: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['Witness', 'Suspect', 'Victim', 'Expert'], 
      required: true 
    },
    content: { type: String, required: true }, // Digital text record
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateRecorded: { type: Date, default: Date.now },
    isSigned: { type: Boolean, default: false } // E-signature status (Section 4.5)
  }],

  // --- 4. Evidence Upload (Vision Doc Section 4.4) ---
  evidence: [{
    type: { 
      type: String, 
      enum: ['Photo', 'Video', 'Document', 'Audio', 'Physical'], 
      required: true 
    },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true }, // Secure storage path
    description: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
    chainOfCustody: [{
      action: String,
      officer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: { type: Date, default: Date.now }
    }]
  }],

  // --- 5. Suspects & Inmate Linkage (Vision Doc Section 4.3 + 4.4) ---
  suspects: [{
    name: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['At Large', 'Detained', 'Released', 'Deceased'], 
      default: 'At Large' 
    },
    inmateRef: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Inmate', 
      default: null 
      // Links to Inmate Module if detained
    }
  }],

  // --- 6. Prosecutor Sharing (Vision Doc Section 4.4) ---
  prosecutorShared: {
    status: { type: Boolean, default: false },
    sharedAt: { type: Date, default: null },
    sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String
  },

  // --- 7. Activity Log & Accountability (Vision Doc Section 5.2) ---
  // Every action on this case is logged here for auditing
  activityLog: [{
    action: { type: String, required: true }, // e.g., "Case Created", "Evidence Added"
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    details: String,
    ipAddress: String // For security tracking (Section 5.4)
  }],

  // --- 8. System Fields (Security & Audit) ---
  isDeleted: {
    type: Boolean,
    default: false,
    select: false // Hide from normal queries by default
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Automatically manages createdAt & updatedAt
});

// --- Indexes for Performance (Section 4.1 Centralized Database) ---
caseSchema.index({ status: 1 });
caseSchema.index({ reportingOfficer: 1 });

// --- Middleware for Soft Delete Protection ---
// ✅ CORRECT - Use async/await pattern instead
caseSchema.pre('find', function() {
  this.where({ isDeleted: false });
});

caseSchema.pre('findOne', function() {
  this.where({ isDeleted: false });
});

module.exports = mongoose.model('Case', caseSchema);