/**
 * Render Cron Job — panchangam sync (hourly at :05).
 * Runs daily IST sync + hourly retry without keeping the web service awake.
 */
require('dotenv').config();
const { connectDatabase } = require('../src/config/database');
const { onSchedulerTick } = require('../src/services/panchangamScheduler');

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await connectDatabase();
  await onSchedulerTick();
  console.log('[cron:panchangam] done');
  process.exit(0);
}

main().catch((err) => {
  console.error('[cron:panchangam] failed:', err.message);
  process.exit(1);
});
