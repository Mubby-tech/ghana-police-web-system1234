const Notification = require('../models/Notification');
const User = require('../models/User');

// ============================================
// GET USER NOTIFICATIONS (Vision Doc Section 5.1)
// ============================================

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private (All Officers)
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    let query = { recipient: req.user.id };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      unreadCount,
      pages: Math.ceil(total / limit),
      data: notifications
    });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user.id
      },
      {
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Mark as Read Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark All as Read Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete Notification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
const getNotificationStats = async (req, res) => {
  try {
    const total = await Notification.countDocuments({
      recipient: req.user.id
    });

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    const byType = await Notification.aggregate([
      { $match: { recipient: req.user.id } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const byPriority = await Notification.aggregate([
      { $match: { recipient: req.user.id, isRead: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        unreadCount,
        byType,
        byPriority
      }
    });
  } catch (error) {
    console.error('Notification Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ============================================
// CREATE NOTIFICATION (Internal Use)
// ============================================

// @desc    Create notification (for internal use)
// @route   POST /api/notifications
// @access  Private (Admin/Command)
const createNotification = async (req, res) => {
  try {
    const { recipientId, type, title, message, actionUrl, relatedEntity, relatedEntityId, priority } = req.body;

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      actionUrl: actionUrl || '',
      relatedEntity: relatedEntity || '',
      relatedEntityId: relatedEntityId || null,
      priority: priority || 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Create Notification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ============================================
// BROADCAST NOTIFICATION (Admin Only)
// ============================================

// @desc    Send notification to multiple users
// @route   POST /api/notifications/broadcast
// @access  Private (Admin)
const broadcastNotification = async (req, res) => {
  try {
    const { recipientIds, type, title, message, actionUrl, priority } = req.body;

    if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipient IDs'
      });
    }

    const notifications = recipientIds.map(recipientId => ({
      recipient: recipientId,
      type,
      title,
      message,
      actionUrl: actionUrl || '',
      priority: priority || 'medium'
    }));

    await Notification.insertMany(notifications);

    res.status(200).json({
      success: true,
      message: `Notification sent to ${recipientIds.length} users`,
      count: recipientIds.length
    });
  } catch (error) {
    console.error('Broadcast Notification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  createNotification,
  broadcastNotification
};