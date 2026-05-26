const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({});
    console.log('Users:');
    users.forEach(u => {
      console.log(`ID: ${u._id}, Name: ${u.displayName}, Email: ${u.email}, Role: ${u.role}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
