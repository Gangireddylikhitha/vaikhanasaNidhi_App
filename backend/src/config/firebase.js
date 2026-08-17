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

function loadServiceAccount() {
  const base64Env = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (base64Env) {
    try {
      const decoded = Buffer.from(base64Env, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);
      if (parsed.private_key && typeof parsed.private_key === 'string') {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
      }
      return parsed;
    } catch (err) {
      console.warn('[firebase] FIREBASE_SERVICE_ACCOUNT_BASE64 parse failed:', err.message);
    }
  }

  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (jsonEnv) {
    try {
      const parsed = JSON.parse(jsonEnv);
      if (parsed.private_key && typeof parsed.private_key === 'string') {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
      }
      return parsed;
    } catch (err) {
      console.warn('[firebase] FIREBASE_SERVICE_ACCOUNT_JSON parse failed:', err.message);
      return null;
    }
  }

  const serviceAccountPath = getServiceAccountPath();
  if (!fs.existsSync(serviceAccountPath)) {
    return null;
  }

  // eslint-disable-next-line import/no-dynamic-require, global-require
  const loaded = require(serviceAccountPath);
  if (loaded && loaded.private_key && typeof loaded.private_key === 'string') {
    loaded.private_key = loaded.private_key.replace(/\\n/g, '\n');
  }
  return loaded;
}

function initFirebaseAdmin() {
  if (initialized) return messaging;

  const serviceAccount = loadServiceAccount();
  const serviceAccountPath = getServiceAccountPath();
  console.log(`[firebase] initializing admin SDK; serviceAccountPath=${serviceAccountPath}`);

  if (!serviceAccount) {
    console.warn(`[firebase] no service account found at ${serviceAccountPath}`);
    return null;
  }

  try {
    // eslint-disable-next-line global-require
    admin = require('firebase-admin');

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    messaging = admin.messaging();
    initialized = true;
    console.log(`[firebase] loaded project: ${serviceAccount.project_id}`);
    console.log(`[firebase] messaging ready: ${Boolean(messaging)}`);
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
