const cron = require('node-cron');
const User = require('../models/user.model');
const { getMessaging, isFirebaseConfigured } = require('../config/firebase');
const { getDailySloka } = require('../utils/dailySloka');
const { getPanchangam } = require('./panchangamService');

const NOTIFICATION_HOUR = Number(process.env.NOTIFICATION_HOUR_IST) || 6;
const ANDROID_CHANNEL_ID = process.env.ANDROID_NOTIFICATION_CHANNEL_ID || 'vaikhanasa_daily';
let lastSlokaDate = null;
let lastPanchangamDate = null;

function collectAndroidTokens(users) {
  return users.flatMap((u) => (u.fcm_tokens || [])
    .filter((t) => t.platform === 'android')
    .map((t) => t.token));
}

async function sendToTokens(tokens, payload) {
  const messaging = getMessaging();
  if (!messaging || !tokens.length) return { sent: 0, failed: 0 };

  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  let sent = 0;
  let failed = 0;

  const chunks = [];
  for (let i = 0; i < uniqueTokens.length; i += 500) {
    chunks.push(uniqueTokens.slice(i, i + 500));
  }

  for (const chunk of chunks) {
    try {
      const response = await messaging.sendEachForMulticast({
        tokens: chunk,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: {
          ...(payload.data || {}),
          click_action: payload.clickAction || 'OPEN_APP',
        },
        android: {
          priority: 'high',
          notification: {
            channelId: ANDROID_CHANNEL_ID,
            clickAction: payload.clickAction || 'OPEN_APP',
          },
        },
      });
      sent += response.successCount;
      failed += response.failureCount;
    } catch (err) {
      console.warn('[notifications] multicast failed:', err.message);
      failed += chunk.length;
    }
  }

  return { sent, failed };
}

async function notifyDailySloka() {
  const today = new Date().toISOString().slice(0, 10);
  if (lastSlokaDate === today) return;

  const users = await User.find({
    'settings.notifyDailySloka': true,
    'fcm_tokens.0': { $exists: true },
  }).select('fcm_tokens');

  const tokens = collectAndroidTokens(users);
  if (!tokens.length) {
    lastSlokaDate = today;
    return;
  }

  const sloka = getDailySloka(new Date());
  const body = sloka.telugu?.slice(0, 180) || sloka.meaning?.slice(0, 180) || 'Open app for today\'s sloka';

  await sendToTokens(tokens, {
    title: 'నేటి శ్లోకం',
    body,
    clickAction: 'OPEN_DAILY_SLOKA',
    data: { type: 'daily_sloka', date: today },
  });

  lastSlokaDate = today;
  console.log(`[notifications] daily sloka sent to ${tokens.length} Android device(s)`);
}

async function notifyPanchangam() {
  const today = new Date().toISOString().slice(0, 10);
  if (lastPanchangamDate === today) return;

  const users = await User.find({
    'settings.notifyPanchangam': true,
    'fcm_tokens.0': { $exists: true },
  }).select('fcm_tokens');

  const tokens = collectAndroidTokens(users);
  if (!tokens.length) {
    lastPanchangamDate = today;
    return;
  }

  const panchang = await getPanchangam(new Date());
  const body = `${panchang.tithi} · ${panchang.nakshatra} · రాహుకాలం ${panchang.rahukalam}`;

  await sendToTokens(tokens, {
    title: 'నేటి పంచాంగం',
    body: body.slice(0, 180),
    clickAction: 'OPEN_PANCHANGAM',
    data: { type: 'panchangam', date: today },
  });

  lastPanchangamDate = today;
  console.log(`[notifications] panchangam sent to ${tokens.length} Android device(s)`);
}

async function runScheduledNotifications() {
  if (!isFirebaseConfigured()) return;

  const now = new Date();
  const istOffset = 5.5 * 60;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const istMinutes = utcMinutes + istOffset;
  const istHour = Math.floor((istMinutes % (24 * 60)) / 60);

  if (istHour !== NOTIFICATION_HOUR) return;

  await notifyDailySloka();
  await notifyPanchangam();
}

function startNotificationScheduler() {
  if (!isFirebaseConfigured()) {
    console.log('[notifications] Firebase not configured — Android push scheduler disabled');
    return;
  }

  cron.schedule('0 * * * *', () => {
    runScheduledNotifications().catch((err) => {
      console.warn('[notifications] scheduler error:', err.message);
    });
  });

  console.log(`[notifications] Android scheduler active (daily ~${NOTIFICATION_HOUR}:00 IST)`);
}

module.exports = {
  sendToTokens,
  notifyDailySloka,
  notifyPanchangam,
  startNotificationScheduler,
};
