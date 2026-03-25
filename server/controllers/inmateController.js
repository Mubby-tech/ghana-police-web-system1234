const Inmate = require('../models/Inmate');
const User = require('../models/User');

// @desc    Register a new inmate
// @route   POST /api/inmates
// @access  Private (officer, cid, command, admin)
// ✅ Vision Doc Section 4.3 - Digital Inmate Management
exports.registerInmate = async (req, res) => {
  try {
    const {
      // Personal Info
      firstName, lastName, otherNames, dateOfBirth, gender, nationality,
      hometown, region, phone, email, height, weight, complexion,
      distinguishingMarks,
      
      // Case Info
      caseNumber, charges, arrestDate, arrestLocation, arrestingOfficer,
      
      // Court Info
      courtName, courtLocation, nextCourtDate, presidingJudge,
      
      // Bail Info
      bailStatus, bailAmount, bailConditions, bailDate,
      
      // Custody Info
      station, cellNumber, custodyStatus,
      
      // Medical Info
      bloodGroup, allergies, chronicConditions, medications,
      
      // Next of Kin
      nextOfKin
    } = req.body;

    // Check if inmate already exists (by case number or phone)
    const existingInmate = await Inmate.findOne({ 
      $or: [{ caseNumber }, { phone }] 
    });
    
    if (existingInmate) {
      return res.status(400).json({ 
        message: 'Inmate already exists with this Case Number or Phone Number' 
      });
    }

    // Create inmate record
    const inmate = await Inmate.create({
      // Personal Info
      firstName,
      lastName,
      otherNames,
      dateOfBirth,
      gender,
      nationality,
      hometown,
      region,
      phone,
      email,
      height,
      weight,
      complexion,
      distinguishingMarks,
      
      // Case Info
      caseNumber,
      charges: charges || [],
      arrestDate,
      arrestLocation,
      arrestingOfficer: arrestingOfficer || req.user.id,
      
      // Court Info
      courtName,
      courtLocation,
      nextCourtDate,
      presidingJudge,
      
      // Bail Info
      bailStatus: bailStatus || 'Not Applicable',
      bailAmount: bailAmount || 0,
      bailConditions,
      bailDate,
      
      // Custody Info
      station,
      cellNumber,
      custodyStatus: custodyStatus || 'Remand',
      
      // Medical Info
      medicalInfo: {
        bloodGroup,
        allergies,
        chronicConditions,
        medications
      },
      
      // Next of Kin
      nextOfKin,
      
      // Metadata
      registeredBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Inmate registered successfully',
      data: {
        inmate: {
          id: inmate._id,
          inmateId: inmate.inmateId,
          name: `${inmate.firstName} ${inmate.lastName}`,
          caseNumber: inmate.caseNumber,
          custodyStatus: inmate.custodyStatus,
          station: inmate.station,
          admissionDate: inmate.admissionDate
        }
      }
    });
  } catch (error) {
    console.error('Register Inmate Error:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get all inmates (with search & filter)
// @route   GET /api/inmates
// @access  Private (officer, cid, command, admin)
// ✅ Vision Doc Section 4.3 - Quick Retrieval of Inmate History
exports.getInmates = async (req, res) => {
  try {
    const {
      search,
      status,
      gender,
      station,
      region,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    let query = { isActive: true };

    // Search by name, inmate ID, or case number
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { inmateId: { $regex: search, $options: 'i' } },
        { caseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by custody status
    if (status) {
      query.custodyStatus = status;
    }

    // Filter by gender
    if (gender) {
      query.gender = gender;
    }

    // Filter by station
    if (station) {
      query.station = station;
    }

    // Filter by region
    if (region) {
      query.region = region;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const inmates = await Inmate.find(query)
      .populate('arrestingOfficer', 'policeId firstName lastName')
      .populate('registeredBy', 'policeId firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Inmate.countDocuments(query);

    res.json({
      success: true,
      message: 'Inmates retrieved successfully',
      data: {
        inmates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get Inmates Error:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get single inmate by ID
// @route   GET /api/inmates/:id
// @access  Private (officer, cid, command, admin)
// ✅ Vision Doc Section 4.3 - Complete Inmate Profile
exports.getInmate = async (req, res) => {
  try {
    const inmate = await Inmate.findById(req.params.id)
      .populate('arrestingOfficer', 'policeId firstName lastName station')
      .populate('registeredBy', 'policeId firstName lastName')
      .populate('transferHistory.authorizedBy', 'policeId firstName lastName');

    if (!inmate) {
      return res.status(404).json({ message: 'Inmate not found' });
    }

    res.json({
      success: true,
      message: 'Inmate retrieved successfully',
      data: { inmate }
    });
  } catch (error) {
    console.error('Get Inmate Error:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Update inmate information
// @route   PUT /api/inmates/:id
// @access  Private (cid, command, admin)
// ✅ Vision Doc Section 4.3 - Update Case Status, Court Dates, etc.
exports.updateInmate = async (req, res) => {
  try {
    const inmate = await Inmate.findById(req.params.id);

    if (!inmate) {
      return res.status(404).json({ message: 'Inmate not found' });
    }

    // Role-based update permissions
    const allowedRoles = ['cid', 'command', 'admin'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Not authorized to update inmate records' 
      });
    }

    // Update fields
    const updateFields = {
      // Personal Info
      firstName: req.body.firstName || inmate.firstName,
      lastName: req.body.lastName || inmate.lastName,
      otherNames: req.body.otherNames || inmate.otherNames,
      phone: req.body.phone || inmate.phone,
      email: req.body.email || inmate.email,
      
      // Case Info
      caseNumber: req.body.caseNumber || inmate.caseNumber,
      charges: req.body.charges || inmate.charges,
      
      // Court Info
      courtName: req.body.courtName || inmate.courtName,
      courtLocation: req.body.courtLocation || inmate.courtLocation,
      nextCourtDate: req.body.nextCourtDate || inmate.nextCourtDate,
      presidingJudge: req.body.presidingJudge || inmate.presidingJudge,
      
      // Bail Info
      bailStatus: req.body.bailStatus || inmate.bailStatus,
      bailAmount: req.body.bailAmount || inmate.bailAmount,
      bailConditions: req.body.bailConditions || inmate.bailConditions,
      bailDate: req.body.bailDate || inmate.bailDate,
      
      // Custody Info
      cellNumber: req.body.cellNumber || inmate.cellNumber,
      custodyStatus: req.body.custodyStatus || inmate.custodyStatus,
      releaseDate: req.body.releaseDate || inmate.releaseDate,
      releaseReason: req.body.releaseReason || inmate.releaseReason,
      
      // Medical Info
      medicalInfo: {
        bloodGroup: req.body.bloodGroup || inmate.medicalInfo.bloodGroup,
        allergies: req.body.allergies || inmate.medicalInfo.allergies,
        chronicConditions: req.body.chronicConditions || inmate.medicalInfo.chronicConditions,
        medications: req.body.medications || inmate.medicalInfo.medications,
        lastMedicalCheckup: req.body.lastMedicalCheckup || inmate.medicalInfo.lastMedicalCheckup
      },
      
      // Next of Kin
      nextOfKin: req.body.nextOfKin || inmate.nextOfKin
    };

    const updatedInmate = await Inmate.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Inmate information updated successfully',
      data: { inmate: updatedInmate }
    });
  } catch (error) {
    console.error('Update Inmate Error:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Transfer inmate to another station
// @route   POST /api/inmates/:id/transfer
// @access  Private (command, admin)
// ✅ Vision Doc Section 4.3 - Transfer Records
exports.transferInmate = async (req, res) => {
  try {
    const { toStation, reason } = req.body;

    if (!toStation || !reason) {
      return res.status(400).json({ 
        message: 'Please provide destination station and transfer reason' 
      });
    }

    const inmate = await Inmate.findById(req.params.id);

    if (!inmate) {
      return res.status(404).json({ message: 'Inmate not found' });
    }

    // Only command and admin can transfer
    if (!['command', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Not authorized to transfer inmates' 
      });
    }

    // Add to transfer history
    inmate.transferHistory.push({
      fromStation: inmate.station,
      toStation,
      transferDate: Date.now(),
      reason,
      authorizedBy: req.user.id
    });

    // Update current station
    inmate.station = toStation;
    inmate.custodyStatus = 'Transferred';

    await inmate.save();

    res.json({
      success: true,
      message: 'Inmate transferred successfully',
      data: { 
        inmate: {
          id: inmate._id,
          inmateId: inmate.inmateId,
          name: `${inmate.firstName} ${inmate.lastName}`,
          fromStation: inmate.transferHistory[inmate.transferHistory.length - 1].fromStation,
          toStation: inmate.station,
          transferDate: inmate.transferHistory[inmate.transferHistory.length - 1].transferDate
        }
      }
    });
  } catch (error) {
    console.error('Transfer Inmate Error:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Release inmate
// @route   POST /api/inmates/:id/release
// @access  Private (command, admin)
// ✅ Vision Doc Section 4.3 - Release Records
exports.releaseInmate = async (req, res) => {
  try {
    const { releaseReason } = req.body;

    if (!releaseReason) {
      return res.status(400).json({ 
        message: 'Please provide release reason' 
      });
    }

    const inmate = await Inmate.findById(req.params.id);

    if (!inmate) {
      return res.status(404).json({ message: 'Inmate not found' });
    }

    // Only command and admin can release
    if (!['command', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Not authorized to release inmates' 
      });
    }

    inmate.custodyStatus = 'Released';
    inmate.releaseDate = Date.now();
    inmate.releaseReason = releaseReason;
    inmate.isActive = false;

    await inmate.save();

    res.json({
      success: true,
      message: 'Inmate released successfully',
      data: { 
        inmate: {
          id: inmate._id,
          inmateId: inmate.inmateId,
          name: `${inmate.firstName} ${inmate.lastName}`,
          releaseDate: inmate.releaseDate,
          releaseReason: inmate.releaseReason
        }
      }
    });
  } catch (error) {
    console.error('Release Inmate Error:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Delete inmate (soft delete)
// @route   DELETE /api/inmates/:id
// @access  Private (admin only)
// ✅ Vision Doc Section 5.2 - Accountability (soft delete for audit)
exports.deleteInmate = async (req, res) => {
  try {
    // Only admin can delete
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Only administrators can delete inmate records' 
      });
    }

    const inmate = await Inmate.findById(req.params.id);

    if (!inmate) {
      return res.status(404).json({ message: 'Inmate not found' });
    }

    // Soft delete - set isActive to false
    inmate.isActive = false;
    await inmate.save();

    res.json({
      success: true,
      message: 'Inmate record deleted successfully (soft delete)',
      data: { id: inmate._id }
    });
  } catch (error) {
    console.error('Delete Inmate Error:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get inmate statistics
// @route   GET /api/inmates/stats
// @access  Private (command, admin)
// ✅ Vision Doc Section 5.1 - Dashboard Analytics
exports.getInmateStats = async (req, res) => {
  try {
    // Only command and admin can view stats
    if (!['command', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Not authorized to view statistics' 
      });
    }

    const totalInmates = await Inmate.countDocuments({ isActive: true });
    const maleInmates = await Inmate.countDocuments({ gender: 'Male', isActive: true });
    const femaleInmates = await Inmate.countDocuments({ gender: 'Female', isActive: true });
    const remandInmates = await Inmate.countDocuments({ custodyStatus: 'Remand', isActive: true });
    const convictedInmates = await Inmate.countDocuments({ custodyStatus: 'Convicted', isActive: true });
    const awaitingTrial = await Inmate.countDocuments({ custodyStatus: 'Awaiting Trial', isActive: true });
    const bailGranted = await Inmate.countDocuments({ bailStatus: 'Granted', isActive: true });

    res.json({
      success: true,
      data: {
        total: totalInmates,
        byGender: {
          male: maleInmates,
          female: femaleInmates
        },
        byStatus: {
          remand: remandInmates,
          convicted: convictedInmates,
          awaitingTrial: awaitingTrial
        },
        bail: {
          granted: bailGranted
        }
      }
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message 
    });
  }
};