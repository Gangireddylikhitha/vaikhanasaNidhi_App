const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const saPath = path.join(__dirname, '../firebase-service-account.json');
if (!fs.existsSync(saPath)) {
  console.error('No service account found');
  process.exit(1);
}

const serviceAccount = require(saPath);

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const messaging = admin.messaging();
  const token = 'f9b2qUn3Th2cEotuF6vNCT:APA91bGXNEy8j0-LnViYJDONDYoP1WpEVO08BSKZEBIMz4fE-gagALlJuD8uUiuRK0NZu8uGIOeeaYwSvQv3SCJoOvqloTzjmubD-ITQSrr0qGIpTad7RUI';

  messaging.send({
    token: token,
    notification: {
      title: '🕉️ వైఖానస నిధి — పరీక్ష!',
      body: 'ఈ నోటిఫికేషన్ మీ ఫోన్‌కు విజయవంతంగా చేరింది!',
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'vaikhanasa_daily',
        sound: 'default',
      },
    },
  }).then((res) => {
    console.log('✅ DIRECT SEND SUCCESS:', res);
    process.exit(0);
  }).catch((err) => {
    console.error('❌ DIRECT SEND ERROR:', err.message);
    if (err.errorInfo) console.error('Error info:', err.errorInfo);
    process.exit(1);
  });
} catch (e) {
  console.error('Init error:', e);
}
