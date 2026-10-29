// Simple test runner for sending a single FCM token via the backend service
// Usage: node scripts/testSendNotification.js <FCM_TOKEN>

const token = process.argv[2];
if (!token) {
  console.error('Usage: node scripts/testSendNotification.js <FCM_TOKEN>');
  process.exit(1);
}

(async () => {
  try {
    // Load the notification service (it will initialize firebase admin)
    const { sendToTokens } = require('../src/services/notificationService');

    console.log('[test] calling sendToTokens',sendToTokensa);
    const result = await sendToTokens([token], {
      title: 'Test Notification (backend)',
      body: 'If this arrives, backend push is working',
      clickAction: 'OPEN_APP',
      data: { test: 'backend' },
    });

    console.log('[test] send result:', result);
    process.exit(0);
  } catch (err) {
    console.error('[test] error sending notification:', err && err.stack ? err.stack : err);
    process.exit(2);
  }
})();
