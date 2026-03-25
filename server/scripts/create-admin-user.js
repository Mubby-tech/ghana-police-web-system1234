const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Check if MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not found in .env file');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log(`   Police ID: ${existingAdmin.policeId}`);
      console.log(`   Name: ${existingAdmin.firstName || ''} ${existingAdmin.lastName || ''}`);
      console.log('🗑️  Deleting existing admin...');
      await User.deleteOne({ role: 'admin' });
      console.log('✅ Existing admin deleted');
    }

    // Create new password hash
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin user (with firstName & lastName - matching User model schema)
    console.log('👮 Creating new admin user...');
    const admin = await User.create({
      policeId: 'GPS-99999',
      firstName: 'Admin Mubarak',
      lastName: 'Idris',
      email: 'admin@gps.gov.gh',
      password: hashedPassword,
      role: 'admin',
      rank: 'Commissioner',
      station: 'Police Headquarters',
      region: 'Greater Accra',
      department: 'Administration',
      contactNumber: '0555123456',
      status: 'Active'
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 URL: http://localhost:5173/`);
    console.log(`👮 Police ID: ${admin.policeId}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🎖️  Role: ${admin.role}`);
    console.log(`🏢 Station: ${admin.station}`);
    console.log(`📍 Region: ${admin.region}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  SECURITY NOTICE:');
    console.log('⚠️  Please change this password after login!');
    console.log('⚠️  Go to: Dashboard → Settings → Profile');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    console.log('');
    console.log('🚀 You can now login with the credentials above!');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('💡 Troubleshooting Tips:');
    console.error('   1. Check your MONGODB_URI in .env file');
    console.error('   2. Make sure MongoDB Atlas is accessible');
    console.error('   3. Check your internet connection');
    console.error('   4. Run: npm install (if modules are missing)');
    process.exit(1);
  }
};

createAdminUser();