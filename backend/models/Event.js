const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  prasanga: { type: String, trim: true, default: '' }, // Specific to Yakshagana/Nataka
  troupe: { type: String, trim: true, default: '' },
  category: { 
    type: String, 
    required: true, 
    enum: ['Yakshagana', 'Nema/Kola', 'Kambala', 'Nataka', 'Dance', 'Temple Annual Fair', 'Other Events'],
    default: 'Yakshagana'
  },
  date: { type: String, required: true }, // This will be the Start Date
  endDate: { type: String, default: '' }, // For multi-day events
  time: { type: String, required: true },
  location: { type: String, required: true, trim: true },
  googleMapsLink: { type: String, default: '' },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  description: { type: String, default: '' },
  posterUrls: [{ type: String }],
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'deleted'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  deletionReason: { type: String, default: '' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedByName: { type: String, default: '' },
  actionedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actionedByName: { type: String, default: '' },
  views: { type: Number, default: 0 },
  organizerPhone: { type: String, default: '' },
  organizerEmail: { type: String, default: '' },
  whatsappReminders: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    phone: { type: String, required: true },
    sent1h: { type: Boolean, default: false }
  }]
}, { timestamps: true });

// Index for common queries
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ date: 1 });

module.exports = mongoose.model('Event', eventSchema);
