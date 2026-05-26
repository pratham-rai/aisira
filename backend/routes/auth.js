const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../services/emailService');
const User = require('../models/User');
const { auth, adminOnly, masterAdminOnly } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const router = express.Router();

function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function userResponse(user, token) {
  return {
    token,
    user: {
      uid: user._id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      reminders: user.reminders || [],
    },
  };
}

function generateResetCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const verificationCode = generateResetCode();

    const user = await User.create({ 
      email: email.toLowerCase(), 
      password: hashed, 
      displayName,
      verificationCode
    });

    // Send verification email
    await sendMail({
      to: user.email,
      subject: '🎭 Welcome to Aisira — Verify your email',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#1a1a2e;color:#eee;border-radius:12px">
          <div style="text-align:center;margin-bottom:24px">
            <div style="font-size:48px">🎭</div>
            <h2 style="color:#F4A623;margin:8px 0">Aisira</h2>
          </div>
          <p>Hi <strong>${user.displayName}</strong>,</p>
          <p>Welcome to Aisira! Please use the code below to verify your email address:</p>
          <div style="text-align:center;margin:24px 0">
            <div style="display:inline-block;background:#E8751A;color:#fff;font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px 32px;border-radius:8px">${verificationCode}</div>
          </div>
          <p style="color:#999;font-size:14px">Once verified, you can start saving events and setting reminders.</p>
          <hr style="border:1px solid #333;margin:24px 0">
          <p style="color:#666;font-size:12px;text-align:center">Aisira — The Digital Treasure of Yakshagana Events</p>
        </div>
      `,
    });

    res.status(201).json({ message: 'Verification code sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid email or password' });

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email to log in.', needsVerification: true });
    }

    const token = generateToken(user);
    res.json(userResponse(user, token));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password — send reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If this email is registered, a reset code has been sent.' });
    }

    // Block master admin
    if (user.role === 'masterAdmin') {
      return res.status(403).json({ error: 'Master Admin password cannot be reset this way. Contact the system administrator.' });
    }

    const code = generateResetCode();
    user.resetCode = code;
    user.resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Send email
    await sendMail({
      to: user.email,
      subject: '🎭 Aisira — Password Reset Code',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#1a1a2e;color:#eee;border-radius:12px">
          <div style="text-align:center;margin-bottom:24px">
            <div style="font-size:48px">🎭</div>
            <h2 style="color:#F4A623;margin:8px 0">Aisira</h2>
          </div>
          <p>Hi <strong>${user.displayName}</strong>,</p>
          <p>You requested a password reset. Use this code:</p>
          <div style="text-align:center;margin:24px 0">
            <div style="display:inline-block;background:#E8751A;color:#fff;font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px 32px;border-radius:8px">${code}</div>
          </div>
          <p style="color:#999;font-size:14px">This code expires in <strong>15 minutes</strong>.</p>
          <p style="color:#999;font-size:14px">If you didn't request this, ignore this email.</p>
          <hr style="border:1px solid #333;margin:24px 0">
          <p style="color:#666;font-size:12px;text-align:center">Aisira — The Digital Treasure of Yakshagana Events</p>
        </div>
      `,
    });
    console.log(`🔑 Reset code logic executed for ${user.email}`);

    res.json({ message: 'If this email is registered, a reset code has been sent.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password — verify code & set new password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Invalid email or code' });
    if (user.role === 'masterAdmin') return res.status(403).json({ error: 'Cannot reset Master Admin password' });

    if (!user.resetCode || user.resetCode !== code) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }
    if (!user.resetCodeExpiry || new Date() > user.resetCodeExpiry) {
      return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = null;
    user.resetCodeExpiry = null;
    await user.save();

    console.log(`✅ Password reset for ${user.email}`);
    res.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        email: email.toLowerCase(),
        displayName: name,
        isVerified: true, // Google users are verified
        password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
      });
    } else if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const token = generateToken(user);
    res.json(userResponse(user, token));
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(400).json({ error: 'Google authentication failed' });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.verificationCode !== code) return res.status(400).json({ error: 'Invalid verification code' });

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    const token = generateToken(user);
    res.json(userResponse(user, token));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'Account already verified' });

    const code = generateResetCode();
    user.verificationCode = code;
    await user.save();

    await sendMail({
      to: user.email,
      subject: '🎭 Aisira — Your New Verification Code',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#1a1a2e;color:#eee;border-radius:12px">
          <div style="text-align:center;margin-bottom:24px">
            <div style="font-size:48px">🎭</div>
            <h2 style="color:#F4A623;margin:8px 0">Aisira</h2>
          </div>
          <p>Use the code below to verify your email address:</p>
          <div style="text-align:center;margin:24px 0">
            <div style="display:inline-block;background:#E8751A;color:#fff;font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px 32px;border-radius:8px">${code}</div>
          </div>
          <hr style="border:1px solid #333;margin:24px 0">
          <p style="color:#666;font-size:12px;text-align:center">Aisira — The Digital Treasure of Yakshagana Events</p>
        </div>
      `,
    });

    res.json({ message: 'Verification code resent.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  res.json({
    uid: req.user._id,
    email: req.user.email,
    displayName: req.user.displayName,
    role: req.user.role,
    reminders: req.user.reminders || [],
  });
});

// POST /api/auth/reminders/:eventId — toggle event reminder
router.post('/reminders/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const user = await User.findById(req.user._id);
    
    const index = user.reminders.indexOf(eventId);
    if (index > -1) {
      user.reminders.splice(index, 1);
    } else {
      user.reminders.push(eventId);
    }
    
    await user.save();
    res.json({ reminders: user.reminders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/users — list all users (master admin only)
router.get('/users', auth, masterAdminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users.map(u => ({
      uid: u._id,
      email: u.email,
      displayName: u.displayName,
      role: u.role,
      createdAt: u.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/users/:uid/role — toggle admin role (master admin only)
router.patch('/users/:uid/role', auth, masterAdminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'masterAdmin') return res.status(400).json({ error: 'Cannot change Master Admin role' });
    if (user._id.equals(req.user._id)) return res.status(400).json({ error: 'Cannot change your own role' });

    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();
    res.json({ uid: user._id, email: user.email, displayName: user.displayName, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// POST /api/auth/change-password — change own password (all roles)
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    console.log(`🔐 Password changed for ${user.email}`);
    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
