const express = require('express');
const router = express.Router();
const {
  // Activity Logging
  getActivityLogs,
  getActivityStats,
  exportActivityLogs,
  clearOldLogs,
  // System Settings
  getSystemSettings,
  getSystemSettingByKey,
  updateSystemSetting,
  createSystemSetting,
  // User Management
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  resetUserPassword,
  // Profile Settings
  getProfile,
  updateProfile,
  changePassword,
  // Dashboard Statistics
  getSettingsStats
} = require('../controllers/settingsController');

// Import Auth Middleware (Vision Doc Section 4.2)
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected (Requires Login - Vision Doc Section 4.2)
router.use(protect);

// ============================================
// ACTIVITY LOGGING (Vision Doc Section 5.2)
// Transparency & Accountability
// ============================================

// @route   GET /api/settings/activity-logs
// @desc    Get all activity logs
// @access  Private (Command, Admin)
router.get('/activity-logs', authorize('command', 'admin'), getActivityLogs);

// @route   GET /api/settings/activity-stats
// @desc    Get activity log statistics
// @access  Private (Command, Admin)
router.get('/activity-stats', authorize('command', 'admin'), getActivityStats);

// @route   GET /api/settings/activity-logs/export
// @desc    Export activity logs (JSON/CSV)
// @access  Private (Admin)
router.get('/activity-logs/export', authorize('admin'), exportActivityLogs);

// @route   DELETE /api/settings/activity-logs/clear
// @desc    Clear old activity logs
// @access  Private (Admin)
router.delete('/activity-logs/clear', authorize('admin'), clearOldLogs);

// ============================================
// SYSTEM SETTINGS (Vision Doc Section 4.2)
// System Configuration & Security
// ============================================

// @route   GET /api/settings/system
// @desc    Get all system settings
// @access  Private (Command, Admin)
router.get('/system', authorize('command', 'admin'), getSystemSettings);

// @route   GET /api/settings/system/:key
// @desc    Get single system setting by key
// @access  Private (Command, Admin)
router.get('/system/:key', authorize('command', 'admin'), getSystemSettingByKey);

// @route   POST /api/settings/system
// @desc    Create new system setting
// @access  Private (Admin)
router.post('/system', authorize('admin'), createSystemSetting);

// @route   PUT /api/settings/system/:key
// @desc    Update system setting
// @access  Private (Admin)
router.put('/system/:key', authorize('admin'), updateSystemSetting);

// ============================================
// USER MANAGEMENT (Vision Doc Section 4.2)
// Police ID Login System & Role-Based Access
// ============================================

// @route   GET /api/settings/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', authorize('admin'), getAllUsers);

// @route   GET /api/settings/users/:id
// @desc    Get single user by ID
// @access  Private (Admin)
router.get('/users/:id', authorize('admin'), getUserById);

// @route   PUT /api/settings/users/:id/role
// @desc    Update user role
// @access  Private (Admin)
router.put('/users/:id/role', authorize('admin'), updateUserRole);

// @route   PUT /api/settings/users/:id/status
// @desc    Deactivate/Activate user
// @access  Private (Admin)
router.put('/users/:id/status', authorize('admin'), updateUserStatus);

// @route   POST /api/settings/users/:id/reset-password
// @desc    Reset user password
// @access  Private (Admin)
router.post('/users/:id/reset-password', authorize('admin'), resetUserPassword);

// ============================================
// PROFILE SETTINGS (Vision Doc Section 4.2)
// Individual Officer Profile Management
// ============================================

// @route   GET /api/settings/profile
// @desc    Get current user profile
// @access  Private (All Officers)
router.get('/profile', getProfile);

// @route   PUT /api/settings/profile
// @desc    Update current user profile
// @access  Private (All Officers)
router.put('/profile', updateProfile);

// @route   PUT /api/settings/profile/change-password
// @desc    Change current user password
// @access  Private (All Officers)
router.put('/profile/change-password', changePassword);

// ============================================
// DASHBOARD STATISTICS (Vision Doc Section 5.1)
// System Overview & Analytics
// ============================================

// @route   GET /api/settings/stats
// @desc    Get settings dashboard statistics
// @access  Private (Command, Admin)
router.get('/stats', authorize('command', 'admin'), getSettingsStats);

module.exports = router;