const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Access token: short(ish) lived, sent on every request.
// Refresh token: long lived, only used to mint a fresh access token
// when the old one expires (no re-login needed).
const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '180d';

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
}

function signRefreshToken(payload) {
  return jwt.sign({ ...payload, type: 'refresh' }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function createGuestPayload() {
  return {
    id: `guest_${crypto.randomUUID()}`,
    role: 'guest',
    name: 'భక్తుడు',
  };
}

function authResponse(token, user, refreshToken) {
  return {
    token,
    refreshToken,
    user: {
      ...user,
      logged_in: true,
    },
  };
}

module.exports = {
  signToken,
  signRefreshToken,
  verifyToken,
  createGuestPayload,
  authResponse,
};
