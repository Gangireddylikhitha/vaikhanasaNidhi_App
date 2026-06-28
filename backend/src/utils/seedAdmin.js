const User = require('../models/user.model');

async function seedAdminUser() {
  const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'admin@123';

  const existing = await User.findOne({ username });
  if (existing) return;

  await User.create({
    name: 'Admin',
    username,
    password,
    role: 'admin',
  });

  console.log(`Admin user seeded: ${username}`);
}

module.exports = { seedAdminUser };
