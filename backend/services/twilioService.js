// Twilio WhatsApp messaging service
const axios = require('axios');

async function sendWhatsAppReminder(phone, event) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // Twilio sandbox number default

  // Clean and format phone number (ensure country code e.g. +91)
  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  if (!cleanPhone.startsWith('+')) {
    if (cleanPhone.length === 10) {
      cleanPhone = '+91' + cleanPhone; // Fallback default to India
    } else {
      cleanPhone = '+' + cleanPhone;
    }
  }

  const messageText = `🎭 *Aisira Start Alert!* 🎭\n\n*${event.prasanga}*\n🎪 Troupe: ${event.troupe || 'N/A'}\n🕒 Time: ${event.time}\n📍 Location: ${event.location}\n\nJoin us and enjoy the performance! Shared via Aisira.`;

  // Fallback: If twilio keys are not configured, output beautifully to the console log.
  if (!accountSid || !authToken) {
    console.log('\n--- 📲 TWILIO MOCKED WHATSAPP ALERTS SERVICE ---');
    console.log(`To: whatsapp:${cleanPhone}`);
    console.log(`From: ${fromWhatsApp}`);
    console.log(`Content:\n${messageText}`);
    console.log('-------------------------------------------------\n');
    return { success: true, mocked: true };
  }

  // Live Twilio API Request
  try {
    const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const params = new URLSearchParams();
    params.append('To', `whatsapp:${cleanPhone}`);
    params.append('From', fromWhatsApp);
    params.append('Body', messageText);

    const res = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      params,
      {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log(`✅ PWA: WhatsApp reminder sent successfully to ${cleanPhone} (SID: ${res.data.sid})`);
    return { success: true, sid: res.data.sid };
  } catch (err) {
    console.error(`❌ PWA: Twilio WhatsApp sending failed to ${cleanPhone}:`, err.response ? err.response.data : err.message);
    throw err;
  }
}

module.exports = { sendWhatsAppReminder };
