/**
 * Remove ashtottaram & sahasranamam from categories collection.
 * They are Stotra sub-types (filter_cat), already in subcategories — not main categories.
 *
 * Usage: node scripts/pruneExtraCategories.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { FILTER_CATEGORY_SLUGS } = require('../src/data/defaultCategories');

async function prune() {
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('categories');

  const result = await col.deleteMany({ slug: { $in: FILTER_CATEGORY_SLUGS } });
  const remaining = await col.countDocuments();

  console.log(`Removed ${result.deletedCount} filter-only slugs (${FILTER_CATEGORY_SLUGS.join(', ')})`);
  console.log(`Categories collection now has ${remaining} documents (expected: 8)`);

  await mongoose.disconnect();
}

prune().catch((err) => {
  console.error(err);
  process.exit(1);
});
