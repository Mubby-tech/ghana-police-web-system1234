const CrimeReport = require('../models/CrimeReport');
const User = require('../models/User');

// --- Helper: Generate Unique Report Number (Vision Doc Section 4.1) ---
// --- Helper: Generate Unique Report Number (Vision Doc Section 4.1) ---
const generateReportNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  // Generate a random 4-digit number to avoid duplicates
  const random = Math.floor(1000 + Math.random() * 9000);

  // Format: CR-20260321-4567 (with random component)
  return `CR-${datePrefix}-${random}`;
};

// --- Helper: Log Activity for Accountability (Vision Doc Section 5.2) ---
const logActivity = async (reportId, action, user, details, ipAddress) => {
  try {
    await CrimeReport.findByIdAndUpdate(reportId, {
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

// @desc    Create a new Crime Report
// @route   POST /api/crime-reports
// @access  Private (Officer, CID, Command, Admin) - Vision Doc Section 4.2
const createReport = async (req, res) => {
  try {
    const {
      title,
      description,
      crimeType,
      severity,
      category,
      incidentDate,
      incidentTime,
      incidentLocation,
      region,
      district,
      station,
      victims,
      suspects
    } = req.body;

    // 1. Generate Unique Report Number
    const reportNumber = await generateReportNumber();

    // 2. Create Report
    const newReport = await CrimeReport.create({
      reportNumber,
      title,
      description,
      crimeType,
      severity,
      category,
      incidentDate,
      incidentTime,
      incidentLocation,
      region,
      district,
      station,
      reportingOfficer: req.user._id, // From JWT Middleware (Vision Doc Section 4.2)
      victims,
      suspects,
      activityLog: [{
        action: 'Crime Report Filed',
        performedBy: req.user._id,
        details: `Report filed by ${req.user.policeId}`,
        ipAddress: req.ip
      }]
    });

    res.status(201).json({ 
      success: true, 
      message: 'Crime report filed successfully',
      data: newReport 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get all crime reports (Filtered by Role)
// @route   GET /api/crime-reports
// @access  Private (All Officers) - Vision Doc Section 4.2
const getReports = async (req, res) => {
  try {
    const { status, crimeType, region, severity, search, startDate, endDate } = req.query;
    let query = { isDeleted: false };

    // RBAC: Officers see based on role (Vision Doc Section 4.2)
    if (req.user.role === 'officer') {
      // Officers see their own reports + reports from their station
      query.$or = [
        { reportingOfficer: req.user._id },
        { station: req.user.station }
      ];
    } else if (req.user.role === 'cid') {
      // CID sees all reports + referred cases
      query.$or = [
        { status: { $in: ['Filed', 'Under Review', 'Referred to CID'] } },
        { assignedTo: req.user._id }
      ];
    }
    // Command & Admin see all (no filter added)

    // Apply filters
    if (status) query.status = status;
    if (crimeType) query.crimeType = crimeType;
    if (region) query.region = region;
    if (severity) query.severity = severity;
    
    if (startDate || endDate) {
      query.incidentDate = {};
      if (startDate) query.incidentDate.$gte = new Date(startDate);
      if (endDate) query.incidentDate.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { reportNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'victims.name': { $regex: search, $options: 'i' } },
        { 'suspects.name': { $regex: search, $options: 'i' } }
      ];
    }

    const reports = await CrimeReport.find(query)
      .populate('reportingOfficer', 'policeId name rank station')
      .populate('assignedTo', 'policeId name rank station')
      .populate('linkedCase', 'caseNumber title status')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: reports.length, 
      data: reports 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get single crime report by ID
// @route   GET /api/crime-reports/:id
// @access  Private (Vision Doc Section 4.2)
const getReportById = async (req, res) => {
  try {
    const report = await CrimeReport.findById(req.params.id)
      .populate('reportingOfficer', 'policeId name rank station region')
      .populate('assignedTo', 'policeId name rank station')
      .populate('linkedCase', 'caseNumber title status category')
      .populate('suspects.inmateRef', 'inmateId name caseNumber custodyStatus');

    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Crime report not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: report 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Update Crime Report
// @route   PUT /api/crime-reports/:id
// @access  Private (CID, Command, Admin) - Vision Doc Section 4.2
const updateReport = async (req, res) => {
  try {
    const {
      title,
      description,
      crimeType,
      severity,
      category,
      status,
      assignedTo,
      investigationNotes
    } = req.body;

    const report = await CrimeReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Crime report not found' 
      });
    }

    // Update fields
    if (title) report.title = title;
    if (description) report.description = description;
    if (crimeType) report.crimeType = crimeType;
    if (severity) report.severity = severity;
    if (category) report.category = category;
    if (status) report.status = status;
    if (assignedTo) report.assignedTo = assignedTo;

    await report.save();

    // Log Activity (Vision Doc Section 5.2 - Accountability)
    await logActivity(
      report._id,
      'Report Updated',
      req.user,
      `Status: ${status || report.status}, Assigned: ${assignedTo || 'N/A'}`,
      req.ip
    );

    res.status(200).json({ 
      success: true, 
      message: 'Crime report updated successfully',
      data: report 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Add Investigation Notes
// @route   POST /api/crime-reports/:id/notes
// @access  Private (CID, Command, Admin) - Vision Doc Section 4.4
const addInvestigationNotes = async (req, res) => {
  try {
    const { note } = req.body;
    const report = await CrimeReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Crime report not found' 
      });
    }

    report.investigationNotes.push({
      note,
      addedBy: req.user._id,
      addedAt: new Date()
    });

    await report.save();

    await logActivity(
      report._id,
      'Investigation Notes Added',
      req.user,
      `Notes added by ${req.user.policeId}`,
      req.ip
    );

    res.status(200).json({ 
      success: true, 
      message: 'Investigation notes added successfully',
      data: report 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Link Crime Report to CID Case
// @route   POST /api/crime-reports/:id/link-case
// @access  Private (CID, Command, Admin) - Vision Doc Section 4.4 Integration
const linkToCase = async (req, res) => {
  try {
    const { caseId } = req.body;
    const report = await CrimeReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Crime report not found' 
      });
    }

    report.linkedCase = caseId;
    report.status = 'Referred to CID';

    await report.save();

    await logActivity(
      report._id,
      'Linked to CID Case',
      req.user,
      `Report linked to CID case ${caseId}`,
      req.ip
    );

    res.status(200).json({ 
      success: true, 
      message: 'Crime report linked to CID case successfully',
      data: report 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Upload Evidence to Crime Report
// @route   POST /api/crime-reports/:id/evidence
// @access  Private (Officer, CID, Command, Admin) - Vision Doc Section 4.1
const uploadEvidence = async (req, res) => {
  try {
    const { type, description } = req.body;
    const report = await CrimeReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Crime report not found' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded. Please attach evidence file.' 
      });
    }

    report.evidence.push({
      type,
      fileName: req.file.filename,
      filePath: req.file.path,
      description,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    });

    await report.save();

    await logActivity(
      report._id,
      'Evidence Uploaded',
      req.user,
      `File: ${req.file.filename}`,
      req.ip
    );

    res.status(200).json({ 
      success: true, 
      message: 'Evidence uploaded successfully',
      data: report 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Soft Delete Crime Report (Vision Doc Section 5.2)
// @route   DELETE /api/crime-reports/:id
// @access  Private (Command, Admin) - Vision Doc Section 4.2
const deleteReport = async (req, res) => {
  try {
    const report = await CrimeReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Crime report not found' 
      });
    }

    report.isDeleted = true;
    report.deletedAt = new Date();
    await report.save();

    await logActivity(
      report._id,
      'Report Soft Deleted',
      req.user,
      'Report archived/deleted',
      req.ip
    );

    res.status(200).json({ 
      success: true, 
      message: 'Crime report moved to archive' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get Crime Statistics (Vision Doc Section 5.1 - Dashboard Analytics)
// @route   GET /api/crime-reports/stats
// @access  Private (Command, Admin) - Vision Doc Section 4.2
const getCrimeStats = async (req, res) => {
  try {
    const { startDate, endDate, region } = req.query;
    let query = { isDeleted: false };

    if (startDate || endDate) {
      query.incidentDate = {};
      if (startDate) query.incidentDate.$gte = new Date(startDate);
      if (endDate) query.incidentDate.$lte = new Date(endDate);
    }

    if (region) query.region = region;

    // Total reports
    const total = await CrimeReport.countDocuments(query);

    // By crime type
    const byCrimeType = await CrimeReport.aggregate([
      { $match: query },
      { $group: { _id: '$crimeType', count: { $sum: 1 } } }
    ]);

    // By severity
    const bySeverity = await CrimeReport.aggregate([
      { $match: query },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // By status
    const byStatus = await CrimeReport.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // By region
    const byRegion = await CrimeReport.aggregate([
      { $match: query },
      { $group: { _id: '$region', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        byCrimeType,
        bySeverity,
        byStatus,
        byRegion
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
  createReport,
  getReports,
  getReportById,
  updateReport,
  addInvestigationNotes,
  linkToCase,
  uploadEvidence,
  deleteReport,
  getCrimeStats
};