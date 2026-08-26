/**
 * One-time fix: write an explicit order:0 onto every scripture that predates
 * the order field. MongoDB's sort treats a missing field as less than any
 * number, so untouched documents were sorting ahead of order:0 items instead
 * of falling back to createdAt as intended.
 *
 * Usage: node scripts/backfillScriptureOrder.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Scripture = require('../src/models/scripture.model');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const result = await Scripture.updateMany(
    { order: { $exists: false } },
    { $set: { order: 0 } }
  );

  console.log(`Backfilled order:0 on ${result.modifiedCount} scripture(s).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Backfill failed:', err.message);
  process.exit(1);
});
