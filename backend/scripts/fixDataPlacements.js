/**
 * One-time fixes:
 * 1. Backfill bg/text on subcategories missing badge styles
 * 2. Backfill parent_category + subcategory on all scriptures missing placement
 *
 * Usage: node scripts/fixDataPlacements.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Scripture = require('../src/models/scripture.model');
const Subcategory = require('../src/models/subcategory.model');
const { resolveCategoryStyles } = require('../src/utils/categoryStyles');
const { resolveScripturePlacement } = require('../src/utils/scriptureSectionMatch');
const { DEFAULT_SUBCATEGORIES } = require('../src/data/defaultSubcategories');

const FILTER_CAT_BY_SUB = new Map(
  DEFAULT_SUBCATEGORIES.map((s) => [`${s.parent_key}__${s.key}`, s.filter_cat])
);

async function backfillSubcategoryStyles() {
  const subs = await Subcategory.find({ $or: [{ bg: '' }, { text: '' }] });
  let updated = 0;
  for (const sub of subs) {
    const styles = resolveCategoryStyles(sub.filter_cat, sub.parent_key);
    if (!sub.bg && styles.bg) sub.bg = styles.bg;
    if (!sub.text && styles.text) sub.text = styles.text;
    if (sub.isModified()) {
      await sub.save();
      updated += 1;
    }
  }
  console.log(`Subcategory styles backfilled: ${updated}`);
}

async function backfillScripturePlacements() {
  const scriptures = await Scripture.find({
    $or: [
      { parent_category: '' },
      { parent_category: { $exists: false } },
      { subcategory: '' },
      { subcategory: { $exists: false } },
    ],
  });

  let fixed = 0;
  let skipped = 0;

  for (const doc of scriptures) {
    const placement = resolveScripturePlacement(doc);
    if (!placement?.parent_category || !placement?.subcategory) {
      skipped += 1;
      continue;
    }

    const filterCat = FILTER_CAT_BY_SUB.get(`${placement.parent_category}__${placement.subcategory}`)
      || placement.category;

    let changed = false;
    if (doc.parent_category !== placement.parent_category) {
      doc.parent_category = placement.parent_category;
      changed = true;
    }
    if (doc.subcategory !== placement.subcategory) {
      doc.subcategory = placement.subcategory;
      changed = true;
    }
    if (filterCat && doc.category !== filterCat) {
      doc.category = filterCat;
      changed = true;
    }

    if (changed) {
      await doc.save();
      fixed += 1;
      console.log(`Fixed: ${doc.title_english || doc.title_telugu} → ${placement.parent_category} / ${placement.subcategory}`);
    }
  }

  console.log(`Scriptures placement backfilled: ${fixed} (skipped ${skipped} with no mapping)`);
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  await backfillSubcategoryStyles();
  await backfillScripturePlacements();
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
