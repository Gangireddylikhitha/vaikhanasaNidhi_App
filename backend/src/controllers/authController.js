const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { signToken, createGuestPayload, authResponse } = require('../utils/tokenUtils');

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

  const token = signToken({ id: user._id.toString(), role: user.role });
  res.status(201).json(authResponse(token, user.toPublicJSON()));
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

  const token = signToken({ id: user._id.toString(), role: user.role });
  res.json(authResponse(token, user.toPublicJSON()));
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

  const token = signToken({ id: user._id.toString(), role: 'admin' });
  res.json(authResponse(token, user.toPublicJSON()));
});

exports.guestLogin = catchAsync(async (req, res) => {
  const guest = createGuestPayload();
  const token = signToken(guest);
  res.json(authResponse(token, {
    role: guest.role,
    name: guest.name,
    username: null,
  }));
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
