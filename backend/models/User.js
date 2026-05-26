const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  displayName: { type: String, required: true, trim: true },
  role: { type: String, enum: ['user', 'admin', 'masterAdmin'], default: 'user' },
  resetCode: { type: String, default: null },
  resetCodeExpiry: { type: Date, default: null },
  reminders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  sentReminders12h: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  sentReminders1h: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
