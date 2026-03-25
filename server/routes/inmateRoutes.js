const express = require('express');
const {
  registerInmate,
  getInmates,
  getInmate,
  updateInmate,
  transferInmate,
  releaseInmate,
  deleteInmate,
  getInmateStats
} = require('../controllers/inmateController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ All routes are protected (Vision Doc Section 4.2 - Police ID Login)
router.use(protect);

// @route   POST /api/inmates
// @access  Private (officer, cid, command, admin)
router.post('/', authorize('officer', 'cid', 'command', 'admin'), registerInmate);

// @route   GET /api/inmates
// @access  Private (officer, cid, command, admin)
router.get('/', authorize('officer', 'cid', 'command', 'admin'), getInmates);

// @route   GET /api/inmates/stats
// @access  Private (command, admin)
router.get('/stats', authorize('command', 'admin'), getInmateStats);

// @route   GET /api/inmates/:id
// @access  Private (officer, cid, command, admin)
router.get('/:id', authorize('officer', 'cid', 'command', 'admin'), getInmate);

// @route   PUT /api/inmates/:id
// @access  Private (cid, command, admin)
router.put('/:id', authorize('cid', 'command', 'admin'), updateInmate);

// @route   POST /api/inmates/:id/transfer
// @access  Private (command, admin)
router.post('/:id/transfer', authorize('command', 'admin'), transferInmate);

// @route   POST /api/inmates/:id/release
// @access  Private (command, admin)
router.post('/:id/release', authorize('command', 'admin'), releaseInmate);

// @route   DELETE /api/inmates/:id
// @access  Private (admin only)
router.delete('/:id', authorize('admin'), deleteInmate);

// ✅ THIS LINE IS CRITICAL - Must export the router
module.exports = router;