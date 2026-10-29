/**
 * Prefetch Panchangam into MongoDB using local Drik calculations (no API credits).
 *
 * Usage:
 *   node scripts/prefetchPanchangam.js
 *   node scripts/prefetchPanchangam.js --year=2026 --limit=50
 *   node scripts/prefetchPanchangam.js --from=2026-01-01 --to=2026-12-31 --force
 *   node scripts/prefetchPanchangam.js --status
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase } = require('../src/config/database');
const {
  prefetchMissingDates,
  countStoredInRange,
  getYearRangeKeys,
} = require('../src/services/panchangamService');

function parseArgs(argv) {
  const opts = { limit: 30, status: false, force: false };
  for (const arg of argv) {
    if (arg === '--status') opts.status = true;
    else if (arg === '--force') opts.force = true;
    else if (arg.startsWith('--year=')) opts.year = arg.split('=')[1];
    else if (arg.startsWith('--from=')) opts.from = arg.split('=')[1];
    else if (arg.startsWith('--to=')) opts.to = arg.split('=')[1];
    else if (arg.startsWith('--limit=')) opts.limit = Number(arg.split('=')[1]) || 30;
  }
  return opts;
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await connectDatabase();

  const opts = parseArgs(process.argv.slice(2));
  const year = opts.year || new Date().getFullYear();
  const range = opts.from && opts.to ? { from: opts.from, to: opts.to } : getYearRangeKeys(year);
  const stored = await countStoredInRange(range.from, range.to);
  const totalDays =
    Math.round((new Date(`${range.to}T12:00:00+05:30`) - new Date(`${range.from}T12:00:00+05:30`)) / 86400000) + 1;

  console.log(`Range: ${range.from} → ${range.to}`);
  console.log(`Stored: ${stored} / ${totalDays} days`);

  if (opts.status) {
    await mongoose.disconnect();
    return;
  }

  const result = await prefetchMissingDates({
    fromKey: range.from,
    toKey: range.to,
    limit: opts.limit,
    force: opts.force,
  });

  console.log(`Computed: ${result.synced}, failed: ${result.failed}, skipped: ${result.skipped}`);
  console.log(`Remaining in range: ${result.remaining}`);
  if (result.dates.length) {
    console.log(result.dates.map((d) => `${d.date}:${d.status}`).join(', '));
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
