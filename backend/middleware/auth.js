const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and attach user to req
async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Optional auth — sets req.user if token present, otherwise continues
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    User.findById(decoded.id).select('-password').then(user => {
      req.user = user;
      next();
    }).catch(() => next());
  } catch {
    next();
  }
}

// Require admin or masterAdmin role
function adminOnly(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'masterAdmin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Require masterAdmin role
function masterAdminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'masterAdmin') {
    return res.status(403).json({ error: 'Master Admin access required' });
  }
  next();
}

module.exports = { auth, optionalAuth, adminOnly, masterAdminOnly };
