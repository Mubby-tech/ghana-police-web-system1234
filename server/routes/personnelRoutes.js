const express = require('express');
const router = express.Router();
const {
  registerOfficer,
  getPersonnel,
  getPersonnelById,
  updateOfficer,
  transferOfficer,
  promoteOfficer,
  processLeaveRequest,
  deleteOfficer,
  getHRStats
} = require('../controllers/personnelController');

// Import Auth Middleware (Vision Doc Section 4.2)
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected (Requires Login - Vision Doc Section 4.2)
router.use(protect);

// ============================================
// HR/Personnel Module (Vision Doc Section 4.1)
// Personnel Records Management System
// ============================================

// @route   POST /api/personnel
// @desc    Register new officer
// @access  HR, Command, Admin (Vision Doc Section 4.2)
router.post('/', authorize('hr', 'command', 'admin'), registerOfficer);

// @route   GET /api/personnel
// @desc    Get all personnel (with filters)
// @access  Officer, CID, HR, Command, Admin (Vision Doc Section 4.2)
router.get('/', authorize('officer', 'cid', 'hr', 'command', 'admin'), getPersonnel);

// @route   GET /api/personnel/stats
// @desc    Get HR statistics (Dashboard Analytics - Vision Doc Section 5.1)
// @access  HR, Command, Admin (Vision Doc Section 4.2)
router.get('/stats', authorize('hr', 'command', 'admin'), getHRStats);

// @route   GET /api/personnel/:id
// @desc    Get single officer profile
// @access  Officer, CID, HR, Command, Admin (Vision Doc Section 4.2)
router.get('/:id', authorize('officer', 'cid', 'hr', 'command', 'admin'), getPersonnelById);

// @route   PUT /api/personnel/:id
// @desc    Update officer information
// @access  HR, Command, Admin (Vision Doc Section 4.2)
router.put('/:id', authorize('hr', 'command', 'admin'), updateOfficer);

// @route   POST /api/personnel/:id/transfer
// @desc    Transfer officer to new station
// @access  HR, Command, Admin (Vision Doc Section 4.2)
router.post('/:id/transfer', authorize('hr', 'command', 'admin'), transferOfficer);

// @route   POST /api/personnel/:id/promote
// @desc    Record officer promotion
// @access  Command, Admin (Vision Doc Section 4.2)
router.post('/:id/promote', authorize('command', 'admin'), promoteOfficer);

// @route   POST /api/personnel/:id/leave
// @desc    Process leave request
// @access  HR, Command, Admin (Vision Doc Section 4.2)
router.post('/:id/leave', authorize('hr', 'command', 'admin'), processLeaveRequest);

// @route   DELETE /api/personnel/:id
// @desc    Soft delete officer record (Vision Doc Section 5.2 - Accountability)
// @access  Command, Admin (Vision Doc Section 4.2)
router.delete('/:id', authorize('command', 'admin'), deleteOfficer);

module.exports = router;