const express = require('express');
const { onSchedulerTick } = require('../services/panchangamScheduler');
const { runScheduledNotifications } = require('../services/notificationService');

const router = express.Router();

function requireCronSecret(req, res, next) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return res.status(503).json({ error: 'CRON_SECRET not configured' });
  }

  const auth = req.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : req.query.secret;
  if (token !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}

router.post('/panchangam', requireCronSecret, async (req, res, next) => {
  try {
    await onSchedulerTick();
    res.json({ ok: true, job: 'panchangam' });
  } catch (err) {
    next(err);
  }
});

router.post('/notifications', requireCronSecret, async (req, res, next) => {
  try {
    await runScheduledNotifications();
    res.json({ ok: true, job: 'notifications' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
