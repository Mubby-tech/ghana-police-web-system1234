const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');

    // Check if user exists
    const existingUser = await User.findOne({ policeId: 'GPS-12345' });
    if (existingUser) {
      console.log('⚠️ User already exists');
      process.exit(0);
    }

    // Create test user
    const user = await User.create({
      policeId: 'GPS-12345',
      firstName: 'Rexford',
      lastName: 'Sethashley',
      email: 'rexford@gps.gov.gh',
      password: 'password123',
      role: 'cid',
      region: 'Greater Accra',
      station: 'CID Headquarters'
    });

    console.log('✅ Test user created:', user.policeId);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedUser();