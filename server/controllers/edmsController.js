const EDMSDocument = require('../models/EDMSDocument');
const User = require('../models/User');

// --- Helper: Generate Unique Document Number (Vision Doc Section 4.5) ---
const generateDocumentNumber = async (docType) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;
  const typePrefix = docType.toUpperCase().slice(0, 8);
  const random = Math.floor(1000 + Math.random() * 9000);
  
  // Format: MEMO-20260321-4567 or CIRCULAR-20260321-8923
  return `${typePrefix}-${datePrefix}-${random}`;
};

// --- Helper: Log Activity for Accountability (Vision Doc Section 5.2) ---
const logActivity = async (docId, action, user, details, ipAddress) => {
  try {
    await EDMSDocument.findByIdAndUpdate(docId, {
      $push: {
        activityLog: {
          action,
          performedBy: user._id,
          details,
          ipAddress: ipAddress || 'Unknown',
          timestamp: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};



// @desc    Create a new EDMS Document/Memo
// @route   POST /api/edms
// @access  Private (All Officers) - Vision Doc Section 4.2
const createDocument = async (req, res) => {
  try {
    const {
      documentType,
      title,
      content,
      senderDepartment,
      recipient,
      recipientDepartment,
      ccRecipients,
      priority,
      classification,
      requiresApproval
    } = req.body;

    // 1. Generate Unique Document Number
    const documentNumber = await generateDocumentNumber(documentType);

    // 2. Get Sender Info from JWT
    const sender = req.user._id;

    // 3. Create Document
    const newDoc = await EDMSDocument.create({
      documentNumber,
      documentType,
      title,
      content,
      sender,
      senderDepartment,
      recipient,
      recipientDepartment,
      ccRecipients,
      priority,
      classification,
      requiresApproval,
      approvalStatus: requiresApproval ? 'Pending' : 'Approved',
      activityLog: [{
        action: 'Document Created',
        performedBy: sender,
        details: `Document created by ${req.user.policeId}`,
        ipAddress: req.ip
      }]
    });

    res.status(201).json({ 
      success: true, 
      message: 'Document created successfully',
      data: newDoc 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get all EDMS documents (Filtered by Role)
// @route   GET /api/edms
// @access  Private (All Officers) - Vision Doc Section 4.2
const getDocuments = async (req, res) => {
  try {
    const { status, documentType, priority, classification, search, startDate, endDate } = req.query;
    let query = { isDeleted: false };

    // RBAC: Officers see based on role (Vision Doc Section 4.2)
    if (req.user.role === 'officer') {
      // Officers see documents they sent or received
      query.$or = [
        { sender: req.user._id },
        { recipient: req.user._id }
      ];
    } else if (req.user.role === 'cid') {
      // CID sees all documents related to their cases
      query.$or = [
        { sender: req.user._id },
        { recipient: req.user._id },
        { senderDepartment: 'CID' },
        { recipientDepartment: 'CID' }
      ];
    }
    // Command & Admin see all (no filter added)

    // Apply filters
    if (status) query.status = status;
    if (documentType) query.documentType = documentType;
    if (priority) query.priority = priority;
    if (classification) query.classification = classification;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { documentNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const documents = await EDMSDocument.find(query)
      .populate('sender', 'policeId name rank station department')
      .populate('recipient', 'policeId name rank station department')
      .populate('ccRecipients', 'policeId name rank station')
      .populate('approver', 'policeId name rank')
      .populate('signedBy', 'policeId name rank')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: documents.length, 
      data: documents 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get single EDMS document by ID
// @route   GET /api/edms/:id
// @access  Private (Vision Doc Section 4.2)
const getDocumentById = async (req, res) => {
  try {
    const document = await EDMSDocument.findById(req.params.id)
      .populate('sender', 'policeId name rank station department email')
      .populate('recipient', 'policeId name rank station department email')
      .populate('ccRecipients', 'policeId name rank station')
      .populate('approver', 'policeId name rank')
      .populate('signedBy', 'policeId name rank');

    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    // Check access permission (Vision Doc Section 5.4 - Data Security)
    const isSender = document.sender._id.toString() === req.user._id.toString();
    const isRecipient = document.recipient._id.toString() === req.user._id.toString();
    const isAdmin = ['command', 'admin'].includes(req.user.role);

    if (!isSender && !isRecipient && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You are not authorized to view this document.' 
      });
    }

    // Mark as read if recipient is viewing (Vision Doc Section 5.2 - Accountability)
    if (isRecipient && !document.readAt) {
      document.readAt = new Date();
      document.status = 'Read';
      await document.save();
      
      await logActivity(
        document._id,
        'Document Read',
        req.user,
        'Document marked as read by recipient',
        req.ip
      );
    }

    res.status(200).json({ 
      success: true, 
      data: document 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Send EDMS Document (Change status from Draft to Sent)
// @route   POST /api/edms/:id/send
// @access  Private (Sender only) - Vision Doc Section 4.5
const sendDocument = async (req, res) => {
  try {
    const document = await EDMSDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    // Check if user is the sender
    if (document.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the sender can send this document' 
      });
    }

    document.status = 'Sent';
    await document.save();

    await logActivity(
      document._id,
      'Document Sent',
      req.user,
      `Document sent to ${document.recipientDepartment}`,
      req.ip
    );

    res.status(200).json({ 
      success: true, 
      message: 'Document sent successfully',
      data: document 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Approve/Reject EDMS Document (E-Approval Workflow)
// @route   POST /api/edms/:id/approve
// @access  Private (Command, Admin) - Vision Doc Section 4.5
const approveDocument = async (req, res) => {
  try {
    const { approvalStatus, approvalNotes } = req.body;
    const document = await EDMSDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    // Check authorization (Command/Admin only - Vision Doc Section 4.2)
    if (!['command', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only Command or Admin can approve documents' 
      });
    }

    document.approvalStatus = approvalStatus;
    document.approver = req.user._id;
    document.approvedAt = new Date();
    document.approvalNotes = approvalNotes || '';

    if (approvalStatus === 'Approved') {
      document.status = 'Delivered';
    }

    await document.save();

    await logActivity(
      document._id,
      'Document Approved',
      req.user,
      `Approval status: ${approvalStatus}. Notes: ${approvalNotes || 'N/A'}`,
      req.ip
    );

    res.status(200).json({ 
      success: true, 
      message: `Document ${approvalStatus.toLowerCase()} successfully`,
      data: document 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    E-Sign EDMS Document (Electronic Signature)
// @route   POST /api/edms/:id/sign
// @access  Private (Authorized Signatory) - Vision Doc Section 4.5
const signDocument = async (req, res) => {
  try {
    const { signatureData } = req.body;
    const document = await EDMSDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    // Check authorization (Command/Admin or designated signatory - Vision Doc Section 4.2)
    if (!['command', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only Command or Admin can sign documents' 
      });
    }

    document.isSigned = true;
    document.signedAt = new Date();
    document.signedBy = req.user._id;
    document.signatureData = signatureData || 'Digital Signature Applied';

    await document.save();

    await logActivity(
      document._id,
      'Document E-Signed',
      req.user,
      `E-Signature applied by ${req.user.policeId}`,
      req.ip
    );

    res.status(200).json({ 
      success: true, 
      message: 'Document signed electronically',
      data: document 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Upload Attachment to EDMS Document
// @route   POST /api/edms/:id/attachments
// @access  Private (Sender, Command, Admin) - Vision Doc Section 4.5
const uploadAttachment = async (req, res) => {
  try {
    const document = await EDMSDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded. Please attach a file.' 
      });
    }

    document.attachments.push({
      fileName: req.file.filename,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    });

    await document.save();

    await logActivity(
      document._id,
      'Attachment Uploaded',
      req.user,
      `File: ${req.file.filename}`,
      req.ip
    );

    res.status(200).json({ 
      success: true, 
      message: 'Attachment uploaded successfully',
      data: document 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Soft Delete EDMS Document (Vision Doc Section 5.2)
// @route   DELETE /api/edms/:id
// @access  Private (Command, Admin) - Vision Doc Section 4.2
const deleteDocument = async (req, res) => {
  try {
    const document = await EDMSDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    document.isDeleted = true;
    document.deletedAt = new Date();
    await document.save();

    await logActivity(
      document._id,
      'Document Soft Deleted',
      req.user,
      'Document archived/deleted',
      req.ip
    );

    res.status(200).json({ 
      success: true, 
      message: 'Document moved to archive' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get EDMS Statistics (Vision Doc Section 5.1 - Dashboard Analytics)
// @route   GET /api/edms/stats
// @access  Private (Command, Admin) - Vision Doc Section 4.2
const getEDMSStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { isDeleted: false };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Total documents
    const total = await EDMSDocument.countDocuments(query);

    // By document type
    const byType = await EDMSDocument.aggregate([
      { $match: query },
      { $group: { _id: '$documentType', count: { $sum: 1 } } }
    ]);

    // By status
    const byStatus = await EDMSDocument.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // By priority
    const byPriority = await EDMSDocument.aggregate([
      { $match: query },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Pending approvals
    const pendingApprovals = await EDMSDocument.countDocuments({
      ...query,
      approvalStatus: 'Pending'
    });

    // Signed documents
    const signedDocs = await EDMSDocument.countDocuments({
      ...query,
      isSigned: true
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        byType,
        byStatus,
        byPriority,
        pendingApprovals,
        signedDocs
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  sendDocument,
  approveDocument,
  signDocument,
  uploadAttachment,
  deleteDocument,
  getEDMSStats
};