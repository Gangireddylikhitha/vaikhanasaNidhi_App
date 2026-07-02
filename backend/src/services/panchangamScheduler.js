const cron = require('node-cron');
const {
  ensureTodayAndTomorrow,
  findStored,
  prefetchMissingDates,
  getYearRangeKeys,
  toIstDateKey,
} = require('./panchangamService');

const SYNC_HOUR_IST = Number(process.env.PANCHANGAM_SYNC_HOUR_IST) || 5;
const PREFETCH_PER_NIGHT = Number(process.env.PANCHANGAM_PREFETCH_PER_NIGHT) || 8;
const PREFETCH_YEAR = process.env.PANCHANGAM_PREFETCH_YEAR;
let lastDailySyncDate = null;

function getIstHour() {
  const now = new Date();
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const istMinutes = utcMinutes + 5.5 * 60;
  return Math.floor((istMinutes % (24 * 60)) / 60);
}

async function runDailySync() {
  const todayKey = toIstDateKey(new Date());
  if (lastDailySyncDate === todayKey) return;

  const results = await ensureTodayAndTomorrow();
  lastDailySyncDate = todayKey;
  console.log('[panchangam] daily compute:', results.map((r) => `${r.date}:${r.status}`).join(', '));

  if (PREFETCH_PER_NIGHT > 0) {
    const year = PREFETCH_YEAR || new Date().getFullYear();
    const { from, to } = getYearRangeKeys(year);
    const prefetch = await prefetchMissingDates({
      fromKey: from,
      toKey: to,
      limit: PREFETCH_PER_NIGHT,
    });
    console.log(
      `[panchangam] year prefetch (${year}): +${prefetch.synced} computed, ${prefetch.remaining} days left`
    );
  }
}

async function runHourlyRetry() {
  const stored = await findStored(new Date(), {});
  if (stored) return;
  console.log('[panchangam] today missing — computing now');
  await ensureTodayAndTomorrow();
}

async function onSchedulerTick() {
  const istHour = getIstHour();
  if (istHour === SYNC_HOUR_IST) {
    await runDailySync();
    return;
  }
  await runHourlyRetry();
}

function startPanchangamScheduler() {
  cron.schedule('5 * * * *', () => {
    onSchedulerTick().catch((err) => {
      console.warn('[panchangam] scheduler error:', err.message);
    });
  });

  ensureTodayAndTomorrow()
    .then((results) => {
      console.log(
        `[panchangam] startup compute (~${SYNC_HOUR_IST}:00 IST daily):`,
        results.map((r) => `${r.date}:${r.status}`).join(', ')
      );
    })
    .catch((err) => {
      console.warn('[panchangam] startup compute error:', err.message);
    });

  console.log(`[panchangam] Drik scheduler active (daily ~${SYNC_HOUR_IST}:00 IST)`);
}

module.exports = { startPanchangamScheduler, ensureTodayAndTomorrow };
