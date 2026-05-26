const nodemailer = require('nodemailer');

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const sendMail = async (options) => {
  if (!transporter) {
    console.log(`📡 [Email Simulation] To: ${options.to} | Subject: ${options.subject}`);
    return;
  }
  return transporter.sendMail({
    from: `"Aisira" <${process.env.SMTP_USER}>`,
    ...options
  });
};


const sendNotification = async (user, event, type, reason = '') => {
  if (!user || !user.email) return;

  const themes = {
    submitted: { icon: '📤', title: 'Event Submitted', msg: 'Your event has been submitted and is pending review.' },
    approved: { icon: '✅', title: 'Event Approved!', msg: 'Great news! Your event has been approved and is now live on Aisira.' },
    rejected: { icon: '❌', title: 'Event Rejected', msg: `Your submission was not approved. Reason: ${reason}` },
    pending: { icon: '⏳', title: 'Event Reverted to Pending', msg: 'An administrator has moved your event back to the pending state for further review.' },
    deleted: { icon: '🗑️', title: 'Event Deleted', msg: `Your event was removed by a Master Admin. Reason: ${reason}` }
  };

  const theme = themes[type];
  if (!theme) return;

  try {
    const result = await sendMail({
      to: user.email,
      subject: `🎭 Aisira — ${theme.title}: ${event.prasanga}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#1a1a2e;color:#eee;border-radius:12px">
          <div style="text-align:center;margin-bottom:24px">
            <div style="font-size:48px">${theme.icon}</div>
            <h2 style="color:#F4A623;margin:8px 0">${theme.title}</h2>
          </div>
          <p>Hi <strong>${user.displayName}</strong>,</p>
          <div style="background:rgba(255,255,255,0.05);padding:16px;border-radius:8px;margin:20px 0">
            <p style="margin:0;font-weight:bold;color:#F4A623">${event.prasanga}</p>
            <p style="margin:4px 0 0 0;font-size:14px;color:#999">${event.location} | ${event.date}</p>
          </div>
          <p>${theme.msg}</p>
          <div style="text-align:center;margin-top:32px">
            <a href="http://localhost:5173/#/profile/submissions" style="display:inline-block;background:#E8751A;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold">View My Submissions</a>
          </div>
          <hr style="border:1px solid #333;margin:32px 0">
          <p style="color:#666;font-size:12px;text-align:center">Aisira — The Digital Treasure of Yakshagana Events</p>
        </div>
      `
    });
    return result;
  } catch (err) {
    console.error(`❌ SMTP Error sending "${type}" email: ${err.message}`);
  }
};



module.exports = { sendMail, sendNotification, transporter };

