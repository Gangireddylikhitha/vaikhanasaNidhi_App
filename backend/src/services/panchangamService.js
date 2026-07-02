const Panchangam = require('../models/panchangam.model');
const { computeDrikPanchangam, resolveLocation } = require('../utils/drikPanchangam');
const { toIstDateKey, parseIstDate, getLocationKey } = require('../utils/panchangamDate');

async function findStored(date, location) {
  const dateKey = toIstDateKey(date);
  const locationKey = getLocationKey(location.lat, location.lon);
  const doc = await Panchangam.findOne({ date: dateKey, location_key: locationKey });
  return doc?.toPublicJSON() || null;
}

async function saveToDb(data, location) {
  const locationKey = getLocationKey(location.lat, location.lon);
  const doc = await Panchangam.findOneAndUpdate(
    { date: data.date, location_key: locationKey },
    {
      date: data.date,
      location_key: locationKey,
      source: 'computed',
      data,
      fetched_at: new Date(),
    },
    { upsert: true, new: true }
  );
  return doc.toPublicJSON();
}

function computeAndCache(date, locationInput = {}) {
  const location = resolveLocation(locationInput);
  const dateKey = toIstDateKey(date);
  const data = computeDrikPanchangam(parseIstDate(dateKey), location);
  return data;
}

/**
 * MongoDB cache → compute once (Drik/Lahiri) → return
 */
async function getPanchangam(date = new Date(), locationInput = {}) {
  const location = resolveLocation(locationInput);
  const stored = await findStored(date, location);
  const needsUpgrade = !stored?.phases
    || !stored?.nithra
    || !String(stored?.engine || '').includes('amanta')
    || !String(stored?.engine || '').includes('nithra-v1');
  if (stored && !needsUpgrade) return stored;

  const computed = computeAndCache(date, location);
  return saveToDb(computed, location);
}

async function ensureTodayAndTomorrow(locationInput = {}) {
  const location = resolveLocation(locationInput);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const results = [];
  for (const d of [today, tomorrow]) {
    const dateKey = toIstDateKey(d);
    const existing = await findStored(d, location);
    if (existing) {
      results.push({ date: dateKey, status: 'cached' });
      continue;
    }
    const data = computeAndCache(d, location);
    await saveToDb(data, location);
    results.push({ date: dateKey, status: 'computed' });
  }
  return results;
}

function* iterateDateKeys(fromKey, toKey) {
  const cursor = parseIstDate(fromKey);
  const end = parseIstDate(toKey);
  while (cursor <= end) {
    yield toIstDateKey(cursor);
    cursor.setDate(cursor.getDate() + 1);
  }
}

function getYearRangeKeys(year) {
  const y = Number(year) || new Date().getFullYear();
  return { from: `${y}-01-01`, to: `${y}-12-31` };
}

async function countStoredInRange(fromKey, toKey, locationInput = {}) {
  const location = resolveLocation(locationInput);
  const locationKey = getLocationKey(location.lat, location.lon);
  return Panchangam.countDocuments({
    location_key: locationKey,
    date: { $gte: fromKey, $lte: toKey },
  });
}

async function prefetchMissingDates({ fromKey, toKey, limit = 8, force = false, locationInput = {} }) {
  const location = resolveLocation(locationInput);
  const results = { synced: 0, failed: 0, skipped: 0, dates: [] };
  let processed = 0;

  for (const dateKey of iterateDateKeys(fromKey, toKey)) {
    if (processed >= limit) break;

    const existing = await findStored(parseIstDate(dateKey), location);
    if (existing && !force) {
      results.skipped += 1;
      continue;
    }

    processed += 1;
    try {
      const data = computeAndCache(parseIstDate(dateKey), location);
      await saveToDb(data, location);
      results.synced += 1;
      results.dates.push({ date: dateKey, status: 'computed' });
    } catch (err) {
      results.failed += 1;
      results.dates.push({ date: dateKey, status: 'failed', error: err.message });
      break;
    }
  }

  const stored = await countStoredInRange(fromKey, toKey, location);
  const totalDays =
    Math.round((parseIstDate(toKey) - parseIstDate(fromKey)) / (24 * 60 * 60 * 1000)) + 1;
  results.remaining = Math.max(0, totalDays - stored);
  results.stored = stored;
  results.totalDays = totalDays;
  return results;
}

module.exports = {
  getPanchangam,
  findStored,
  ensureTodayAndTomorrow,
  prefetchMissingDates,
  countStoredInRange,
  getYearRangeKeys,
  toIstDateKey,
  computeAndCache,
};
