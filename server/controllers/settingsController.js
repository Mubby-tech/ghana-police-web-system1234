const ActivityLog = require('../models/ActivityLog');
const SystemSetting = require('../models/SystemSetting');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ============================================
// ACTIVITY LOGGING (Vision Doc Section 5.2)
// Transparency & Accountability
// ============================================

// @desc    Get all activity logs (Admin/Command only)
// @route   GET /api/settings/activity-logs
// @access  Private (Command, Admin) - Vision Doc Section 4.2
const getActivityLogs = async (req, res) => {
  try {
    const { 
      module, 
      action, 
      status, 
      user, 
      startDate, 
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    let query = {};

    // Apply filters
    if (module) query.module = module;
    if (action) query.action = action;
    if (status) query.status = status;
    if (user) query.user = user;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find(query)
      .populate('user', 'policeId name role station')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get activity log statistics (Dashboard Analytics)
// @route   GET /api/settings/activity-stats
// @access  Private (Command, Admin) - Vision Doc Section 5.1
const getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Total logs
    const total = await ActivityLog.countDocuments(query);

    // By module
    const byModule = await ActivityLog.aggregate([
      { $match: query },
      { $group: { _id: '$module', count: { $sum: 1 } } }
    ]);

    // By action
    const byAction = await ActivityLog.aggregate([
      { $match: query },
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);

    // By status
    const byStatus = await ActivityLog.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // By user (top 10 most active)
    const byUser = await ActivityLog.aggregate([
      { $match: query },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userId: '$_id',
          policeId: '$userInfo.policeId',
          name: '$userInfo.name',
          count: 1
        }
      }
    ]);

    // Failed attempts (security monitoring - Vision Doc Section 5.4)
    const failedAttempts = await ActivityLog.countDocuments({
      ...query,
      status: { $in: ['Failed', 'Unauthorized', 'Forbidden'] }
    });

    // Login activities
    const logins = await ActivityLog.countDocuments({
      ...query,
      action: 'Login'
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        byModule,
        byAction,
        byStatus,
        byUser,
        failedAttempts,
        logins
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

// @desc    Export activity logs (Admin only)
// @route   GET /api/settings/activity-logs/export
// @access  Private (Admin) - Vision Doc Section 5.2
const exportActivityLogs = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await ActivityLog.find(query)
      .populate('user', 'policeId name role station')
      .sort({ timestamp: -1 });

    if (format === 'csv') {
      // CSV Export
      const csvHeader = 'Timestamp,User,Police ID,Role,Action,Module,Status,IP Address,Details\n';
      const csvRows = logs.map(log => 
        `${log.timestamp},${log.userName},${log.userPoliceId},${log.userRole},${log.action},${log.module},${log.status},${log.ipAddress},"${log.details}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=activity-logs-${Date.now()}.csv`);
      res.send(csvHeader + csvRows);
    } else {
      // JSON Export
      res.status(200).json({
        success: true,
        count: logs.length,
        exportedAt: new Date(),
        exportedBy: req.user.policeId,
        data: logs
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Clear old activity logs (Admin only)
// @route   DELETE /api/settings/activity-logs/clear
// @access  Private (Admin) - Vision Doc Section 5.3
const clearOldLogs = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await ActivityLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    // Log this action
    await ActivityLog.create({
      action: 'Delete',
      user: req.user._id,
      userName: req.user.name,
      userPoliceId: req.user.policeId,
      userRole: req.user.role,
      module: 'Settings',
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || 'Unknown',
      method: 'DELETE',
      endpoint: '/api/settings/activity-logs/clear',
      status: 'Success',
      statusCode: 200,
      details: `Cleared ${result.deletedCount} activity logs older than ${days} days`
    });

    res.status(200).json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} old activity logs`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ============================================
// SYSTEM SETTINGS (Vision Doc Section 4.2)
// System Configuration & Security
// ============================================

// @desc    Get all system settings
// @route   GET /api/settings/system
// @access  Private (Command, Admin) - Vision Doc Section 4.2
const getSystemSettings = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;

    const settings = await SystemSetting.find(query).sort({ category: 1, key: 1 });

    res.status(200).json({
      success: true,
      count: settings.length,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single system setting by key
// @route   GET /api/settings/system/:key
// @access  Private (Command, Admin) - Vision Doc Section 4.2
const getSystemSettingByKey = async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({ 
      key: req.params.key.toUpperCase(),
      isActive: true 
    });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.status(200).json({
      success: true,
      data: setting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update system setting (Admin only)
// @route   PUT /api/settings/system/:key
// @access  Private (Admin) - Vision Doc Section 5.4
const updateSystemSetting = async (req, res) => {
  try {
    const { value, description } = req.body;

    const setting = await SystemSetting.findOneAndUpdate(
  { key: req.params.key.toUpperCase() },
  {
    value,
    description: description || undefined,
    lastModifiedBy: req.user._id,
    lastModifiedAt: new Date()
  },
  { returnDocument: 'after', runValidators: true }  // ← Updated
);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    // Log this action (Vision Doc Section 5.2)
    await ActivityLog.create({
      action: 'Update',
      user: req.user._id,
      userName: req.user.name,
      userPoliceId: req.user.policeId,
      userRole: req.user.role,
      module: 'Settings',
      resourceId: setting._id,
      resourceType: 'SystemSetting',
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || 'Unknown',
      method: 'PUT',
      endpoint: `/api/settings/system/${req.params.key}`,
      status: 'Success',
      statusCode: 200,
      details: `Updated system setting ${setting.key} from ${setting.value} to ${value}`
    });

    res.status(200).json({
      success: true,
      message: 'System setting updated successfully',
      data: setting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new system setting (Admin only)
// @route   POST /api/settings/system
// @access  Private (Admin) - Vision Doc Section 5.4
const createSystemSetting = async (req, res) => {
  try {
    const { key, value, type, description, category } = req.body;

    const existingSetting = await SystemSetting.findOne({ 
      key: key.toUpperCase() 
    });

    if (existingSetting) {
      return res.status(400).json({
        success: false,
        message: 'Setting with this key already exists'
      });
    }

    const setting = await SystemSetting.create({
      key: key.toUpperCase(),
      value,
      type: type || 'String',
      description,
      category: category || 'General',
      lastModifiedBy: req.user._id,
      lastModifiedAt: new Date()
    });

    // Log this action
    await ActivityLog.create({
      action: 'Create',
      user: req.user._id,
      userName: req.user.name,
      userPoliceId: req.user.policeId,
      userRole: req.user.role,
      module: 'Settings',
      resourceId: setting._id,
      resourceType: 'SystemSetting',
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || 'Unknown',
      method: 'POST',
      endpoint: '/api/settings/system',
      status: 'Success',
      statusCode: 201,
      details: `Created new system setting ${setting.key}`
    });

    res.status(201).json({
      success: true,
      message: 'System setting created successfully',
      data: setting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ============================================
// USER MANAGEMENT (Vision Doc Section 4.2)
// Police ID Login System & Role-Based Access
// ============================================

// @desc    Get all users (Admin only)
// @route   GET /api/settings/users
// @access  Private (Admin) - Vision Doc Section 4.2
const getAllUsers = async (req, res) => {
  try {
    const { role, station, region, status, search, page = 1, limit = 50 } = req.query;
    let query = {};

    if (role) query.role = role;
    if (station) query.station = station;
    if (region) query.region = region;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { policeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single user by ID (Admin only)
// @route   GET /api/settings/users/:id
// @access  Private (Admin) - Vision Doc Section 4.2
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/settings/users/:id/role
// @access  Private (Admin) - Vision Doc Section 4.2
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log this action
    await ActivityLog.create({
      action: 'Update',
      user: req.user._id,
      userName: req.user.name,
      userPoliceId: req.user.policeId,
      userRole: req.user.role,
      module: 'Settings',
      resourceId: user._id,
      resourceType: 'User',
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || 'Unknown',
      method: 'PUT',
      endpoint: `/api/settings/users/${req.params.id}/role`,
      status: 'Success',
      statusCode: 200,
      details: `Updated user role for ${user.policeId} to ${role}`
    });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Deactivate/Activate user (Admin only)
// @route   PUT /api/settings/users/:id/status
// @access  Private (Admin) - Vision Doc Section 5.4
const updateUserStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        statusReason: reason || '',
        statusUpdatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log this action
    await ActivityLog.create({
      action: 'Update',
      user: req.user._id,
      userName: req.user.name,
      userPoliceId: req.user.policeId,
      userRole: req.user.role,
      module: 'Settings',
      resourceId: user._id,
      resourceType: 'User',
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || 'Unknown',
      method: 'PUT',
      endpoint: `/api/settings/users/${req.params.id}/status`,
      status: 'Success',
      statusCode: 200,
      details: `Updated user status for ${user.policeId} to ${status}. Reason: ${reason || 'N/A'}`
    });

    res.status(200).json({
      success: true,
      message: `User ${status} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Reset user password (Admin only)
// @route   POST /api/settings/users/:id/reset-password
// @access  Private (Admin) - Vision Doc Section 5.4
const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordChangedAt = new Date();
    await user.save();

    // Log this action
    await ActivityLog.create({
      action: 'Update',
      user: req.user._id,
      userName: req.user.name,
      userPoliceId: req.user.policeId,
      userRole: req.user.role,
      module: 'Settings',
      resourceId: user._id,
      resourceType: 'User',
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || 'Unknown',
      method: 'POST',
      endpoint: `/api/settings/users/${req.params.id}/reset-password`,
      status: 'Success',
      statusCode: 200,
      details: `Password reset for user ${user.policeId} by ${req.user.policeId}`
    });

    res.status(200).json({
      success: true,
      message: 'User password reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ============================================
// PROFILE SETTINGS (Vision Doc Section 4.2)
// Individual Officer Profile Management
// ============================================

// @desc    Get current user profile
// @route   GET /api/settings/profile
// @access  Private (All Officers) - Vision Doc Section 4.2
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update current user profile
// @route   PUT /api/settings/profile
// @access  Private (All Officers) - Vision Doc Section 4.2
const updateProfile = async (req, res) => {
  try {
    const { name, email, contactNumber, station, region } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name || undefined,
        email: email || undefined,
        contactNumber: contactNumber || undefined,
        station: station || undefined,
        region: region || undefined
      },
      { new: true, runValidators: true }
    ).select('-password');

    // Log this action
   // Log this action (Vision Doc Section 5.2 - Accountability)
await ActivityLog.create({
  action: 'Update',
  user: req.user._id,
  userName: req.user.name || user.name || 'Unknown',  // ✅ Fallback
  userPoliceId: req.user.policeId || user.policeId || 'Unknown',  // ✅ Fallback
  userRole: req.user.role || user.role || 'Unknown',  // ✅ Fallback
  module: 'Settings',
  resourceId: user._id.toString(),
  resourceType: 'User',
  ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',  // ✅ Fallback
  userAgent: req.get('user-agent') || 'Unknown',
  method: 'PUT',
  endpoint: '/api/settings/profile',
  status: 'Success',
  statusCode: 200,
  details: `User ${user.policeId} updated their profile`
});

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Change current user password
// @route   PUT /api/settings/profile/change-password
// @access  Private (All Officers) - Vision Doc Section 5.4
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordChangedAt = new Date();
    await user.save();

    // Log this action
    await ActivityLog.create({
  action: 'Update',
  user: req.user._id,
  userName: req.user.name || user.name || 'Unknown',  // ✅ Fallback
  userPoliceId: req.user.policeId || user.policeId || 'Unknown',  // ✅ Fallback
  userRole: req.user.role || user.role || 'Unknown',  // ✅ Fallback
  module: 'Settings',
  resourceId: user._id.toString(),
  resourceType: 'User',
  ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',  // ✅ Fallback
  userAgent: req.get('user-agent') || 'Unknown',
  method: 'PUT',
  endpoint: '/api/settings/profile/change-password',
  status: 'Success',
  statusCode: 200,
  details: `User ${user.policeId} changed their password`
});

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ============================================
// DASHBOARD STATISTICS (Vision Doc Section 5.1)
// System Overview & Analytics
// ============================================

// @desc    Get settings dashboard statistics
// @route   GET /api/settings/stats
// @access  Private (Command, Admin) - Vision Doc Section 5.1
const getSettingsStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Total users
    const totalUsers = await User.countDocuments();

    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Users by status
    const usersByStatus = await User.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Total activity logs
    const totalLogs = await ActivityLog.countDocuments(query);

    // Recent activity (last 24 hours)
    const last24Hours = new Date();
    last24Hours.setDate(last24Hours.getDate() - 1);

    const recentActivity = await ActivityLog.countDocuments({
      timestamp: { $gte: last24Hours }
    });

    // Security alerts (failed logins in last 24 hours)
    const securityAlerts = await ActivityLog.countDocuments({
      timestamp: { $gte: last24Hours },
      action: 'Login',
      status: 'Failed'
    });

    // System settings count
    const totalSettings = await SystemSetting.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byRole: usersByRole,
          byStatus: usersByStatus
        },
        activity: {
          total: totalLogs,
          recent24Hours: recentActivity,
          securityAlerts
        },
        settings: {
          total: totalSettings
        }
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
};