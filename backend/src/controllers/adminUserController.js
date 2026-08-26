const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');

function mapUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    verification_status: user.verification_status || 'none',
    last_login_at: user.last_login_at || null,
    joined_at: user.createdAt,
  };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.listUsers = catchAsync(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const q = String(req.query.q || '').trim();

  const filter = { role: 'user' };
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: pattern }, { username: pattern }];
  }

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .sort({ last_login_at: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('name username verification_status last_login_at createdAt')
      .lean(),
  ]);

  res.json({
    users: users.map(mapUser),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});
