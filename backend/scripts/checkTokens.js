require('dotenv').config();
const { connectDatabase } = require('../src/config/database');
const User = require('../src/models/user.model');

async function main() {
  await connectDatabase();
  const users = await User.find().select('username role fcm_tokens last_login_at createdAt');
  console.log('Total users:', users.length);
  users.forEach((u) => {
    console.log(`- ${u.username} (${u.role}): ${u.fcm_tokens?.length || 0} token(s), last_login: ${u.last_login_at}`);
  });
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
