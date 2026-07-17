const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const {
  signToken,
  signRefreshToken,
  verifyToken,
  createGuestPayload,
  authResponse,
} = require('../utils/tokenUtils');

// Builds the { token, refreshToken } pair from a JWT payload.
function issueTokens(payload) {
  return {
    token: signToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

exports.signup = catchAsync(async (req, res) => {
  const { name, username, password } = req.body;

  if (!username?.trim()) {
    throw new AppError('Username is required', 400, 'BAD_REQUEST');
  }
  if (!password || password.length < 4) {
    throw new AppError('Password must be at least 4 characters', 400, 'BAD_REQUEST');
  }

  const normalizedUsername = username.trim().toLowerCase();
  const existing = await User.findOne({ username: normalizedUsername });
  if (existing) {
    throw new AppError('Username already taken', 409, 'USERNAME_TAKEN');
  }

  const user = await User.create({
    name: name?.trim() || username.trim(),
    username: normalizedUsername,
    password,
    role: 'user',
    last_login_at: new Date(),
  });

  const { token, refreshToken } = issueTokens({ id: user._id.toString(), role: user.role });
  res.status(201).json(authResponse(token, user.toPublicJSON(), refreshToken));
});

exports.login = catchAsync(async (req, res) => {
  const { username, password } = req.body;

  if (!username?.trim() || !password) {
    throw new AppError('Username and password are required', 400, 'BAD_REQUEST');
  }

  const user = await User.findOne({ username: username.trim().toLowerCase() }).select('+password');
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    throw new AppError('Wrong password', 401, 'WRONG_PASSWORD');
  }

  user.last_login_at = new Date();
  await user.save({ validateBeforeSave: false });

  const { token, refreshToken } = issueTokens({ id: user._id.toString(), role: user.role });
  res.json(authResponse(token, user.toPublicJSON(), refreshToken));
});

exports.adminLogin = catchAsync(async (req, res) => {
  const { username, password } = req.body;

  if (!username?.trim() || !password) {
    throw new AppError('Username and password are required', 400, 'BAD_REQUEST');
  }

  const user = await User.findOne({
    username: username.trim().toLowerCase(),
    role: 'admin',
  }).select('+password');

  if (!user) {
    throw new AppError('Invalid admin credentials', 401, 'INVALID_CREDENTIALS');
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    throw new AppError('Invalid admin credentials', 401, 'INVALID_CREDENTIALS');
  }

  const { token, refreshToken } = issueTokens({ id: user._id.toString(), role: 'admin' });
  res.json(authResponse(token, user.toPublicJSON(), refreshToken));
});

exports.guestLogin = catchAsync(async (req, res) => {
  const guest = createGuestPayload();
  const { token, refreshToken } = issueTokens(guest);
  res.json(authResponse(token, {
    role: guest.role,
    name: guest.name,
    username: null,
  }, refreshToken));
});

// Exchanges a valid refresh token for a fresh access + refresh token pair.
// This lets clients stay logged in indefinitely without hitting the login
// screen, as long as they refresh before the 6-month refresh token expires.
exports.refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400, 'BAD_REQUEST');
  }

  let decoded;
  try {
    decoded = verifyToken(refreshToken);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  if (decoded.type !== 'refresh') {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  // Guests aren't backed by a DB record — just re-mint from the payload.
  if (decoded.role === 'guest') {
    const guestPayload = { id: decoded.id, role: 'guest', name: decoded.name };
    const { token, refreshToken: newRefresh } = issueTokens(guestPayload);
    return res.json(authResponse(token, {
      role: 'guest',
      name: decoded.name,
      username: null,
    }, newRefresh));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('User no longer exists', 401, 'INVALID_REFRESH_TOKEN');
  }

  const { token, refreshToken: newRefresh } = issueTokens({
    id: user._id.toString(),
    role: user.role,
  });
  res.json(authResponse(token, user.toPublicJSON(), newRefresh));
});

exports.me = catchAsync(async (req, res) => {
  res.json(req.user);
});

exports.logout = catchAsync(async (req, res) => {
  res.json({ ok: true });
});

exports.changePassword = catchAsync(async (req, res) => {
  const { username, current_password, new_password } = req.body;

  if (!username?.trim() || !current_password || !new_password) {
    throw new AppError('Username, current password, and new password are required', 400, 'BAD_REQUEST');
  }
  if (new_password.length < 4) {
    throw new AppError('New password must be at least 4 characters', 400, 'BAD_REQUEST');
  }

  const user = await User.findOne({ username: username.trim().toLowerCase(), role: 'user' }).select('+password');
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  const valid = await user.comparePassword(current_password);
  if (!valid) {
    throw new AppError('Current password is incorrect', 401, 'WRONG_PASSWORD');
  }

  user.password = new_password;
  await user.save();
  res.json({ ok: true });
});
