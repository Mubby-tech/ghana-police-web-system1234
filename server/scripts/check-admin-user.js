const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const checkAdminUser = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not found');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const admin = await User.findOne({ role: 'admin' }).select('+password');
    
    if (!admin) {
      console.log('❌ No admin user found in database');
      console.log('💡 Run: node scripts/create-admin-user.js');
      process.exit(1);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Admin User Found:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ _id: ${admin._id}`);
    console.log(`✅ Police ID: ${admin.policeId}`);
    console.log(`✅ First Name: ${admin.firstName || 'N/A'}`);
    console.log(`✅ Last Name: ${admin.lastName || 'N/A'}`);
    console.log(`✅ Email: ${admin.email || 'N/A'}`);
    console.log(`✅ Role: ${admin.role}`);
    console.log(`✅ Status: ${admin.status || 'Active'}`);
    console.log(`✅ Password Hash: ${admin.password ? 'Exists (' + admin.password.length + ' chars)' : 'MISSING!'}`);
    console.log(`✅ Password Starts With: ${admin.password ? admin.password.substring(0, 20) + '...' : 'N/A'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 Password hash should start with $2a$10$ (bcrypt)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkAdminUser();