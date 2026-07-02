const User = require('../models/user.model');
const VerificationApplication = require('../models/verificationApplication.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

async function enrichApplication(app) {
  const json = app.toPublicJSON();
  const user = await User.findById(app.user).select('username name createdAt');
  if (user) {
    json.username = user.username;
    json.account_name = user.name;
    json.user_created_at = user.createdAt;
  }
  return json;
}

exports.listApplications = catchAsync(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }

  const applications = await VerificationApplication.find(filter)
    .sort({ createdAt: -1 });

  const enriched = await Promise.all(applications.map(enrichApplication));

  const [pending, approved, rejected] = await Promise.all([
    VerificationApplication.countDocuments({ status: 'pending' }),
    VerificationApplication.countDocuments({ status: 'approved' }),
    VerificationApplication.countDocuments({ status: 'rejected' }),
  ]);

  res.json({
    total: await VerificationApplication.countDocuments(),
    pending,
    approved,
    rejected,
    applications: enriched,
  });
});

exports.getApplication = catchAsync(async (req, res) => {
  const application = await VerificationApplication.findById(req.params.id);
  if (!application) throw new AppError('Application not found', 404, 'NOT_FOUND');
  res.json(await enrichApplication(application));
});

exports.reviewApplication = catchAsync(async (req, res) => {
  const { status, admin_note } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Status must be approved or rejected', 400, 'BAD_REQUEST');
  }

  const application = await VerificationApplication.findById(req.params.id);
  if (!application) throw new AppError('Application not found', 404, 'NOT_FOUND');

  application.status = status;
  application.admin_note = admin_note?.trim() || '';
  application.reviewed_at = new Date();
  await application.save();

  const user = await User.findById(application.user);
  if (user) {
    user.verification_status = status;
    await user.save();
  }

  res.json(await enrichApplication(application));
});
