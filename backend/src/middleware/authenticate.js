const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/tokenUtils');
const User = require('../models/user.model');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    if (decoded.role === 'guest') {
      req.user = {
        id: decoded.id,
        role: 'guest',
        name: decoded.name || 'భక్తుడు',
        logged_in: true,
      };
      return next();
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User no longer exists', 401, 'UNAUTHORIZED');
    }

    req.user = user.toPublicJSON();
    req.user.id = user._id.toString();
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
    }
    next(err);
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return next(new AppError('Admin access required', 403, 'FORBIDDEN'));
  }
  next();
}

function requireRegisteredUser(req, res, next) {
  if (req.user?.role === 'guest') {
    return next(new AppError('Registered account required', 403, 'FORBIDDEN'));
  }
  if (!req.user?.id || String(req.user.id).startsWith('guest_')) {
    return next(new AppError('Registered account required', 403, 'FORBIDDEN'));
  }
  next();
}

module.exports = { authenticate, requireAdmin, requireRegisteredUser };
