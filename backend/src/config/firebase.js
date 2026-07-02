const path = require('path');
const fs = require('fs');

let admin = null;
let messaging = null;
let initialized = false;

function getServiceAccountPath() {
  const configured = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(__dirname, '../..', configured);
  }
  return path.join(__dirname, '../../firebase-service-account.json');
}

function initFirebaseAdmin() {
  if (initialized) return messaging;

  const serviceAccountPath = getServiceAccountPath();
  if (!fs.existsSync(serviceAccountPath)) {
    return null;
  }

  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const serviceAccount = require(serviceAccountPath);
    // eslint-disable-next-line global-require
    admin = require('firebase-admin');

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    messaging = admin.messaging();
    initialized = true;
    return messaging;
  } catch (err) {
    console.warn('[firebase] init failed:', err.message);
    return null;
  }
}

function getMessaging() {
  return initFirebaseAdmin();
}

function isFirebaseConfigured() {
  return Boolean(getMessaging());
}

module.exports = { getMessaging, isFirebaseConfigured };
