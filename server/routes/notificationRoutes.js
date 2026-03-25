const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  createNotification,
  broadcastNotification
} = require('../controllers/notificationController');

// Import Auth Middleware (Vision Doc Section 4.2)
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected (Requires Login)
router.use(protect);

// @route   GET /api/notifications
// @desc    Get current user's notifications
// @access  Private (All Officers)
router.get('/', getNotifications);

// @route   GET /api/notifications/stats
// @desc    Get notification statistics
// @access  Private (All Officers)
router.get('/stats', getNotificationStats);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', deleteNotification);

// @route   POST /api/notifications
// @desc    Create notification
// @access  Private (Admin/Command)
router.post('/', authorize('admin', 'command'), createNotification);

// @route   POST /api/notifications/broadcast
// @desc    Broadcast notification to multiple users
// @access  Private (Admin)
router.post('/broadcast', authorize('admin'), broadcastNotification);

module.exports = router;