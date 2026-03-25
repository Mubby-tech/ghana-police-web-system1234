const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const resetAdminPassword = async () => {
  try {
    // Check if MONGODB_URI exists (matching your .env file)
    if (!process.env.MONGODB_URI) {
      console.log('❌ Error: MONGODB_URI not found in .env file');
      console.log('📝 Please check your server/.env file');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('❌ No admin user found');
      console.log('💡 Tip: You may need to register an admin user first');
      process.exit(1);
    }

    console.log(`Found admin: ${admin.policeId} (${admin.name})`);

    // Create new password hash
    const newPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    admin.password = hashedPassword;
    admin.passwordChangedAt = new Date();
    await admin.save();

    console.log('✅ Admin password reset successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔑 New password: ${newPassword}`);
    console.log(`👮 Police ID: ${admin.policeId}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Please change this password after login!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdminPassword();