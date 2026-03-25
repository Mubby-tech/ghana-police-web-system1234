const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentActivity,
  getMyDashboard
} = require('../controllers/dashboardController');

// Import Auth Middleware (Vision Doc Section 4.2)
const { protect } = require('../middleware/authMiddleware');

// All routes are protected (Requires Login)
router.use(protect);

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (All Officers)
router.get('/stats', getDashboardStats);

// @route   GET /api/dashboard/activity
// @desc    Get recent activity logs
// @access  Private (All Officers)
router.get('/activity', getRecentActivity);

// @route   GET /api/dashboard/me
// @desc    Get user-specific dashboard data
// @access  Private
router.get('/me', getMyDashboard);

module.exports = router;