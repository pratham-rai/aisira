const express = require('express');
const Event = require('../models/Event');
const { auth, optionalAuth, adminOnly, masterAdminOnly } = require('../middleware/auth');
const { sendNotification } = require('../services/emailService');
const User = require('../models/User');


const router = express.Router();

// Helper to check if event is past 12h cutoff
function isPastEvent(e) {
  if (!e.date || !e.time) return false;
  // Use endDate if available, otherwise use startDate
  const dateToUse = e.endDate || e.date;
  const eventDate = new Date(`${dateToUse}T${e.time}:00+05:30`);
  // 6 hour buffer after the start/end time
  const cutoffTime = new Date(eventDate.getTime() + 6 * 60 * 60 * 1000);
  return new Date() > cutoffTime;
}

// GET /api/events — approved events (public)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ status: 'approved' }).sort({ date: 1, time: 1 });
    const upcomingEvents = events.filter(e => !isPastEvent(e));
    res.json(upcomingEvents.map(formatEvent));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/past — past approved events (master admin only)
router.get('/past', auth, masterAdminOnly, async (req, res) => {
  try {
    const events = await Event.find({ status: 'approved' }).sort({ date: -1 });
    const pastEvents = events.filter(e => isPastEvent(e));
    res.json(pastEvents.map(formatEvent));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/deleted — deleted events (master admin only)
router.get('/deleted', auth, masterAdminOnly, async (req, res) => {
  try {
    const events = await Event.find({ status: 'deleted' }).sort({ updatedAt: -1 });
    const upcomingDeletedEvents = events.filter(e => !isPastEvent(e));
    res.json(upcomingDeletedEvents.map(formatEvent));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /api/events/all — all events (admin only)

router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { status } : {};
    const events = await Event.find(filter).sort({ date: 1, time: 1 });
    const upcomingEvents = events.filter(e => !isPastEvent(e));
    res.json(upcomingEvents.map(formatEvent));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/stats — stats for leaderboard (master admin only)
router.get('/stats', auth, masterAdminOnly, async (req, res) => {
  try {
    const actionStats = await Event.aggregate([
      { $match: { actionedBy: { $ne: null } } },
      { $group: {
          _id: "$actionedBy",
          approvedCount: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
          rejectedCount: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } }
      }},
      { $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
      }},
      { $unwind: "$user" },
      { $project: {
          _id: 1,
          approvedCount: 1,
          rejectedCount: 1,
          name: "$user.displayName"
      }}
    ]);

    const submissionStats = await Event.aggregate([
      { $group: {
          _id: "$submittedBy",
          submissionCount: { $sum: 1 }
      }},
      { $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
      }},
      { $unwind: "$user" },
      { $project: {
          _id: 1,
          submissionCount: 1,
          name: "$user.displayName"
      }}
    ]);

    res.json({ actionStats, submissionStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/events — create event (logged in only)
router.post('/', auth, async (req, res) => {
  try {
    const { prasanga, troupe, category, date, endDate, time, location, googleMapsLink, latitude, longitude, description, posterUrls, organizerPhone, organizerEmail } = req.body;
    if (!prasanga || !date || !time || !location) {
      return res.status(400).json({ error: 'Prasanga, date, time, and location are required' });
    }

    const event = await Event.create({
      prasanga, troupe, category, date, endDate, time, location,
      googleMapsLink: googleMapsLink || '',
      latitude: latitude || null,
      longitude: longitude || null,
      description: description || '',
      posterUrls: posterUrls || [],
      status: 'pending',
      submittedBy: req.user._id,
      submittedByName: req.user.displayName,
      organizerPhone: organizerPhone || '',
      organizerEmail: organizerEmail || '',
    });

    res.status(201).json(formatEvent(event));

    // Send notification
    sendNotification(req.user, event, 'submitted');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// GET /api/events/:id — single event (public)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(formatEvent(event));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/events/:id/view — increment view count
router.post('/:id/view', async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// PATCH /api/events/:id — update event (admin or owner if unapproved)
router.patch('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);


    if (!event) return res.status(404).json({ error: 'Event not found' });

    const isAdmin = req.user.role === 'admin' || req.user.role === 'masterAdmin';
    const isOwner = event.submittedBy && event.submittedBy.equals(req.user._id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    if (event.status === 'deleted') {
      return res.status(403).json({ error: 'Deleted events cannot be edited.' });
    }

    if (!isAdmin && event.status === 'approved') {
      return res.status(403).json({ error: 'Approved events can only be edited by admins. Please contact an admin.' });
    }


    const originalStatus = event.status;

    // Update fields
    Object.assign(event, req.body);
    
    // If it was rejected, move it back to pending for re-review
    if (originalStatus === 'rejected') {
      event.status = 'pending';
      event.rejectionReason = '';
      // Trigger a new submission email for the resubmission
      sendNotification(req.user, event, 'submitted').catch(err => console.error('Failed to send resubmission email:', err));
    }



    await event.save();
    res.json(formatEvent(event));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/events/:id/approve — approve event (admin only)
router.post('/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { 


      status: 'approved',
      actionedBy: req.user._id,
      actionedByName: req.user.displayName
    }, { new: true }).populate('submittedBy');
    
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(formatEvent(event));

    // Send notification to owner
    if (event.submittedBy) {
      sendNotification(event.submittedBy, event, 'approved').catch(err => console.error('Failed to send approval email:', err));
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/events/:id/reject — reject event (admin only)
router.post('/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const event = await Event.findByIdAndUpdate(req.params.id, {


      status: 'rejected', 
      rejectionReason: reason || '',
      actionedBy: req.user._id,
      actionedByName: req.user.displayName
    }, { new: true }).populate('submittedBy');
    
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(formatEvent(event));

    // Send notification to owner
    if (event.submittedBy) {
      sendNotification(event.submittedBy, event, 'rejected', reason).catch(err => console.error('Failed to send rejection email:', err));
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/events/:id/pending — revert event to pending (admin only)
router.post('/:id/pending', auth, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, {


      status: 'pending', 
      rejectionReason: '',
      actionedBy: null,
      actionedByName: ''
    }, { new: true }).populate('submittedBy');
    
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(formatEvent(event));

    // Send notification to owner
    if (event.submittedBy) {
      sendNotification(event.submittedBy, event, 'pending').catch(err => console.error('Failed to send revert email:', err));
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/events/:id/delete — soft delete event (master admin only)
router.post('/:id/delete', auth, masterAdminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const event = await Event.findByIdAndUpdate(req.params.id, {


      status: 'deleted',
      deletionReason: reason || '',
      actionedBy: req.user._id,
      actionedByName: req.user.displayName
    }, { new: true }).populate('submittedBy');
    
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(formatEvent(event));

    // Send notification to owner
    if (event.submittedBy) {
      sendNotification(event.submittedBy, event, 'deleted', reason).catch(err => console.error('Failed to send deletion email:', err));
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// POST /api/events/resolve-map-link — resolve google maps link to coordinates
router.post('/resolve-map-link', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const response = await fetch(url, { method: 'GET', redirect: 'follow' });
    const finalUrl = response.url;
    
    let lat = null;
    let lng = null;

    // Pattern 1: !3d and !4d (Exact Pin Marker - most accurate)
    const pinMatch = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (pinMatch) {
      lat = parseFloat(pinMatch[1]);
      lng = parseFloat(pinMatch[2]);
    } else {
      // Pattern 2: @lat,lng (Viewport Center - less accurate but good fallback)
      const atMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        lat = parseFloat(atMatch[1]);
        lng = parseFloat(atMatch[2]);
      } else {
        // Pattern 3: ?q=lat,lng
        const qMatch = finalUrl.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (qMatch) {
          lat = parseFloat(qMatch[1]);
          lng = parseFloat(qMatch[2]);
        } else {
          // Pattern 4: HTML fallback
          const html = await response.text();
          const coordsMatch = html.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (coordsMatch) {
            lat = parseFloat(coordsMatch[1]);
            lng = parseFloat(coordsMatch[2]);
          }
        }
      }
    }

    if (lat !== null && lng !== null) {
      res.json({ lat, lng });
    } else {
      res.status(404).json({ error: 'Could not extract coordinates from the provided link' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve link: ' + err.message });
  }
});

// POST /api/events/:id/whatsapp-reminder — add WhatsApp reminder (logged in only)
router.post('/:id/whatsapp-reminder', auth, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Check if user already opted in for this event
    const exists = event.whatsappReminders.some(r => r.userId && r.userId.equals(req.user._id));
    if (exists) {
      return res.status(400).json({ error: 'You have already scheduled a WhatsApp reminder for this event' });
    }

    event.whatsappReminders.push({
      userId: req.user._id,
      phone,
      sent1h: false
    });

    await event.save();
    res.json({ success: true, message: 'WhatsApp reminder scheduled successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function formatEvent(e) {
  return {
    id: e._id,
    prasanga: e.prasanga,
    troupe: e.troupe,
    category: e.category,
    date: e.date,
    endDate: e.endDate,
    time: e.time,
    location: e.location,
    googleMapsLink: e.googleMapsLink,
    latitude: e.latitude,
    longitude: e.longitude,
    description: e.description,
    posterUrls: e.posterUrls,
    status: e.status,
    rejectionReason: e.rejectionReason,
    deletionReason: e.deletionReason,
    submittedBy: e.submittedBy,

    submittedByName: e.submittedByName,
    actionedBy: e.actionedBy,
    actionedByName: e.actionedByName,
    submittedAt: e.createdAt,
    updatedAt: e.updatedAt,
    views: e.views || 0,
    organizerPhone: e.organizerPhone || '',
    organizerEmail: e.organizerEmail || '',
  };
}

module.exports = router;
