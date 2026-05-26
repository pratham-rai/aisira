const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('./models/Event');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const events = await Event.find({});
    console.log('Total Events:', events.length);
    events.forEach(e => {
      console.log(`Event: ${e.prasanga}, Status: ${e.status}, SubmittedBy: ${e.submittedBy}, SubmittedByName: ${e.submittedByName}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
