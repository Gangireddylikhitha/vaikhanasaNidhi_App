/**
 * Split the old single "categories" collection into:
 *   - categories  (main / filter categories)
 *   - subcategories (items under a parent section)
 *
 * Usage: node scripts/splitCategoryCollections.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

function pickSubcategoryFields(doc) {
  const key = doc.key || (doc.slug?.includes('__') ? doc.slug.split('__').pop() : doc.slug);
  return {
    slug: doc.slug,
    key,
    parent_key: doc.parent_key,
    filter_cat: doc.filter_cat || doc.parent_key || '',
    label: doc.label,
    label_te: doc.label_te || doc.label,
    label_en: doc.label_en,
    search_terms: doc.search_terms || [],
    color: doc.color || 'from-stone-600 to-stone-800',
    bg: doc.bg || '',
    text: doc.text || '',
    createdAt: doc.createdAt || new Date(),
    updatedAt: doc.updatedAt || new Date(),
  };
}

function pickCategoryFields(doc) {
  return {
    slug: doc.slug,
    label: doc.label,
    label_te: doc.label_te || doc.label,
    label_en: doc.label_en,
    color: doc.color || 'from-stone-600 to-stone-800',
    bg: doc.bg || '',
    text: doc.text || '',
    createdAt: doc.createdAt || new Date(),
    updatedAt: doc.updatedAt || new Date(),
  };
}

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const categoriesCol = db.collection('categories');
  const subcategoriesCol = db.collection('subcategories');

  const all = await categoriesCol.find({}).toArray();
  const subDocs = all.filter((d) => d.kind === 'subcategory');
  const mainDocs = all.filter((d) => d.kind !== 'subcategory');

  console.log(`Categories collection: ${mainDocs.length} main, ${subDocs.length} sub (to move)`);

  let moved = 0;
  for (const doc of subDocs) {
    const payload = pickSubcategoryFields(doc);
    await subcategoriesCol.updateOne({ slug: payload.slug }, { $set: payload }, { upsert: true });
    moved += 1;
  }

  if (moved > 0) {
    await categoriesCol.deleteMany({ kind: 'subcategory' });
    console.log(`Moved ${moved} documents → subcategories collection`);
  }

  let cleaned = 0;
  for (const doc of mainDocs) {
    const hasLegacyFields = doc.kind || doc.key || doc.parent_key || doc.filter_cat || doc.search_terms;
    if (hasLegacyFields) {
      await categoriesCol.updateOne(
        { _id: doc._id },
        {
          $set: pickCategoryFields(doc),
          $unset: {
            kind: '',
            key: '',
            parent_key: '',
            filter_cat: '',
            search_terms: '',
          },
        }
      );
      cleaned += 1;
    }
  }

  if (cleaned > 0) {
    console.log(`Cleaned ${cleaned} main category documents`);
  }

  const finalCats = await categoriesCol.countDocuments();
  const finalSubs = await subcategoriesCol.countDocuments();
  console.log(`Done. categories: ${finalCats}, subcategories: ${finalSubs}`);

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
