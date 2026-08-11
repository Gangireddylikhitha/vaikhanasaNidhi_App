const cron = require('node-cron');
const User = require('../models/user.model');
const { getMessaging, isFirebaseConfigured } = require('../config/firebase');
const { getDailySloka, getIstDateKey } = require('../utils/dailySloka');
const { getPanchangam } = require('./panchangamService');

const NOTIFICATION_HOUR = Number(process.env.NOTIFICATION_HOUR_IST) || 6;
const ANDROID_CHANNEL_ID = process.env.ANDROID_NOTIFICATION_CHANNEL_ID || 'vaikhanasa_daily';
let lastSlokaDate = null;
let lastPanchangamDate = null;
let lastFestivalDate = null;
let notificationTickInFlight = false;

// Only these panchangam festival categories are "big enough" to warrant a
// dedicated push — routine ekadashi/pradosham/vrat entries occur ~2x/month
// each and would make this feel like spam on top of the daily panchangam.
const FESTIVAL_NOTIFY_CATEGORIES = new Set(['major', 'solar', 'sankranti']);

function collectAndroidTokens(users) {
  return users.flatMap((u) => (u.fcm_tokens || [])
    .filter((t) => t.platform === 'android')
    .map((t) => t.token));
}

async function sendToTokens(tokens, payload) {
  const messaging = getMessaging();
  console.log(`[notifications] sendToTokens invoked; tokenCount=${tokens?.length || 0}; payloadTitle=${payload?.title || 'n/a'}`);
  if (!messaging || !tokens.length) {
    console.warn(`[notifications] skip send: messagingReady=${Boolean(messaging)} tokenCount=${tokens?.length || 0}`);
    return { sent: 0, failed: 0 };
  }

  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  console.log(`[notifications] unique tokenCount=${uniqueTokens.length}`);
  let sent = 0;
  let failed = 0;

  const chunks = [];
  for (let i = 0; i < uniqueTokens.length; i += 500) {
    chunks.push(uniqueTokens.slice(i, i + 500));
  }

  for (const chunk of chunks) {
    try {
      console.log(`[notifications] sending multicast chunk size=${chunk.length}`);
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
      console.log(`[notifications] multicast result success=${response.successCount} failure=${response.failureCount} total=${chunk.length}`);

      if (response.responses?.length) {
        const failedResponses = response.responses.filter((r) => !r.success);
        if (failedResponses.length) {
          console.warn(`[notifications] multicast failures=${failedResponses.length}`);
          failedResponses.slice(0, 3).forEach((item, index) => {
            console.warn(`[notifications] failure ${index + 1}:`, item.error?.message || item.error || 'unknown');
          });
        }
      }
    } catch (err) {
      console.warn('[notifications] multicast failed:', err.message);
      console.warn('[notifications] multicast stack:', err.stack);
      failed += chunk.length;
    }
  }

  return { sent, failed };
}

async function notifyDailySloka() {
  const today = getIstDateKey(new Date());
  if (lastSlokaDate === today) return;

  const users = await User.find({
    'settings.notifyDailySloka': true,
    'fcm_tokens.0': { $exists: true },
  }).select('fcm_tokens');

  const tokens = collectAndroidTokens(users);
  console.log(`[notifications] daily sloka check: users=${users.length} androidTokens=${tokens.length}`);
  if (!tokens.length) {
    lastSlokaDate = today;
    return;
  }

  // Same static 108 list as the app — one śloka per IST calendar day
  const sloka = getDailySloka(new Date());
  const body = sloka.telugu?.slice(0, 180) || sloka.meaning?.slice(0, 180) || 'Open app for today\'s sloka';

  await sendToTokens(tokens, {
    title: `నేటి శ్లోకం · ${sloka.index}`,
    body,
    clickAction: 'OPEN_DAILY_SLOKA',
    data: {
      type: 'daily_sloka',
      date: today,
      index: String(sloka.index),
    },
  });

  lastSlokaDate = today;
  console.log(`[notifications] daily sloka #${sloka.index} sent to ${tokens.length} Android device(s)`);
}

