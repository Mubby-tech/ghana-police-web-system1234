const Case = require('../models/Case');
const Inmate = require('../models/Inmate');
const CrimeReport = require('../models/CrimeReport');
const EDMSDocument = require('../models/EDMSDocument');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (All Officers) - Vision Doc Section 5.1
const getDashboardStats = async (req, res) => {
  try {
    // Get current user's region for filtered stats (optional)
    const userRegion = req.user.region;

    // Active Cases (CID Cases that are not closed)
    const activeCases = await Case.countDocuments({ 
      status: { $ne: 'Closed' }
    });

    // Total Inmates
    const totalInmates = await Inmate.countDocuments({ 
      status: 'In Custody' 
    });

    // Reports Filed (Crime Reports)
    const reportsFiled = await CrimeReport.countDocuments({});

    // Pending Approvals (EDMS Documents pending approval)
    const pendingApprovals = await EDMSDocument.countDocuments({ 
      status: 'Pending' 
    });

    // Calculate percentage changes (compare with last month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const lastMonthCases = await Case.countDocuments({ 
      status: { $ne: 'Closed' },
      createdAt: { $lt: lastMonth }
    });

    const lastMonthInmates = await Inmate.countDocuments({ 
      status: 'In Custody',
      createdAt: { $lt: lastMonth }
    });

    const lastMonthReports = await CrimeReport.countDocuments({ 
      createdAt: { $lt: lastMonth }
    });

    const lastMonthApprovals = await EDMSDocument.countDocuments({ 
      status: 'Pending',
      createdAt: { $lt: lastMonth }
    });

    // Calculate percentage changes
    const casesChange = lastMonthCases > 0 
      ? Math.round(((activeCases - lastMonthCases) / lastMonthCases) * 100) 
      : 0;

    const inmatesChange = lastMonthInmates > 0 
      ? Math.round(((totalInmates - lastMonthInmates) / lastMonthInmates) * 100) 
      : 0;

    const reportsChange = lastMonthReports > 0 
      ? Math.round(((reportsFiled - lastMonthReports) / lastMonthReports) * 100) 
      : 0;

    const approvalsChange = lastMonthApprovals > 0 
      ? Math.round(((pendingApprovals - lastMonthApprovals) / lastMonthApprovals) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        activeCases: {
          count: activeCases,
          change: casesChange,
          trend: casesChange >= 0 ? 'up' : 'down'
        },
        inmates: {
          count: totalInmates,
          change: inmatesChange,
          trend: inmatesChange >= 0 ? 'up' : 'down'
        },
        reportsFiled: {
          count: reportsFiled,
          change: reportsChange,
          trend: reportsChange >= 0 ? 'up' : 'down'
        },
        pendingApprovals: {
          count: pendingApprovals,
          change: approvalsChange,
          trend: approvalsChange >= 0 ? 'up' : 'down'
        }
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get recent activity logs
// @route   GET /api/dashboard/activity
// @access  Private (All Officers) - Vision Doc Section 5.2
const getRecentActivity = async (req, res) => {
  try {
    const limit = req.query.limit || 10;

    const activity = await ActivityLog.find()
      .populate('user', 'policeId firstName lastName role')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: activity.length,
      data: activity
    });
  } catch (error) {
    console.error('Recent Activity Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user-specific dashboard data
// @route   GET /api/dashboard/me
// @access  Private
const getMyDashboard = async (req, res) => {
  try {
    const user = req.user;

    // Get user's pending tasks
    const pendingDocuments = await EDMSDocument.countDocuments({
      assignedTo: user._id,
      status: 'Pending'
    });

    // Get user's active cases (if CID officer)
    let activeCases = 0;
    if (user.role === 'cid' || user.role === 'command' || user.role === 'admin') {
      activeCases = await Case.countDocuments({
        assignedOfficer: user._id,
        status: { $ne: 'Closed' }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          policeId: user.policeId,
          name: user.firstName + ' ' + user.lastName,
          role: user.role,
          region: user.region,
          station: user.station
        },
        pendingDocuments,
        activeCases
      }
    });
  } catch (error) {
    console.error('My Dashboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getMyDashboard
};