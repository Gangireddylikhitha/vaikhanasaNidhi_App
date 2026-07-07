/**
 * Render Cron Job — Android push notifications (hourly at :00).
 * Sends daily sloka + panchangam at NOTIFICATION_HOUR_IST.
 */
require('dotenv').config();
const { connectDatabase } = require('../src/config/database');
const { isFirebaseConfigured } = require('../src/config/firebase');
const { runScheduledNotifications } = require('../src/services/notificationService');

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  if (!isFirebaseConfigured()) {
    console.log('[cron:notifications] Firebase not configured — skipped');
    process.exit(0);
  }

  await connectDatabase();
  await runScheduledNotifications();
  console.log('[cron:notifications] done');
  process.exit(0);
}

main().catch((err) => {
  console.error('[cron:notifications] failed:', err.message);
  process.exit(1);
});
