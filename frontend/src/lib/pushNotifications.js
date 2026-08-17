import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { isNativeApp } from './native';
import { isLoggedIn, isAdmin, isGuest } from '../store/authStore';
import { registerFcmTokenApi, removeFcmTokenApi } from '../api/userApi';

const CHANNEL_ID = 'vaikhanasa_daily';
const TOKEN_KEY = 'vaikhanasa-fcm-token';

let listenersReady = false;
/** @type {null | ((path: string) => void)} */
let pushNavHandler = null;
// A notification tap can arrive (cold start) before PushNavBridge has mounted
// and registered a handler — hold onto it and replay once one shows up.
let pendingNavPath = null;

export function setPushNavHandler(handler) {
  pushNavHandler = handler;
  if (pendingNavPath) {
    const path = pendingNavPath;
    pendingNavPath = null;
    handler(path);
  }
  return () => {
    if (pushNavHandler === handler) pushNavHandler = null;
  };
}

function canRegisterPush() {
  return isLoggedIn() && !isGuest();
}

function routeFromNotification(data = {}) {
  const type = String(data.type || '');
  const action = String(data.click_action || '');

  if (type === 'daily_sloka' || action === 'OPEN_DAILY_SLOKA') return '/sahasranamam/today';
  if (type === 'panchangam' || action === 'OPEN_PANCHANGAM') return '/panchangam';
  if (type === 'gallery' || action === 'OPEN_GALLERY') return '/gallery';
  if (
    action === 'OPEN_SCRIPTURE'
    || type === 'new_content'
    || type === 'scripture'
  ) {
    if (data.id) return `/read/${data.id}`;
  }
  return '/';
}

async function ensureListeners() {
  if (listenersReady) return;
  listenersReady = true;

  await PushNotifications.addListener('registration', async ({ value }) => {
    if (!value) return;
    localStorage.setItem(TOKEN_KEY, value);
    if (!canRegisterPush()) return;
    try {
      await registerFcmTokenApi(value);
    } catch (err) {
      console.warn('[push] failed to save FCM token:', err?.message || err);
    }
  });

  await PushNotifications.addListener('registrationError', (err) => {
    console.warn('[push] registration error:', err?.error || err);
  });

  await PushNotifications.addListener('pushNotificationActionPerformed', (event) => {
    const data = event?.notification?.data || {};
    const path = routeFromNotification(data);
    if (pushNavHandler) {
      pushNavHandler(path);
    } else {
      pendingNavPath = path;
    }
  });
}

async function ensureAndroidChannel() {
  try {
    await PushNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'Daily Vaikhanasa',
      description: 'Daily sloka, panchangam, and new content alerts',
      importance: 5,
      visibility: 1,
      sound: 'default',
      vibration: true,
    });
  } catch {
    // Channel may already exist
  }
}

/** Call once on native app boot. */
export async function initPushNotifications() {
  if (!isNativeApp() || Capacitor.getPlatform() !== 'android') return;

  await ensureListeners();
  await ensureAndroidChannel();

  if (canRegisterPush()) {
    await registerPushNotifications();
  }
}

/** Request permission + register FCM after user login. */
export async function registerPushNotifications() {
  if (!isNativeApp() || Capacitor.getPlatform() !== 'android') return;
  if (!canRegisterPush()) return;

  await ensureListeners();
  await ensureAndroidChannel();

  const perm = await PushNotifications.requestPermissions();
  if (perm.receive !== 'granted') return;

  await PushNotifications.register();
}

/** Remove token from server on logout. */
export async function unregisterPushNotifications() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    try {
      await removeFcmTokenApi(token);
    } catch {
      // best-effort
    }
    localStorage.removeItem(TOKEN_KEY);
  }
}
