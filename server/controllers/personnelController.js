const Personnel = require('../models/Personnel');
const User = require('../models/User');

// --- Helper: Log Activity for Accountability (Vision Doc Section 5.2) ---
const logActivity = async (personnelId, action, user, details, ipAddress) => {
  try {
    await Personnel.findByIdAndUpdate(personnelId, {
      $push: {
        activityLog: {
          action,
          performedBy: user._id,
          details,
          ipAddress: ipAddress || 'Unknown',
          timestamp: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// @desc    Register a new officer (HR/Admin only)
// @route   POST /api/personnel
// @access  Private (HR, Command, Admin) - Vision Doc Section 4.2
const registerOfficer = async (req, res) => {
  try {
    const {
      policeId,
      firstName,
      lastName,
      otherNames,
      dateOfBirth,
      placeOfBirth,
      gender,
      nationality,
      contactNumber,
      email,
      residentialAddress,
      rank,
      serviceNumber,
      dateOfEnlistment,
      dateOfConfirmation,
      station,
      region,
      department,
      emergencyContact,
      nextOfKin
    } = req.body;

    // 1. Check if officer already exists
    const existingOfficer = await Personnel.findOne({ 
      $or: [{ policeId }, { serviceNumber }, { email }] 
    });

    if (existingOfficer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Officer already exists with this Police ID, Service Number, or Email' 
      });
    }

    // 2. Create Officer Record
    const newOfficer = await Personnel.create({
      policeId,
      firstName,
      lastName,
      otherNames,
      dateOfBirth,
      placeOfBirth,
      gender,
      nationality: nationality || 'Ghanaian',
      contactNumber,
      email,
      residentialAddress,
      rank,
      serviceNumber,
      dateOfEnlistment,
      dateOfConfirmation,
      station,
      region,
      department,
      deploymentStatus: 'Active',
      emergencyContact,
      nextOfKin
    });

    // 3. Log Activity (Vision Doc Section 5.2 - Accountability)
    await logActivity(
      newOfficer._id,
      'Officer Registered',
      req.user,
      `New officer ${policeId} (${firstName} ${lastName}) registered by ${req.user.policeId}`,
      req.ip
    );

    res.status(201).json({ 
      success: true, 
      message: 'Officer registered successfully',
      data: newOfficer 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get all personnel (Filtered by Role)
// @route   GET /api/personnel
// @access  Private (All Officers) - Vision Doc Section 4.2
const getPersonnel = async (req, res) => {
  try {
    const { 
      rank, 
      station, 
      region, 
      department, 
      deploymentStatus, 
      search,
      startDate,
      endDate
    } = req.query;
    
    let query = { isDeleted: false };

    // RBAC: Officers see based on role (Vision Doc Section 4.2)
    if (req.user.role === 'officer') {
      // Officers see basic info only (active officers)
      query.deploymentStatus = 'Active';
    } else if (req.user.role === 'cid') {
      // CID sees all active officers
      query.deploymentStatus = 'Active';
    }
    // HR, Command, Admin see all (no filter added)

    // Apply filters
    if (rank) query.rank = rank;
    if (station) query.station = station;
    if (region) query.region = region;
    if (department) query.department = department;
    if (deploymentStatus) query.deploymentStatus = deploymentStatus;
    
    if (startDate || endDate) {
      query.dateOfEnlistment = {};
      if (startDate) query.dateOfEnlistment.$gte = new Date(startDate);
      if (endDate) query.dateOfEnlistment.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { policeId: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { serviceNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const personnel = await Personnel.find(query)
      .select('-__v')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: personnel.length, 
      data: personnel 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get single officer by ID
// @route   GET /api/personnel/:id
// @access  Private (Vision Doc Section 4.2)
const getPersonnelById = async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);

    if (!personnel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Officer not found' 
      });
    }

    // Check access permission (Vision Doc Section 5.4 - Data Security)
    const isOwnRecord = personnel.policeId === req.user.policeId;
    const isHR = req.user.role === 'hr';
    const isAdmin = ['command', 'admin'].includes(req.user.role);

    if (!isOwnRecord && !isHR && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You are not authorized to view this record.' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: personnel 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Update officer information
// @route   PUT /api/personnel/:id
// @access  Private (HR, Command, Admin) - Vision Doc Section 4.2
const updateOfficer = async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);

    if (!personnel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Officer not found' 
      });
    }

    // Check authorization (HR/Command/Admin only - Vision Doc Section 4.2)
    if (!['hr', 'command', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only HR, Command, or Admin can update officer records' 
      });
    }

    // Update allowed fields
    const allowedFields = [
      'contactNumber', 'email', 'residentialAddress', 'station', 
      'region', 'department', 'emergencyContact', 'nextOfKin'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        personnel[field] = req.body[field];
      }
    });

    await personnel.save();

    // Log Activity (Vision Doc Section 5.2)
    await logActivity(
      personnel._id,
      'Officer Record Updated',
      req.user,
      `Record updated by ${req.user.policeId}`,
      req.ip
    );

    res.status(200).json({ 
      success: true, 
      message: 'Officer record updated successfully',
      data: personnel 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Transfer officer to new station
// @route   POST /api/personnel/:id/transfer
// @access  Private (HR, Command, Admin) - Vision Doc Section 4.1
const transferOfficer = async (req, res) => {
  try {
    const { toStation, toRegion, reason, approvedBy } = req.body;
    const personnel = await Personnel.findById(req.params.id);

    if (!personnel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Officer not found' 
      });
    }

    // Check authorization
    if (!['hr', 'command', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only HR, Command, or Admin can transfer officers' 
      });
    }

    // Add transfer record to history
    personnel.transfers.push({
      fromStation: personnel.station,
      toStation,
      fromRegion: personnel.region,
      toRegion,
      date: new Date(),
      reason: reason || 'Official Transfer',
      approvedBy: approvedBy || req.user.policeId
    });

    // Update current station
    personnel.station = toStation;
    personnel.region = toRegion;

    await personnel.save();

    // Log Activity (Vision Doc Section 5.2)
    await logActivity(
      personnel._id,
      'Officer Transferred',
      req.user,
      `Transferred from ${personnel.transfers[personnel.transfers.length - 1].fromStation} to ${toStation}`,
      req.ip
    );

    res.status(200).json({ 
      success: true, 
      message: 'Officer transferred successfully',
      data: personnel 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Record officer promotion
// @route   POST /api/personnel/:id/promote
// @access  Private (Command, Admin) - Vision Doc Section 4.2
const promoteOfficer = async (req, res) => {
  try {
    const { newRank, issuedBy, referenceNumber } = req.body;
    const personnel = await Personnel.findById(req.params.id);

    if (!personnel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Officer not found' 
      });
    }

    // Check authorization (Command/Admin only)
    if (!['command', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only Command or Admin can record promotions' 
      });
    }

    // Add promotion record to history
    personnel.promotions.push({
      rank: newRank,
      date: new Date(),
      issuedBy: issuedBy || req.user.policeId,
      referenceNumber: referenceNumber || `PROMO-${Date.now()}`
    });

    // Update current rank
    personnel.rank = newRank;

    await personnel.save();

    // Log Activity (Vision Doc Section 5.2)
    await logActivity(
      personnel._id,
      'Officer Promoted',
      req.user,
      `Promoted to ${newRank}`,
      req.ip
    );

    res.status(200).json({ 
      success: true, 
      message: 'Officer promoted successfully',
      data: personnel 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Process leave request
// @route   POST /api/personnel/:id/leave
// @access  Private (HR, Command, Admin) - Vision Doc Section 4.1
const processLeaveRequest = async (req, res) => {
  try {
    const { type, startDate, endDate, status, remarks } = req.body;
    const personnel = await Personnel.findById(req.params.id);

    if (!personnel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Officer not found' 
      });
    }

    // Check authorization
    if (!['hr', 'command', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only HR, Command, or Admin can process leave requests' 
      });
    }

    // Add leave record
    personnel.leaveRecords.push({
      type,
      startDate,
      endDate,
      status: status || 'Pending',
      approvedBy: req.user.policeId,
      remarks: remarks || ''
    });

    // Update deployment status if on leave
    if (status === 'Approved') {
      personnel.deploymentStatus = 'On Leave';
    }

    await personnel.save();

    // Log Activity (Vision Doc Section 5.2)
    await logActivity(
      personnel._id,
      'Leave Request Processed',
      req.user,
      `Leave ${status} for ${type}`,
      req.ip
    );

    res.status(200).json({ 
      success: true, 
      message: `Leave request ${status.toLowerCase()}`,
      data: personnel 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Soft Delete Officer Record (Vision Doc Section 5.2)
// @route   DELETE /api/personnel/:id
// @access  Private (Command, Admin) - Vision Doc Section 4.2
const deleteOfficer = async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);

    if (!personnel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Officer not found' 
      });
    }

    // Check authorization (Command/Admin only)
    if (!['command', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only Command or Admin can delete officer records' 
      });
    }

    personnel.isDeleted = true;
    personnel.deletedAt = new Date();
    await personnel.save();

    // Log Activity (Vision Doc Section 5.2)
    await logActivity(
      personnel._id,
      'Officer Record Deleted',
      req.user,
      'Record archived/deleted',
      req.ip
    );

    res.status(200).json({ 
      success: true, 
      message: 'Officer record moved to archive' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get HR Statistics (Vision Doc Section 5.1 - Dashboard Analytics)
// @route   GET /api/personnel/stats
// @access  Private (HR, Command, Admin) - Vision Doc Section 4.2
const getHRStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { isDeleted: false };

    if (startDate || endDate) {
      query.dateOfEnlistment = {};
      if (startDate) query.dateOfEnlistment.$gte = new Date(startDate);
      if (endDate) query.dateOfEnlistment.$lte = new Date(endDate);
    }

    // Total officers
    const total = await Personnel.countDocuments(query);

    // By rank
    const byRank = await Personnel.aggregate([
      { $match: query },
      { $group: { _id: '$rank', count: { $sum: 1 } } }
    ]);

    // By region
    const byRegion = await Personnel.aggregate([
      { $match: query },
      { $group: { _id: '$region', count: { $sum: 1 } } }
    ]);

    // By department
    const byDepartment = await Personnel.aggregate([
      { $match: query },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    // By deployment status
    const byStatus = await Personnel.aggregate([
      { $match: query },
      { $group: { _id: '$deploymentStatus', count: { $sum: 1 } } }
    ]);

    // By gender
    const byGender = await Personnel.aggregate([
      { $match: query },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    // On leave
    const onLeave = await Personnel.countDocuments({
      ...query,
      deploymentStatus: 'On Leave'
    });

    // Active officers
    const active = await Personnel.countDocuments({
      ...query,
      deploymentStatus: 'Active'
    });

    // Average years of service
    const avgServiceStats = await Personnel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgEnlistmentYear: { $avg: '$dateOfEnlistment' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        byRank,
        byRegion,
        byDepartment,
        byStatus,
        byGender,
        onLeave,
        active,
        avgServiceStats: avgServiceStats[0] || null
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
  registerOfficer,
  getPersonnel,
  getPersonnelById,
  updateOfficer,
  transferOfficer,
  promoteOfficer,
  processLeaveRequest,
  deleteOfficer,
  getHRStats
};