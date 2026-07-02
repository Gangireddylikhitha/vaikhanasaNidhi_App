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

  await connectDatabase();
  await seedAdminUser();
  await seedDefaultCategories();
  await seedDefaultSubcategories();
  await seedDefaultGalleryEvents();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API base: http://localhost:${PORT}/api`);
    console.log('Dashboard API: totalScriptures, totalCategories, totalSubcategories, byCategory (8 bars)');
    startPanchangamScheduler();
    startNotificationScheduler();
  });
}

start().catch(err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
