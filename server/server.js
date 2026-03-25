const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB (Vision Doc Section 4.1 - Centralized Digital Database)
connectDB();

const app = express();

// ============================================
// Middleware Configuration
// ============================================

// CORS Configuration (Vision Doc Section 5.4 - Enhanced Data Security)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware
app.use(express.json());  // ✅ Must be before routes
app.use(express.urlencoded({ extended: true }));

// ============================================
// API Routes (Vision Document Modules)
// ============================================

// Authentication Module (Vision Doc Section 4.2 - Police ID Login System)
app.use('/api/auth', require('./routes/authRoutes'));

// Inmate Management Module (Vision Doc Section 4.3 - Digital Inmate Management)
app.use('/api/inmates', require('./routes/inmateRoutes'));

// CID Cases Module (Vision Doc Section 4.4 - Electronic CID Documentation)
app.use('/api/cases', require('./routes/caseRoutes'));

// Crime Reports Module (Vision Doc Section 4.1 - Centralized Digital Database)
app.use('/api/crime-reports', require('./routes/crimeReportRoutes'));

app.use('/api/edms', require('./routes/edmsRoutes'));

app.use('/api/personnel', require('./routes/personnelRoutes'));

app.use('/api/settings', require('./routes/settingsRoutes'));

app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.use('/api/notifications', require('./routes/notificationRoutes'));
// ============================================
// Test Route
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    message: '🇬🇭 Ghana Police Web System API',
    version: '1.0.0',
    status: 'Running',
    vision: 'Digital Transformation - 90% Paperless System',
    modules: [
      '✅ Authentication (Section 4.2)',
      '✅ Inmate Management (Section 4.3)',
      '✅ CID Cases (Section 4.4)',
      '✅ Crime Reports (Section 4.1)'
    ],
    features: [
      'Police ID Login System',
      'Role-Based Access Control',
      'Activity Logging & Accountability',
      'Secure Data Storage',
      'Electronic Documentation'
    ]
  });
});

// ============================================
// Error Handling Middleware (Vision Doc Section 5.4)
// ============================================
// Must be AFTER all routes
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// Server Configuration
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚔 ============================================');
  console.log('   GHANA POLICE WEB SYSTEM - API SERVER');
  console.log('   Digital Transformation Vision Document');
  console.log('============================================');
  console.log(`🌍 Server running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log('\n📋 MODULES LOADED:');
  console.log('   ✅ Authentication (Section 4.2)');
  console.log('   ✅ Inmate Management (Section 4.3)');
  console.log('   ✅ CID Cases (Section 4.4)');
  console.log('   ✅ Crime Reports (Section 4.1)');
  console.log('\n📊 VISION DOCUMENT ALIGNMENT:');
  console.log('   • Section 4.1: Centralized Digital Database');
  console.log('   • Section 4.2: Police ID Login System');
  console.log('   • Section 4.3: Digital Inmate Management');
  console.log('   • Section 4.4: Electronic CID Documentation');
  console.log('   • Section 5.1: Improved Efficiency');
  console.log('   • Section 5.2: Transparency & Accountability');
  console.log('   • Section 5.4: Enhanced Data Security');
  console.log('============================================\n');
});

module.exports = app;