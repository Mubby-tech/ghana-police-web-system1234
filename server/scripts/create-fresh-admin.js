const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const createFreshAdmin = async () => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🇬🇭 GHANA POLICE SERVICE - ADMIN CREATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not found in .env file');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Delete any existing admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Found existing admin user');
      console.log(`   Police ID: ${existingAdmin.policeId}`);
      console.log('🗑️  Deleting old admin...\n');
      await User.deleteOne({ role: 'admin' });
    }

    // ✅ CORRECT: Don't hash password manually!
    // Let User model pre-save hook handle it
    const password = 'admin123';
    console.log('👮 Creating new admin user...');
    console.log(`   Password: ${password} (will be hashed by User model)\n`);
    
    const admin = await User.create({
      policeId: 'GPS-99999',
      firstName: 'Admin Mubarak',
      lastName: 'Idris',
      email: 'admin@gps.gov.gh',
      password: password,  // ✅ RAW PASSWORD - Let pre-save hook hash it
      role: 'admin',
      region: 'Greater Accra',
      station: 'Police Headquarters',
      isActive: true
    });

    console.log('✅ Admin created successfully!\n');

    // Verify the user was saved correctly
    const savedUser = await User.findOne({ policeId: 'GPS-99999' }).select('+password');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ADMIN USER VERIFICATION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ _id: ${savedUser._id}`);
    console.log(`✅ Police ID: ${savedUser.policeId}`);
    console.log(`✅ First Name: ${savedUser.firstName}`);
    console.log(`✅ Last Name: ${savedUser.lastName}`);
    console.log(`✅ Email: ${savedUser.email}`);
    console.log(`✅ Role: ${savedUser.role}`);
    console.log(`✅ Region: ${savedUser.region}`);
    console.log(`✅ Station: ${savedUser.station}`);
    console.log(`✅ isActive: ${savedUser.isActive}`);
    console.log(`✅ Password Hash: ${savedUser.password ? 'Saved (' + savedUser.password.length + ' chars)' : 'MISSING!'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test password comparison using User model method
    console.log('🔍 Testing Password Comparison...');
    const isMatch = await savedUser.comparePassword(password);
    console.log(`   Password: ${password}`);
    console.log(`   Match Result: ${isMatch ? '✅ TRUE' : '❌ FALSE'}\n`);

    if (!isMatch) {
      console.log('⚠️  WARNING: Password comparison failed!\n');
    } else {
      console.log('✅ Password comparison successful!\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 YOU CAN NOW LOGIN!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 URL: http://localhost:5173/`);
    console.log(`👮 Police ID: ${admin.policeId}`);
    console.log(`🔑 Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check MONGODB_URI in .env file');
    console.error('   2. Check internet connection');
    console.error('   3. Run: npm install bcryptjs');
    process.exit(1);
  }
};

createFreshAdmin();