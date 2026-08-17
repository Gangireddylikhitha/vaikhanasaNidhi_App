require('dotenv').config();
const { connectDatabase } = require('../src/config/database');
const { isFirebaseConfigured } = require('../src/config/firebase');
const { sendToTokens } = require('../src/services/notificationService');
const User = require('../src/models/user.model');

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in backend/.env');
    process.exit(1);
  }

  if (!isFirebaseConfigured()) {
    console.error('❌ Firebase is not configured. Please ensure firebase service account credentials are in backend/.env or backend/firebase-service-account.json');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB...');
  await connectDatabase();

  console.log('🔍 Searching for registered FCM tokens...');
  const users = await User.find({
    'fcm_tokens.0': { $exists: true },
  }).select('username email fcm_tokens');

  const androidTokens = users.flatMap((u) =>
    (u.fcm_tokens || [])
      .filter((t) => t.platform === 'android')
      .map((t) => t.token)
  );

  console.log(`📱 Found ${users.length} user(s) with ${androidTokens.length} Android token(s).`);

  if (!androidTokens.length) {
    console.warn('⚠️ No Android FCM tokens found in the database yet. Make sure you logged into the app and granted notification permissions.');
    process.exit(0);
  }

  console.log('🚀 Sending instant test notification...');
  const result = await sendToTokens(androidTokens, {
    title: '🕉️ వైఖానస నిధి — స్వాగతం!',
    body: 'మీ పరికరంలో నోటిఫికేషన్‌లు విజయవంతంగా అమర్చబడ్డాయి. (Test notification delivered successfully)',
    clickAction: 'OPEN_APP',
    data: {
      type: 'test_notification',
      timestamp: new Date().toISOString(),
    },
  });

  console.log('✅ Send result:', result);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error sending test push:', err);
  process.exit(1);
});
