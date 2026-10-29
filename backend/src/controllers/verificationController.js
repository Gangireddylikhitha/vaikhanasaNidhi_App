const User = require('../models/user.model');
const VerificationApplication = require('../models/verificationApplication.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const REQUIRED_FIELDS = [
  'full_name',
  'gothram',
  'kalpasutram',
  'native_place',
  'whatsapp',
];

exports.getMyVerification = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

  const latest = await VerificationApplication.findOne({ user: user._id })
    .sort({ createdAt: -1 });

  res.json({
    verification_status: user.verification_status,
    application: latest ? latest.toPublicJSON() : null,
  });
});

exports.submitVerification = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

  if (user.verification_status === 'pending') {
    throw new AppError('Your verification request is already under review', 409, 'ALREADY_PENDING');
  }
  if (user.verification_status === 'approved') {
    throw new AppError('Your account is already verified', 409, 'ALREADY_APPROVED');
  }

  const body = req.body || {};
  for (const field of REQUIRED_FIELDS) {
    if (!body[field]?.trim()) {
      throw new AppError(`${field.replace(/_/g, ' ')} is required`, 400, 'BAD_REQUEST');
    }
  }

  const phone = body.whatsapp.trim().replace(/\D/g, '');
  if (phone.length < 10) {
    throw new AppError('Phone number must be 10 digits', 400, 'BAD_REQUEST');
  }

  const application = await VerificationApplication.create({
    user: user._id,
    full_name: body.full_name.trim(),
    gothram: body.gothram.trim(),
    kalpasutram: body.kalpasutram.trim(),
    veda_shakha: body.veda_shakha?.trim() || '',
    native_place: body.native_place.trim(),
    whatsapp: phone,
    temple_reference: body.temple_reference?.trim() || '',
    proof_url: '',
    status: 'pending',
  });

  user.verification_status = 'pending';
  await user.save();

  res.status(201).json({
    verification_status: user.verification_status,
    application: application.toPublicJSON(),
  });
});