async function notifyPanchangam() {
  const today = getIstDateKey(new Date());
  if (lastPanchangamDate === today) return;

  const users = await User.find({
    'settings.notifyPanchangam': true,
    'fcm_tokens.0': { $exists: true },
  }).select('fcm_tokens');

  const tokens = collectAndroidTokens(users);
  console.log(`[notifications] panchangam check: users=${users.length} androidTokens=${tokens.length}`);
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

async function notifyFestivals() {
  const today = getIstDateKey(new Date());
  if (lastFestivalDate === today) return;

  const panchang = await getPanchangam(new Date());
  const festivals = (panchang.festivals || []).filter((f) => FESTIVAL_NOTIFY_CATEGORIES.has(f.category));
  if (!festivals.length) {
    lastFestivalDate = today;
    return;
  }

  const users = await User.find({
    'settings.notifyFestivals': true,
    'fcm_tokens.0': { $exists: true },
  }).select('fcm_tokens');

  const tokens = collectAndroidTokens(users);
  console.log(`[notifications] festival check: users=${users.length} androidTokens=${tokens.length} festivals=${festivals.length}`);
  if (!tokens.length) {
    lastFestivalDate = today;
    return;
  }

  const names = festivals.map((f) => f.nameTe || f.name);
  const title = names.length > 1 ? `🪔 ఈరోజు పండుగలు` : `🪔 ఈరోజు ${names[0]}`;
  const body = (festivals[0].description || names.join(', ')).slice(0, 180);

  await sendToTokens(tokens, {
    title,
    body,
    clickAction: 'OPEN_PANCHANGAM',
    data: { type: 'festival', date: today, names: names.join(', ') },
  });

  lastFestivalDate = today;
  console.log(`[notifications] festival (${names.join(', ')}) sent to ${tokens.length} Android device(s)`);
}

/**
 * Push when admin uploads new scripture / gallery content.
 * Fire-and-forget from controllers — never blocks the create API.
 */
async function notifyNewContent({ type, title, body, id, clickAction } = {}) {
  if (!isFirebaseConfigured()) return { sent: 0, failed: 0 };

  const users = await User.find({
    'settings.notifyNewContent': { $ne: false },
    'fcm_tokens.0': { $exists: true },
  }).select('fcm_tokens');

  const tokens = collectAndroidTokens(users);
  console.log(`[notifications] new content check: users=${users.length} androidTokens=${tokens.length} type=${type || 'content'}`);
  if (!tokens.length) return { sent: 0, failed: 0 };

  const payloadTitle = title || 'కొత్త కంటెంట్';
  const payloadBody = (body || 'వైఖానస నిధిలో కొత్త విషయం జోడించబడింది').slice(0, 180);

  const result = await sendToTokens(tokens, {
    title: payloadTitle,
    body: payloadBody,
    clickAction: clickAction || 'OPEN_APP',
    data: {
      type: type || 'new_content',
      ...(id ? { id: String(id) } : {}),
    },
  });

  console.log(`[notifications] new content (${type || 'content'}) sent to ${tokens.length} device(s)`);
  return result;
}

function notifyNewContentSafe(payload) {
  console.log('[notifications] notifyNewContentSafe invoked',payload);
  notifyNewContent(payload).catch((err) => {
    console.warn('[notifications] new content failed:', err.message);
  });
}

async function runScheduledNotifications() {
  if (!isFirebaseConfigured()) return;

  const now = new Date();
  console.log(`[notifications] scheduler tick at ${now.toISOString()} IST-hour=${NOTIFICATION_HOUR}`);
  const istOffset = 5.5 * 60;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const istMinutes = utcMinutes + istOffset;
  const istHour = Math.floor((istMinutes % (24 * 60)) / 60);

  if (istHour !== NOTIFICATION_HOUR) {
    console.log(`[notifications] scheduler skip: currentISTHour=${istHour} targetHour=${NOTIFICATION_HOUR}`);
    return;
  }

  console.log(`[notifications] scheduler running for hour=${istHour}`);
  await notifyDailySloka();
  await notifyPanchangam();
  await notifyFestivals();
}

function startNotificationScheduler() {
  if (!isFirebaseConfigured()) {
    console.log('[notifications] Firebase not configured — Android push scheduler disabled');
    return;
  }

  cron.schedule('0 * * * *', () => {
    if (notificationTickInFlight) return;
    notificationTickInFlight = true;
    runScheduledNotifications().catch((err) => {
      console.warn('[notifications] scheduler error:', err.message);
    }).finally(() => {
      notificationTickInFlight = false;
    });
  }, {
    timezone: 'Asia/Kolkata',
    noOverlap: true,
  });

  console.log(`[notifications] Android scheduler active (daily ~${NOTIFICATION_HOUR}:00 IST)`);
}

module.exports = {
  sendToTokens,
  notifyDailySloka,
  notifyPanchangam,
  notifyFestivals,
  notifyNewContent,
  notifyNewContentSafe,
  runScheduledNotifications,
  startNotificationScheduler,
};
