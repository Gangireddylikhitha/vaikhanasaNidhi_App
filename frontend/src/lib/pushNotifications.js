import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { isNativeApp } from './native';
import { isLoggedIn, isAdmin, isGuest } from '../store/authStore';
import { registerFcmTokenApi, removeFcmTokenApi } from '../api/userApi';

const CHANNEL_ID = 'vaikhanasa_daily';
const TOKEN_KEY = 'vaikhanasa-fcm-token';

const PENDING_NAV_KEY = 'vaikhanasa_pending_push_nav';

let listenersReady = false;
/** @type {null | ((path: string) => void)} */
let pushNavHandler = null;
let pendingNavPath = null;

export function setPushNavHandler(handler) {
  pushNavHandler = handler;
  const storedPath = sessionStorage.getItem(PENDING_NAV_KEY);
  const path = pendingNavPath || storedPath;

  if (path && path !== '/') {
    pendingNavPath = null;
    sessionStorage.removeItem(PENDING_NAV_KEY);
    // Defer slightly to ensure the router and layout outlet are fully active
    setTimeout(() => {
      if (pushNavHandler) {
        try {
          pushNavHandler(path);
        } catch (err) {
          console.warn('[push] failed to navigate to path:', path, err);
        }
      }
    }, 100);
  }

  return () => {
    if (pushNavHandler === handler) pushNavHandler = null;
  };
}

function canRegisterPush() {
  return isLoggedIn() && !isGuest();
}

export function routeFromNotification(data = {}) {
  if (!data) return '/';

  let raw = data;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = {};
    }
  }

  // Check explicit route path first
  if (typeof raw.route === 'string' && raw.route.trim().startsWith('/')) {
    return raw.route.trim();
  }

  const type = String(raw.type || raw.notification_type || raw.tag || '').toLowerCase().trim();
  const action = String(raw.click_action || raw.clickAction || raw.action || '').toUpperCase().trim();
  const id = raw.id || raw.scripture_id || raw.scriptureId;

  if (
    type === 'panchangam'
    || type === 'panchang'
    || type === 'daily_panchangam'
    || type === 'festival'
    || action === 'OPEN_PANCHANGAM'
    || action.includes('PANCHANGAM')
  ) {
    return '/panchangam';
  }

  if (
    type === 'daily_sloka'
    || type === 'sloka'
    || type === 'sahasranamam'
    || action === 'OPEN_DAILY_SLOKA'
    || action.includes('SLOKA')
  ) {
    return '/sahasranamam/today';
  }

  if (
    type === 'gallery'
    || type === 'new_gallery'
    || action === 'OPEN_GALLERY'
    || action.includes('GALLERY')
  ) {
    return '/gallery';
  }

  if (
    action === 'OPEN_SCRIPTURE'
    || action.includes('SCRIPTURE')
    || type === 'new_content'
    || type === 'scripture'
    || type === 'new_scripture'
  ) {
    if (id) return `/read/${id}`;
    return '/categories';
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
    console.log('[push] pushNotificationActionPerformed event:', event);
    const notif = event?.notification || {};
    let dataPayload = notif.data || event?.data || {};

    if (typeof dataPayload === 'string') {
      try {
        dataPayload = JSON.parse(dataPayload);
      } catch {
        dataPayload = {};
      }
    }

    const merged = {
      ...notif,
      ...(typeof dataPayload === 'object' && dataPayload !== null ? dataPayload : {}),
    };

    const path = routeFromNotification(merged);
    console.log('[push] resolved notification route:', path);

    if (path && path !== '/') {
      sessionStorage.setItem(PENDING_NAV_KEY, path);
      if (pushNavHandler) {
        pushNavHandler(path);
      } else {
        pendingNavPath = path;
      }
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
