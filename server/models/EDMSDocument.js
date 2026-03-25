const mongoose = require('mongoose');

const eDMSDocumentSchema = new mongoose.Schema({
  // --- 1. Document Identification (Vision Doc Section 4.5) ---
  documentNumber: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
    // Format: MEMO-YYYYMMDD-XXXX or CIRCULAR-YYYYMMDD-XXXX
  },
  documentType: {
    type: String,
    enum: ['Memo', 'Circular', 'Directive', 'Report', 'Form', 'Letter', 'Other'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  
  // --- 2. Sender & Recipient (Vision Doc Section 4.5) ---
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderDepartment: {
    type: String,
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientDepartment: {
    type: String,
    required: true
  },
  ccRecipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // --- 3. Priority & Classification (Vision Doc Section 4.5) ---
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'Urgent', 'Critical'],
    default: 'Normal'
  },
  classification: {
    type: String,
    enum: ['Public', 'Internal', 'Confidential', 'Secret'],
    default: 'Internal'
  },
  
  // --- 4. Approval Workflow (Vision Doc Section 4.5 - E-Approvals) ---
  requiresApproval: {
    type: Boolean,
    default: false
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Returned for Revision'],
    default: 'Pending'
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvalNotes: {
    type: String,
    default: ''
  },
  
  // --- 5. E-Signature (Vision Doc Section 4.5 - E-Signatures) ---
  isSigned: {
    type: Boolean,
    default: false
  },
  signedAt: {
    type: Date,
    default: null
  },
  signatureData: {
    // Could store base64 signature image or digital signature hash
    type: String,
    default: ''
  },
  signedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // --- 6. Attachments (Vision Doc Section 4.5) ---
  attachments: [{
    fileName: String,
    filePath: String,
    fileType: String,
    fileSize: Number,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // --- 7. Status & Tracking (Vision Doc Section 4.5) ---
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Delivered', 'Read', 'Archived'],
    default: 'Draft'
  },
  readAt: {
    type: Date,
    default: null
  },
  
  // --- 8. Activity Log & Accountability (Vision Doc Section 5.2) ---
  activityLog: [{
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    details: String,
    ipAddress: String
  }],
  
  // --- 9. System Fields (Security & Audit - Vision Doc Section 5.4) ---
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
eDMSDocumentSchema.index({ sender: 1 });
eDMSDocumentSchema.index({ recipient: 1 });
eDMSDocumentSchema.index({ status: 1 });
eDMSDocumentSchema.index({ documentType: 1 });
eDMSDocumentSchema.index({ createdAt: -1 });

// --- Middleware for Soft Delete Protection ---
eDMSDocumentSchema.pre('find', function() {
  this.where({ isDeleted: false });
});

eDMSDocumentSchema.pre('findOne', function() {
  this.where({ isDeleted: false });
});

// --- Auto-Generate Document Number ---
eDMSDocumentSchema.pre('save', async function() {
  if (!this.isModified('documentNumber') && !this.documentNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0,10).replace(/-/g, '');
    const typePrefix = this.documentType.toUpperCase().slice(0, 8);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.documentNumber = `${typePrefix}-${dateStr}-${random}`;
  }
});

module.exports = mongoose.model('EDMSDocument', eDMSDocumentSchema);