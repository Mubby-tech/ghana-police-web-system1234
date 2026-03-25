const mongoose = require('mongoose');

const inmateSchema = new mongoose.Schema({
  // Personal Information (Section 4.3)
  inmateId: {
  type: String,
  unique: true,
  uppercase: true,
  trim: true,
  match: [/^INM-\d{8}-\d{4}$/, 'Please enter a valid Inmate ID (e.g., INM-20260320-1274)']
},
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  otherNames: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  },
  nationality: {
    type: String,
    required: true,
    default: 'Ghanaian'
  },
  hometown: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  
  // Physical Description
  height: {
    type: String,
    trim: true
  },
  weight: {
    type: String,
    trim: true
  },
  complexion: {
    type: String,
    enum: ['Light', 'Medium', 'Dark'],
    trim: true
  },
  distinguishingMarks: {
    type: String,
    trim: true
  },
  photo: {
    type: String, // URL to photo
    trim: true
  },
  
  // Charges & Case Status (Section 4.3)
  caseNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  charges: [{
    charge: {
      type: String,
      required: true
    },
    dateFiled: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Pending', 'In Court', 'Convicted', 'Acquitted', 'Discharged'],
      default: 'Pending'
    }
  }],
  arrestingOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  arrestDate: {
    type: Date,
    required: true
  },
  arrestLocation: {
    type: String,
    required: true
  },
  
  // Court Information (Section 4.3)
  courtName: {
    type: String,
    required: true
  },
  courtLocation: {
    type: String,
    required: true
  },
  nextCourtDate: {
    type: Date
  },
  presidingJudge: {
    type: String,
    trim: true
  },
  
  // Bail Information (Section 4.3)
  bailStatus: {
    type: String,
    enum: ['Not Applicable', 'Granted', 'Pending', 'Denied'],
    default: 'Not Applicable'
  },
  bailAmount: {
    type: Number,
    default: 0
  },
  bailConditions: {
    type: String,
    trim: true
  },
  bailDate: {
    type: Date
  },
  
  // Custody Information
  admissionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  station: {
    type: String,
    required: true
  },
  cellNumber: {
    type: String,
    trim: true
  },
  custodyStatus: {
    type: String,
    enum: ['Remand', 'Convicted', 'Awaiting Trial', 'Released', 'Transferred'],
    default: 'Remand'
  },
  releaseDate: {
    type: Date
  },
  releaseReason: {
    type: String,
    trim: true
  },
  
  // Transfer Records (Section 4.3)
  transferHistory: [{
    fromStation: {
      type: String,
      required: true
    },
    toStation: {
      type: String,
      required: true
    },
    transferDate: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      trim: true
    },
    authorizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Medical Records (Section 4.3)
  medicalInfo: {
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      trim: true
    },
    allergies: {
      type: String,
      trim: true
    },
    chronicConditions: {
      type: String,
      trim: true
    },
    medications: {
      type: String,
      trim: true
    },
    lastMedicalCheckup: {
      type: Date
    }
  },
  
  // Next of Kin
  nextOfKin: {
    name: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  
  // Metadata
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Creates createdAt and updatedAt
});

// Generate Inmate ID before saving
inmateSchema.pre('save', async function() {  // ✅ Fixed: async only, no next
  if (!this.isModified('inmateId') && !this.inmateId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0,10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.inmateId = `INM-${dateStr}-${random}`;
  }
  // ✅ No next() needed - async handles it automatically
});

module.exports = mongoose.model('Inmate', inmateSchema);