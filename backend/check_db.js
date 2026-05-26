const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('./models/Event');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Event.countDocuments();
    console.log('Event count:', count);
    const events = await Event.find({ status: 'approved' });
    console.log('Approved events:', events.length);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
