const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const fixAdminStatus = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not found');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('❌ No admin user found');
      process.exit(1);
    }

    console.log('📋 Current Admin Status:');
    console.log(`   Police ID: ${admin.policeId}`);
    console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`   Status: ${admin.status || 'UNDEFINED!'}\n`);

    // Update status to Active
    admin.status = 'Active';
    await admin.save();

    console.log('✅ Admin status updated to "Active"\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 You can now login!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 URL: http://localhost:5173/`);
    console.log(`👮 Police ID: ${admin.policeId}`);
    console.log(`🔑 Password: admin123`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixAdminStatus();