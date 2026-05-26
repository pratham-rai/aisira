const cron = require('node-cron');
const User = require('../models/User');
const Event = require('../models/Event');
const { sendMail } = require('./emailService');
const { sendWhatsAppReminder } = require('./twilioService');

const startScheduler = () => {
  // Run every 15 minutes for better precision (especially for the 1h reminder)
  cron.schedule('*/15 * * * *', async () => {
    console.log('⏰ Running Reminder Scheduler (12h & 1h checks)...');
    try {
      const now = new Date();
      const threshold12h = new Date(now.getTime() + 12 * 60 * 60 * 1000);
      const threshold1h = new Date(now.getTime() + 1 * 60 * 60 * 1000);

      // Find users with reminders
      const users = await User.find({ reminders: { $exists: true, $not: { $size: 0 } } }).populate('reminders');

      for (const user of users) {
        let updated = false;
        for (const event of user.reminders) {
          const eventDate = new Date(`${event.date}T${event.time}:00+05:30`);
          
          // Skip if event has already started
          if (eventDate <= now) continue;

          // 1. Check for 1h Reminder (Highest priority)
          if (eventDate <= threshold1h && !user.sentReminders1h.some(id => id.equals(event._id))) {
            console.log(`📧 Sending 1h reminder to ${user.email} for ${event.prasanga}`);
            await sendReminderEmail(user, event, "Starting in 1 hour! 🎭");
            user.sentReminders1h.push(event._id);
            updated = true;
          } 
          // 2. Check for 12h Reminder
          else if (eventDate <= threshold12h && !user.sentReminders12h.some(id => id.equals(event._id))) {
            console.log(`📧 Sending 12h reminder to ${user.email} for ${event.prasanga}`);
            await sendReminderEmail(user, event, "Starting in 12 hours ⏳");
            user.sentReminders12h.push(event._id);
            updated = true;
          }
        }
        if (updated) await user.save();
      }

      // 3. Check for 1h WhatsApp Reminders (approved events)
      const upcomingEvents = await Event.find({
        status: 'approved',
        whatsappReminders: { $exists: true, $not: { $size: 0 } }
      });

      for (const event of upcomingEvents) {
        const eventDate = new Date(`${event.date}T${event.time}:00+05:30`);
        if (eventDate > now && eventDate <= threshold1h) {
          let eventUpdated = false;
          for (const rem of event.whatsappReminders) {
            if (!rem.sent1h) {
              console.log(`📱 Sending 1h WhatsApp reminder to ${rem.phone} for ${event.prasanga}...`);
              try {
                await sendWhatsAppReminder(rem.phone, event);
                rem.sent1h = true;
                eventUpdated = true;
              } catch (e) {
                console.error(`❌ Failed to send WhatsApp reminder to ${rem.phone}:`, e.message);
              }
            }
          }
          if (eventUpdated) await event.save();
        }
      }
    } catch (err) {
      console.error('❌ Scheduler Error:', err);
    }
  });
  
  // Cleanup deleted events (permanently delete after 7 days)
  cron.schedule('0 0 * * *', async () => {
    console.log('🧹 Running Cleanup: Permanently deleting events marked "deleted" for >7 days...');
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = await Event.deleteMany({
        status: 'deleted',
        updatedAt: { $lte: sevenDaysAgo }
      });
      console.log(`✅ Permanently deleted ${result.deletedCount} old events.`);
    } catch (err) {
      console.error('❌ Cleanup Error:', err);
    }
  });

  // Cleanup past events (permanently delete approved events after 30 days)
  cron.schedule('0 1 * * *', async () => {
    console.log('🧹 Running Cleanup: Permanently deleting approved events older than 30 days...');
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // We compare against the 'date' field (YYYY-MM-DD)
      const dateString = thirtyDaysAgo.toISOString().split('T')[0];

      const result = await Event.deleteMany({
        status: 'approved',
        date: { $lt: dateString }
      });
      console.log(`✅ Permanently deleted ${result.deletedCount} past events.`);
    } catch (err) {
      console.error('❌ Past Events Cleanup Error:', err);
    }
  });
  
  console.log('✅ Background Scheduler Initialized (15m interval, 12h/1h dual-alerts)');


};

async function sendReminderEmail(user, event, timeLabel) {
  return sendMail({
    to: user.email,
    subject: `🔔 Reminder: ${event.prasanga} is ${timeLabel}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px;color:#333;border:1px solid #ddd">
        <div style="text-align:center;margin-bottom:20px">
          <span style="font-size:40px">🎭</span>
          <h2 style="color:#E8751A;margin:10px 0">${timeLabel}</h2>
        </div>
        <p>Hi <strong>${user.displayName}</strong>,</p>
        <p>This is a reminder for the Yakshagana event you saved on Aisira.</p>
        <div style="background:#fff;padding:20px;border-radius:8px;border-left:4px solid #E8751A;margin:20px 0;box-shadow:0 2px 4px rgba(0,0,0,0.05)">
          <h3 style="margin-top:0;color:#1a1a2e">${event.prasanga}</h3>
          <p style="margin:8px 0"><strong>🎪 Troupe:</strong> ${event.troupe || 'N/A'}</p>
          <p style="margin:8px 0"><strong>📅 Date:</strong> ${event.date}</p>
          <p style="margin:8px 0"><strong>🕒 Time:</strong> ${event.time}</p>
          <p style="margin:8px 0"><strong>📍 Location:</strong> ${event.location}</p>
        </div>
        <p style="text-align:center"><a href="https://Aisira-8bca2.web.app/#/event/${event._id}" style="color:#E8751A;font-weight:bold;text-decoration:none">View Event Details →</a></p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="font-size:12px;color:#888;text-align:center">You received this because you set a reminder on Aisira.</p>
      </div>
    `
  });
}

module.exports = { startScheduler };
