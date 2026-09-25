require('dotenv').config();
const { connectDatabase } = require('../src/config/database');
const { isFirebaseConfigured } = require('../src/config/firebase');
const { sendToTokens } = require('../src/services/notificationService');
const { getDailySloka, getIstDateKey } = require('../src/utils/dailySloka');
const { getPanchangam } = require('../src/services/panchangamService');
const User = require('../src/models/user.model');

async function main() {
  if (!isFirebaseConfigured()) {
    console.error('❌ Firebase is not configured!');
    process.exit(1);
  }

  await connectDatabase();
  console.log('🔄 Connected to database.');

  // Find all active tokens
  const users = await User.find({
    'fcm_tokens.0': { $exists: true },
  }).select('username fcm_tokens');

  const tokens = users.flatMap((u) =>
    (u.fcm_tokens || [])
      .filter((t) => t.platform === 'android')
      .map((t) => t.token)
  );

  console.log(`📱 Found ${users.length} user(s) with ${tokens.length} Android token(s).`);

  if (!tokens.length) {
    console.warn('⚠️ No Android tokens found. Please log in on the app.');
    process.exit(0);
  }

  const today = getIstDateKey(new Date());
  const panchang = await getPanchangam(new Date());
  const sloka = getDailySloka(new Date());

  console.log('🚀 1. Sending Daily Panchangam Push...');
  const panchangResult = await sendToTokens(tokens, {
    title: 'నేటి పంచాంగం',
    body: `${panchang.tithi} · ${panchang.nakshatra} · రాహుకాలం ${panchang.rahukalam}`.slice(0, 180),
    clickAction: 'OPEN_PANCHANGAM',
    data: {
      type: 'panchangam',
      route: '/panchangam',
      date: String(today),
    },
  });
  console.log('✅ Panchangam push result:', panchangResult);

  console.log('🚀 2. Sending Daily Sloka Push...');
  const slokaResult = await sendToTokens(tokens, {
    title: `నేటి శ్లోకం · ${sloka.index}`,
    body: (sloka.telugu?.slice(0, 180) || sloka.meaning?.slice(0, 180) || 'Open app for today\'s sloka'),
    clickAction: 'OPEN_DAILY_SLOKA',
    data: {
      type: 'daily_sloka',
      route: '/sahasranamam/today',
      date: String(today),
      index: String(sloka.index),
    },
  });
  console.log('✅ Daily Sloka push result:', slokaResult);

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
