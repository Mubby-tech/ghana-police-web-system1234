const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// ============================================
// Generate JWT Token (Vision Doc Section 4.2)
// ============================================
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// ============================================
// Helper: Log Activity (Vision Doc Section 5.2)
// ============================================
const logActivity = async (user, action, status, statusCode, details, req) => {
  try {
    await ActivityLog.create({
      action,
      user: user ? user._id : null,
      userName: user ? user.firstName + ' ' + user.lastName : 'Unknown',
      userPoliceId: user ? user.policeId : 'Unknown',
      userRole: user ? user.role : 'Unknown',
      module: 'Auth',
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
      userAgent: req.get('user-agent') || 'Unknown',
      method: req.method,
      endpoint: req.originalUrl,
      status,
      statusCode,
      details
    });
  } catch (error) {
    console.error('Activity Log Error:', error.message);
  }
};

// ============================================
// REGISTER (Vision Doc Section 4.2)
// ============================================
const register = async (req, res) => {
  try {
    const { 
      policeId, 
      firstName, 
      lastName, 
      email, 
      password, 
      role, 
      region, 
      station,
      rank,
      department,
      contactNumber
    } = req.body;

    // Validate required fields
    if (!policeId || !firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [{ policeId }, { email }] 
    });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Officer already exists with this Police ID or Email'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Validate role
    const validRoles = ['officer', 'cid', 'hr', 'command', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Create user
    const user = await User.create({
      policeId,
      firstName,
      lastName,
      email,
      password,
      role,
      region,
      station,
      rank: rank || 'Constable',
      department: department || 'Administration',
      contactNumber: contactNumber || '',
      status: 'Active'
    });

    // Generate token
    const token = generateToken(user._id);

    // Log activity
    await logActivity(user, 'Create', 'Success', 201, `New officer ${user.policeId} registered`, req);

    res.status(201).json({
      success: true,
      message: 'Officer registered successfully',
      data: {
        user: {
          id: user._id,
          policeId: user.policeId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          region: user.region,
          station: user.station
        },
        token
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ============================================
// LOGIN (Vision Doc Section 4.2)
// ============================================
const login = async (req, res) => {
  try {
    const { policeId, password } = req.body;

    // Validate input
    if (!policeId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Police ID and Password'
      });
    }

    // Find user by Police ID
    const user = await User.findOne({ policeId }).select('+password');
    
    if (!user) {
      await ActivityLog.create({
        action: 'Login',
        user: null,
        userName: 'Unknown',
        userPoliceId: policeId,
        userRole: 'Unknown',
        module: 'Auth',
        ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
        userAgent: req.get('user-agent') || 'Unknown',
        method: 'POST',
        endpoint: '/api/auth/login',
        status: 'Failed',
        statusCode: 401,
        details: `Failed login attempt with Police ID: ${policeId}`
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid Police ID or Password'
      });
    }

    // Check if account is active (FIXED: using 'status' not 'isActive')
    if (!user.isActive) {
  await logActivity(user, 'Login', 'Forbidden', 403, `Login blocked - Account inactive`, req);

  return res.status(403).json({
    success: false,
    message: 'Account is deactivated. Contact your commander or HR.'
  });
}

    // Verify password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      await logActivity(user, 'Login', 'Failed', 401, `Failed password attempt for ${user.policeId}`, req);

      return res.status(401).json({
        success: false,
        message: 'Invalid Police ID or Password'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Log successful login
    await logActivity(user, 'Login', 'Success', 200, `Officer ${user.policeId} logged in successfully`, req);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          policeId: user.policeId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          rank: user.rank,
          region: user.region,
          station: user.station,
          department: user.department
        },
        token
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ============================================
// GET CURRENT USER (Vision Doc Section 4.2)
// ============================================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          policeId: user.policeId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          rank: user.rank,
          region: user.region,
          station: user.station,
          department: user.department,
          contactNumber: user.contactNumber,
          status: user.status,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ============================================
// LOGOUT (Vision Doc Section 5.2)
// ============================================
const logout = async (req, res) => {
  try {
    await logActivity(req.user, 'Logout', 'Success', 200, `Officer ${req.user.policeId} logged out`, req);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ============================================
// UPDATE PASSWORD (Vision Doc Section 5.4)
// ============================================
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    await logActivity(user, 'Update', 'Success', 200, `Password changed for ${user.policeId}`, req);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ============================================
// EXPORT ALL CONTROLLERS
// ============================================
module.exports = {
  register,
  login,
  getMe,
  logout,
  updatePassword
};