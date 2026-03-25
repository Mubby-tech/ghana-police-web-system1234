const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  addInvestigationNotes,
  linkToCase,
  uploadEvidence,
  deleteReport,
  getCrimeStats
} = require('../controllers/crimeReportController');

// Import Auth Middleware (Vision Doc Section 4.2)
const { protect, authorize } = require('../middleware/authMiddleware');

// Import Upload Middleware (Vision Doc Section 4.1 - Evidence Upload)
const upload = require('../middleware/uploadMiddleware');

// All routes are protected (Requires Login - Vision Doc Section 4.2)
router.use(protect);

// ============================================
// Crime Reports Module (Vision Doc Section 4.1)
// ============================================

// @route   POST /api/crime-reports
// @desc    Create new crime report
// @access  Officer, CID, Command, Admin (Vision Doc Section 4.2)
router.post('/', authorize('officer', 'cid', 'command', 'admin'), createReport);

// @route   GET /api/crime-reports
// @desc    Get all crime reports (with filters)
// @access  Officer, CID, Command, Admin (Vision Doc Section 4.2)
router.get('/', authorize('officer', 'cid', 'command', 'admin'), getReports);

// @route   GET /api/crime-reports/stats
// @desc    Get crime statistics (Dashboard Analytics - Vision Doc Section 5.1)
// @access  Command, Admin (Vision Doc Section 4.2)
router.get('/stats', authorize('command', 'admin'), getCrimeStats);

// @route   GET /api/crime-reports/:id
// @desc    Get single crime report
// @access  Officer, CID, Command, Admin (Vision Doc Section 4.2)
router.get('/:id', authorize('officer', 'cid', 'command', 'admin'), getReportById);

// @route   PUT /api/crime-reports/:id
// @desc    Update crime report
// @access  CID, Command, Admin (Vision Doc Section 4.2)
router.put('/:id', authorize('cid', 'command', 'admin'), updateReport);

// @route   POST /api/crime-reports/:id/notes
// @desc    Add investigation notes (Vision Doc Section 4.4 Integration)
// @access  CID, Command, Admin (Vision Doc Section 4.2)
router.post('/:id/notes', authorize('cid', 'command', 'admin'), addInvestigationNotes);

// @route   POST /api/crime-reports/:id/link-case
// @desc    Link report to CID case (Vision Doc Section 4.4 Integration)
// @access  CID, Command, Admin (Vision Doc Section 4.2)
router.post('/:id/link-case', authorize('cid', 'command', 'admin'), linkToCase);

// @route   POST /api/crime-reports/:id/evidence
// @desc    Upload evidence file (Vision Doc Section 4.1)
// @access  Officer, CID, Command, Admin (Vision Doc Section 4.2)
router.post('/:id/evidence', authorize('officer', 'cid', 'command', 'admin'), upload.single('file'), uploadEvidence);

// @route   DELETE /api/crime-reports/:id
// @desc    Soft delete crime report (Vision Doc Section 5.2 - Accountability)
// @access  Command, Admin (Vision Doc Section 4.2)
router.delete('/:id', authorize('command', 'admin'), deleteReport);

module.exports = router;