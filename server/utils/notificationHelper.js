const Notification = require('../models/Notification');
const User = require('../models/User');

// ============================================
// NOTIFICATION HELPER FUNCTIONS
// Auto-create notifications for various events
// ============================================

// Create notification for a single user
const createNotification = async (recipientId, type, title, message, actionUrl = '', relatedEntity = '', relatedEntityId = null, priority = 'medium') => {
  try {
    await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      actionUrl,
      relatedEntity,
      relatedEntityId,
      priority
    });
  } catch (error) {
    console.error('Create Notification Error:', error.message);
  }
};

// Broadcast to all users
const broadcastToAll = async (type, title, message, priority = 'medium') => {
  try {
    const allUsers = await User.find({ isActive: true }).select('_id');
    const recipientIds = allUsers.map(user => user._id);

    const notifications = recipientIds.map(recipientId => ({
      recipient: recipientId,
      type,
      title,
      message,
      priority
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Broadcast Error:', error.message);
  }
};

// Broadcast to users by role
const broadcastToRole = async (role, type, title, message, priority = 'medium') => {
  try {
    const users = await User.find({ role, isActive: true }).select('_id');
    const recipientIds = users.map(user => user._id);

    const notifications = recipientIds.map(recipientId => ({
      recipient: recipientId,
      type,
      title,
      message,
      priority
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Broadcast to Role Error:', error.message);
  }
};

// Notification templates (Vision Doc Section 5.1 - Improved Efficiency)
const templates = {
  // Case Assignment (Section 4.4 - CID)
  caseAssigned: (officerName, caseNumber) => ({
    type: 'case',
    title: '📋 New Case Assigned',
    message: `A new case (${caseNumber}) has been assigned to you for investigation.`
  }),

  // Document Approval (Section 4.5 - EDMS)
  documentApproval: (documentType, senderName) => ({
    type: 'document',
    title: '📄 Document Awaiting Approval',
    message: `${senderName} has submitted a ${documentType} for your approval.`
  }),

  // Inmate Transfer (Section 4.3 - Inmate Management)
  inmateTransfer: (inmateName, fromStation, toStation) => ({
    type: 'inmate',
    title: '👤 Inmate Transfer',
    message: `Inmate ${inmateName} is being transferred from ${fromStation} to ${toStation}.`
  }),

  // Court Date Reminder (Section 4.4 - CID)
  courtReminder: (caseNumber, courtDate, courtLocation) => ({
    type: 'info',
    title: '⚖️ Court Hearing Reminder',
    message: `Case ${caseNumber} hearing scheduled for ${courtDate} at ${courtLocation}.`,
    priority: 'high'
  }),

  // Password Expiry (Section 5.4 - Security)
  passwordExpiry: (daysRemaining) => ({
    type: 'warning',
    title: '🔐 Password Expiry Warning',
    message: `Your password will expire in ${daysRemaining} days. Please change it soon.`,
    priority: 'medium'
  }),

  // Security Alert (Section 5.4 - Security)
  securityAlert: (alertType, details) => ({
    type: 'security',
    title: '🚨 Security Alert',
    message: `${alertType}: ${details}`,
    priority: 'urgent'
  }),

  // System Announcement (Section 5.1 - Efficiency)
  systemAnnouncement: (announcement) => ({
    type: 'system',
    title: '📢 System Announcement',
    message: announcement,
    priority: 'medium'
  }),

  // New User Created (Section 4.2 - Police ID Login)
  newUserCreated: (officerName, policeId, role) => ({
    type: 'info',
    title: '👮 New User Account Created',
    message: `Officer ${officerName} (${policeId}) has been added to the system with role: ${role}.`
  })
};

module.exports = {
  createNotification,
  broadcastToAll,
  broadcastToRole,
  templates
};