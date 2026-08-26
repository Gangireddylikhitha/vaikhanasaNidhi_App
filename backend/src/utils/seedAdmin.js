const User = require('../models/user.model');

/**
 * Enforces exactly ONE admin account, configured via env
 * (ADMIN_USERNAME + ADMIN_PASSWORD). On every startup this:
 *   1. Demotes any other account that somehow holds the admin role.
 *   2. Creates the configured admin if it doesn't exist, or
 *      promotes/keeps it as admin and syncs its password with env.
 * This makes the env the single source of truth for admin credentials,
 * so the credentials can be changed just by editing .env and restarting.
 */
async function seedAdminUser() {
  const username = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'admin@123';

  // 1. Only the configured account may be admin.
  await User.updateMany(
    { role: 'admin', username: { $ne: username } },
    { $set: { role: 'user' } }
  );

  const existing = await User.findOne({ username }).select('+password');

  if (existing) {
    let changed = false;
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      changed = true;
    }
    // Admin never needs verification.
    if (existing.verification_status !== 'approved') {
      existing.verification_status = 'approved';
      changed = true;
    }
    // Keep the password in sync with env (allows rotating credentials).
    const samePassword = await existing.comparePassword(password);
    if (!samePassword) {
      existing.password = password; // re-hashed by the pre-save hook
      changed = true;
    }
    if (changed) {
      await existing.save();
      console.log(`Admin user updated: ${username}`);
    }
    return;
  }

  await User.create({
    name: 'Admin',
    username,
    password,
    role: 'admin',
    verification_status: 'approved',
  });

  console.log(`Admin user seeded: ${username}`);
}

module.exports = { seedAdminUser };
