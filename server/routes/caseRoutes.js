const express = require('express');
const router = express.Router();
const {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  addStatement,
  addEvidence,
  shareWithProsecutor,
  deleteCase
} = require('../controllers/caseController');

// Import Auth Middleware
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All routes are protected (Requires Login)
router.use(protect);

// @route   POST /api/cases
// @desc    Create new case
// @access  Officer, CID, Command, Admin
router.post('/', createCase);

// @route   GET /api/cases
// @desc    Get all cases
// @access  Officer, CID, Command, Admin
router.get('/', getCases);

// @route   GET /api/cases/:id
// @desc    Get single case
// @access  Private
router.get('/:id', getCaseById);

// @route   PUT /api/cases/:id
// @desc    Update case
// @access  CID, Command, Admin
router.put('/:id', authorize('cid', 'command', 'admin'), updateCase);

// @route   DELETE /api/cases/:id
// @desc    Delete case
// @access  Command, Admin
router.delete('/:id', authorize('command', 'admin'), deleteCase);

// @route   POST /api/cases/:id/statements
// @desc    Add digital statement
// @access  Officer, CID, Command, Admin
router.post('/:id/statements', authorize('officer', 'cid', 'command', 'admin'), addStatement);

// @route   POST /api/cases/:id/evidence
// @desc    Upload evidence
// @access  Officer, CID, Command, Admin
router.post('/:id/evidence', authorize('officer', 'cid', 'command', 'admin'), upload.single('file'), addEvidence);


// @route   POST /api/cases/:id/share-prosecutor
// @desc    Share with prosecutor
// @access  Command, Admin
router.post('/:id/share-prosecutor', authorize('command', 'admin'), shareWithProsecutor);

module.exports = router;