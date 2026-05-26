const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({});
    console.log('Users:', users.map(u => ({ email: u.email, role: u.role })));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
