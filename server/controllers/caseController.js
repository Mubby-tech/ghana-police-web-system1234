const Case = require('../models/Case');
const User = require('../models/User');
// const { createNotification, templates } = require('../utils/notificationHelper');  // ✅ Commented out

// --- Helper: Generate Unique Case Number (Vision Doc Section 4.1) ---
// --- Helper: Generate Unique Case Number (Vision Doc Section 4.1) ---
const generateCaseNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  // Find the last case created today to increment sequence
  const lastCase = await Case.findOne({ 
    caseNumber: { $regex: `^CID-${datePrefix}-` } 
  }).sort({ caseNumber: -1 });

  let sequence = 1;
  if (lastCase && lastCase.caseNumber) {
    const lastSequence = parseInt(lastCase.caseNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  // Format: CID-20231025-001
  return `CID-${datePrefix}-${String(sequence).padStart(3, '0')}`;
};

// --- Helper: Log Activity for Accountability (Vision Doc Section 5.2) ---
const logActivity = async (caseId, action, user, details, ipAddress) => {
  try {
    await Case.findByIdAndUpdate(caseId, {
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

// @desc    Create a new CID Case
// @route   POST /api/cases
// @access  Private (Officer, CID, Command, Admin)
const createCase = async (req, res) => {
    console.log('🔍 CASE FUNCTION REACHED!');
  try {
    const { title, description, category, priority, station, suspects, victims } = req.body;

    // 1. Generate Unique Case Number
    const caseNumber = await generateCaseNumber();

    // 2. Create Case
    const newCase = await Case.create({
      caseNumber,
      title,
      description,
      category,
      priority,
      station,
      reportingOfficer: req.user._id, // From JWT Middleware
      suspects,
      victims,
      activityLog: [{
        action: 'Case Created',
        performedBy: req.user._id,
        details: `Case opened by ${req.user.policeId}`,
        ipAddress: req.ip
      }]
    });

    res.status(201).json({ success: true, data: newCase });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all cases (Filtered by Role)
// @route   GET /api/cases
// @access  Private (CID, Command, Admin)
const getCases = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = { isDeleted: false };

    // RBAC: Officers only see their own cases unless CID/Command
    if (req.user.role === 'officer') {
      query.reportingOfficer = req.user._id;
    } else if (req.user.role === 'cid') {
      // CID sees all assigned or open cases
      query.$or = [
        { assignedDetective: req.user._id },
        { status: 'Open' }
      ];
    }
    // Command & Admin see all (no filter added)

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { caseNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { 'suspects.name': { $regex: search, $options: 'i' } }
      ];
    }

    const cases = await Case.find(query)
      .populate('reportingOfficer', 'policeId name rank')
      .populate('assignedDetective', 'policeId name rank')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: cases.length, data: cases });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get single case by ID
// @route   GET /api/cases/:id
// @access  Private
const getCaseById = async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id)
      .populate('reportingOfficer', 'policeId name rank station')
      .populate('assignedDetective', 'policeId name rank')
      .populate('suspects.inmateRef', 'inmateId charges'); // Link to Inmate Module

    if (!caseDoc) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    res.status(200).json({ success: true, data: caseDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Update Case Status / Assign Detective
// @route   PUT /api/cases/:id
// @access  Private (CID, Command, Admin)
const updateCase = async (req, res) => {
  try {
    const { status, assignedDetective, priority } = req.body;
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Update fields
    if (status) caseDoc.status = status;
    if (assignedDetective) caseDoc.assignedDetective = assignedDetective;
    if (priority) caseDoc.priority = priority;

    await caseDoc.save();

    // Log Activity (Section 5.2)
    await logActivity(
      caseDoc._id, 
      'Case Updated', 
      req.user, 
      `Status: ${status}, Detective: ${assignedDetective}`, 
      req.ip
    );

    res.status(200).json({ success: true, data: caseDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Add Digital Statement (Vision Doc Section 4.4)
// @route   POST /api/cases/:id/statements
// @access  Private (CID, Officer)
const addStatement = async (req, res) => {
  try {
    const { personName, role, content, isSigned } = req.body;
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    caseDoc.statements.push({
      personName,
      role,
      content,
      recordedBy: req.user._id,
      dateRecorded: new Date(),
      isSigned: isSigned || false
    });

    await caseDoc.save();

    await logActivity(caseDoc._id, 'Statement Added', req.user, `Statement by ${personName}`, req.ip);

    res.status(200).json({ success: true, data: caseDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Add Evidence (Vision Doc Section 4.4)
// @route   POST /api/cases/:id/evidence
// @access  Private (CID, Officer)
// Note: File upload handling (multer) will be in routes
const addEvidence = async (req, res) => {
  try {
    const { type, description } = req.body;  // ✅ Only these from body
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // ✅ Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded. Please attach evidence file.' 
      });
    }

    caseDoc.evidence.push({
      type,
      fileName: req.file.filename,  // ✅ From multer
      filePath: req.file.path,      // ✅ From multer
      description,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
      chainOfCustody: [{
        action: 'Uploaded',
        officer: req.user._id,
        date: new Date()
      }]
    });

    await caseDoc.save();

    await logActivity(caseDoc._id, 'Evidence Added', req.user, `File: ${req.file.filename}`, req.ip);

    res.status(200).json({ success: true, data: caseDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Share Case with Prosecutor (Vision Doc Section 4.4)
// @route   POST /api/cases/:id/share-prosecutor
// @access  Private (Command, Admin)
const shareWithProsecutor = async (req, res) => {
  try {
    const { notes } = req.body;
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    caseDoc.prosecutorShared = {
      status: true,
      sharedAt: new Date(),
      sharedBy: req.user._id,
      notes
    };
    caseDoc.status = 'Pending Court';

    await caseDoc.save();

    await logActivity(caseDoc._id, 'Shared with Prosecutor', req.user, notes, req.ip);

    res.status(200).json({ success: true, data: caseDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Soft Delete Case (Vision Doc Section 5.2)
// @route   DELETE /api/cases/:id
// @access  Private (Admin, Command)
const deleteCase = async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    caseDoc.isDeleted = true;
    caseDoc.deletedAt = new Date();
    await caseDoc.save();

    await logActivity(caseDoc._id, 'Case Soft Deleted', req.user, 'Case archived/deleted', req.ip);

    res.status(200).json({ success: true, message: 'Case moved to archive' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  addStatement,
  addEvidence,
  shareWithProsecutor,
  deleteCase
};