const crypto = require('crypto');
const User = require('../models/user.model');
const VerificationApplication = require('../models/verificationApplication.model');
const PasswordResetOtp = require('../models/passwordResetOtp.model');
const { sendOtpEmail } = require('../services/emailService');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const {
  signToken,
  signRefreshToken,
  verifyToken,
  createGuestPayload,
  authResponse,
} = require('../utils/tokenUtils');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
}

// Builds the { token, refreshToken } pair from a JWT payload.
function issueTokens(payload) {
  return {
    token: signToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

/**
 * Finds user by username, email, phone number, or linked WhatsApp in verification.
 */
async function findUserByIdentifier(rawInput, selectPassword = false) {
  if (!rawInput || typeof rawInput !== 'string') return null;

  const clean = rawInput.trim();
  const cleanLower = clean.toLowerCase();
  const digitsOnly = clean.replace(/\D/g, '');

  const orConditions = [
    { username: cleanLower },
    { email: cleanLower },
  ];

  if (digitsOnly.length >= 10) {
    orConditions.push({ phone: digitsOnly });
    orConditions.push({ phone: clean });
  }

  let query = User.findOne({ $or: orConditions });
  if (selectPassword) query = query.select('+password');
  let user = await query;

  if (!user && digitsOnly.length >= 10) {
    const last10 = digitsOnly.slice(-10);
    const app = await VerificationApplication.findOne({
      whatsapp: { $regex: last10 },
    });
    if (app && app.user) {
      let uQuery = User.findById(app.user);
      if (selectPassword) uQuery = uQuery.select('+password');
      user = await uQuery;
    }
  }

  return user;
}

exports.signup = catchAsync(async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!username?.trim()) {
    throw new AppError('Username is required', 400, 'BAD_REQUEST');
  }
  if (!password || password.length < 4) {
    throw new AppError('Password must be at least 4 characters', 400, 'BAD_REQUEST');
  }

  const normalizedUsername = username.trim().toLowerCase();
  const existingUsername = await User.findOne({ username: normalizedUsername });
  if (existingUsername) {
    throw new AppError('Username already taken', 409, 'USERNAME_TAKEN');
  }

  let normalizedEmail;
  if (email && email.trim()) {
    if (!isValidEmail(email)) {
      throw new AppError('Please enter a valid email address', 400, 'INVALID_EMAIL');
    }
    normalizedEmail = email.trim().toLowerCase();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      throw new AppError('Email already registered', 409, 'EMAIL_TAKEN');
    }
  }

  const user = await User.create({
    name: name?.trim() || username.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    role: 'user',
    last_login_at: new Date(),
  });

  const { token, refreshToken } = issueTokens({ id: user._id.toString(), role: user.role });
  res.status(201).json(authResponse(token, user.toPublicJSON(), refreshToken));
});

exports.login = catchAsync(async (req, res) => {
  const { username, identifier, password } = req.body;
  const loginId = (identifier || username || '').trim();

  if (!loginId || !password) {
    throw new AppError('Username/email/phone and password are required', 400, 'BAD_REQUEST');
  }

  const user = await findUserByIdentifier(loginId, true);
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

/**
 * Step 1: Check if user exists by username or phone number.
 */
exports.forgotPasswordLookup = catchAsync(async (req, res) => {
  const { identifier } = req.body;
  const lookupId = (identifier || '').trim();

  if (!lookupId) {
    throw new AppError('Please provide a username or phone number', 400, 'BAD_REQUEST');
  }

  const user = await findUserByIdentifier(lookupId, false);
  if (!user) {
    throw new AppError('No account found with this username or phone number', 404, 'ACCOUNT_NOT_FOUND');
  }

  res.json({
    found: true,
    username: user.username,
    name: user.name,
    hasEmail: Boolean(user.email),
    email: user.email || '',
  });
});

/**
 * Step 2: Send OTP to the user's email.
 */
exports.forgotPasswordSendOtp = catchAsync(async (req, res) => {
  const { identifier, email } = req.body;
  const lookupId = (identifier || '').trim();

  if (!lookupId) {
    throw new AppError('Identifier is required', 400, 'BAD_REQUEST');
  }

  const user = await findUserByIdentifier(lookupId, false);
  if (!user) {
    throw new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND');
  }

  let targetEmail = user.email;

  if (!targetEmail) {
    if (!email || !isValidEmail(email)) {
      throw new AppError('Please provide a valid email address to receive OTP', 400, 'INVALID_EMAIL');
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailOwner = await User.findOne({ email: cleanEmail });
    if (emailOwner && emailOwner._id.toString() !== user._id.toString()) {
      throw new AppError('This email is already associated with another account', 409, 'EMAIL_TAKEN');
    }
    targetEmail = cleanEmail;
  } else if (email && isValidEmail(email) && email.trim().toLowerCase() !== user.email) {
    const cleanEmail = email.trim().toLowerCase();
    const emailOwner = await User.findOne({ email: cleanEmail });
    if (emailOwner && emailOwner._id.toString() !== user._id.toString()) {
      throw new AppError('This email is already associated with another account', 409, 'EMAIL_TAKEN');
    }
    targetEmail = cleanEmail;
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await PasswordResetOtp.deleteMany({ userId: user._id });

  await PasswordResetOtp.create({
    userId: user._id,
    email: targetEmail,
    otp,
    expiresAt,
  });

  await sendOtpEmail({
    to: targetEmail,
    otp,
    username: user.username,
    name: user.name,
  });

  res.json({
    ok: true,
    message: 'OTP has been sent to your email',
    email: targetEmail,
  });
});

/**
 * Step 3: Verify OTP, update password, and save email if not present.
 */
exports.forgotPasswordReset = catchAsync(async (req, res) => {
  const { identifier, email, otp, new_password } = req.body;
  const lookupId = (identifier || '').trim();

  if (!lookupId || !otp || !new_password) {
    throw new AppError('Username/phone, OTP, and new password are required', 400, 'BAD_REQUEST');
  }

  if (new_password.length < 4) {
    throw new AppError('New password must be at least 4 characters', 400, 'BAD_REQUEST');
  }

  const user = await findUserByIdentifier(lookupId, false);
  if (!user) {
    throw new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND');
  }

  const otpRecord = await PasswordResetOtp.findOne({
    userId: user._id,
    otp: String(otp).trim(),
    expiresAt: { $gt: new Date() },
  });

  if (!otpRecord) {
    throw new AppError('Invalid or expired OTP. Please request a new one.', 400, 'INVALID_OTP');
  }

  const verifiedEmail = (email || otpRecord.email || '').trim().toLowerCase();
  if (verifiedEmail && (!user.email || user.email !== verifiedEmail)) {
    user.email = verifiedEmail;
  }

  const digitsOnly = lookupId.replace(/\D/g, '');
  if (digitsOnly.length >= 10 && !user.phone) {
    user.phone = digitsOnly;
  }

  user.password = new_password;
  await user.save();

  await PasswordResetOtp.deleteMany({ userId: user._id });

  res.json({
    ok: true,
    message: 'Password has been reset successfully. Please log in with your new password.',
    username: user.username,
  });
});
