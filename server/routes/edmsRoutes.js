const express = require('express');
const router = express.Router();
const {
  createDocument,
  getDocuments,
  getDocumentById,
  sendDocument,
  approveDocument,
  signDocument,
  uploadAttachment,
  deleteDocument,
  getEDMSStats
} = require('../controllers/edmsController');

// Import Auth Middleware (Vision Doc Section 4.2)
const { protect, authorize } = require('../middleware/authMiddleware');

// Import Upload Middleware (Vision Doc Section 4.5 - Attachments)
const upload = require('../middleware/uploadMiddleware');

// All routes are protected (Requires Login - Vision Doc Section 4.2)
router.use(protect);

// ============================================
// EDMS Module (Vision Doc Section 4.5)
// Electronic Document Management System
// ============================================

// @route   POST /api/edms
// @desc    Create new document/memo
// @access  Officer, CID, Command, Admin (Vision Doc Section 4.2)
router.post('/', authorize('officer', 'cid', 'command', 'admin'), createDocument);

// @route   GET /api/edms
// @desc    Get all documents (with filters)
// @access  Officer, CID, Command, Admin (Vision Doc Section 4.2)
router.get('/', authorize('officer', 'cid', 'command', 'admin'), getDocuments);

// @route   GET /api/edms/stats
// @desc    Get EDMS statistics (Dashboard Analytics - Vision Doc Section 5.1)
// @access  Command, Admin (Vision Doc Section 4.2)
router.get('/stats', authorize('command', 'admin'), getEDMSStats);

// @route   GET /api/edms/:id
// @desc    Get single document
// @access  Officer, CID, Command, Admin (Vision Doc Section 4.2)
router.get('/:id', authorize('officer', 'cid', 'command', 'admin'), getDocumentById);

// @route   POST /api/edms/:id/send
// @desc    Send document (Draft → Sent)
// @access  Sender only (Vision Doc Section 4.5)
router.post('/:id/send', authorize('officer', 'cid', 'command', 'admin'), sendDocument);

// @route   POST /api/edms/:id/approve
// @desc    Approve/Reject document (E-Approval Workflow)
// @access  Command, Admin (Vision Doc Section 4.2)
router.post('/:id/approve', authorize('command', 'admin'), approveDocument);

// @route   POST /api/edms/:id/sign
// @desc    E-Sign document (Electronic Signature)
// @access  Command, Admin (Vision Doc Section 4.2)
router.post('/:id/sign', authorize('command', 'admin'), signDocument);

// @route   POST /api/edms/:id/attachments
// @desc    Upload attachment file (Vision Doc Section 4.5)
// @access  Officer, CID, Command, Admin (Vision Doc Section 4.2)
router.post('/:id/attachments', authorize('officer', 'cid', 'command', 'admin'), upload.single('file'), uploadAttachment);

// @route   DELETE /api/edms/:id
// @desc    Soft delete document (Vision Doc Section 5.2 - Accountability)
// @access  Command, Admin (Vision Doc Section 4.2)
router.delete('/:id', authorize('command', 'admin'), deleteDocument);

module.exports = router;