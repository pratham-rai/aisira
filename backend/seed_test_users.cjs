const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

async function seedTestUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const hashed = await bcrypt.hash('admin123', 10);

    // Master Admin
    await User.findOneAndUpdate(
      { email: 'master@yakshanidhi.com' },
      {
        email: 'master@yakshanidhi.com',
        password: hashed,
        displayName: 'Master Admin',
        role: 'masterAdmin',
        isVerified: true
      },
      { upsert: true, new: true }
    );
    console.log('Master Admin seeded: master@yakshanidhi.com / admin123');

    // Regular Admin
    await User.findOneAndUpdate(
      { email: 'admin@test.com' },
      {
        email: 'admin@test.com',
        password: hashed,
        displayName: 'Test Admin',
        role: 'admin',
        isVerified: true
      },
      { upsert: true, new: true }
    );
    console.log('Regular Admin seeded: admin@test.com / admin123');

    // Normal User
    await User.findOneAndUpdate(
      { email: 'user@test.com' },
      {
        email: 'user@test.com',
        password: hashed,
        displayName: 'Test User',
        role: 'user',
        isVerified: true
      },
      { upsert: true, new: true }
    );
    console.log('Normal User seeded: user@test.com / admin123');

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding users:', err);
  }
}

seedTestUsers();
