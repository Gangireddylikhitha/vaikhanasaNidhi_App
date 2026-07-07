require('dotenv').config();

const app = require('./app');
const { connectDatabase } = require('./config/database');
const { seedAdminUser } = require('./utils/seedAdmin');
const { seedDefaultCategories, seedDefaultSubcategories } = require('./utils/seedContent');
const { seedDefaultGalleryEvents } = require('./utils/seedGallery');
const { startNotificationScheduler } = require('./services/notificationService');
const { startPanchangamScheduler } = require('./services/panchangamScheduler');

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is required. Copy .env.example to .env and set it.');
    process.exit(1);
  }

  await new Promise((resolve, reject) => {
    app.listen(PORT, '0.0.0.0', (err) => (err ? reject(err) : resolve()));
  });

  console.log(`Server running on port ${PORT}`);
  console.log(`API base: http://localhost:${PORT}/api`);

  await connectDatabase();
  await seedAdminUser();
  await seedDefaultCategories();
  await seedDefaultSubcategories();
  await seedDefaultGalleryEvents();

  console.log('Database connected and seeds complete');
  if (process.env.DISABLE_IN_PROCESS_CRON !== 'true') {
    startPanchangamScheduler();
    startNotificationScheduler();
  } else {
    console.log('[cron] in-process schedulers disabled — using external cron jobs');
  }
}

start().catch(err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
