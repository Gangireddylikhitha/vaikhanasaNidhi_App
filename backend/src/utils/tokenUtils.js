const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
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

function authResponse(token, user) {
  return {
    token,
    user: {
      ...user,
      logged_in: true,
    },
  };
}

module.exports = {
  signToken,
  verifyToken,
  createGuestPayload,
  authResponse,
};
