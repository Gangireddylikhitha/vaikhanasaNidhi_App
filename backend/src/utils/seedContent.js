const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const { DEFAULT_CATEGORIES } = require('../data/defaultCategories');
const { DEFAULT_SUBCATEGORIES } = require('../data/defaultSubcategories');
const { resolveCategoryStyles } = require('./categoryStyles');

async function seedDefaultCategories() {
  const count = await Category.countDocuments();
  if (count > 0) return;

  await Category.insertMany(
    DEFAULT_CATEGORIES.map((c) => ({
      slug: c.slug,
      label: c.label,
      label_te: c.label,
      label_en: c.label_en,
      color: c.color,
      bg: c.bg,
      text: c.text,
    }))
  );
  console.log(`Categories seeded: ${DEFAULT_CATEGORIES.length}`);
}

async function seedDefaultSubcategories() {
  let inserted = 0;

  for (const sub of DEFAULT_SUBCATEGORIES) {
    const slug = `${sub.parent_key}__${sub.key}`;
    const exists = await Subcategory.findOne({ slug });
    if (exists) continue;

    const styles = resolveCategoryStyles(sub.filter_cat, sub.parent_key);

    await Subcategory.create({
      slug,
      key: sub.key,
      parent_key: sub.parent_key,
      filter_cat: sub.filter_cat,
      label: sub.label,
      label_te: sub.label_te || sub.label,
      label_en: sub.label_en,
      search_terms: sub.search_terms || [],
      color: sub.color,
      bg: styles.bg,
      text: styles.text,
    });
    inserted += 1;
  }

  if (inserted > 0) {
    console.log(`Subcategories seeded: ${inserted}`);
  }
}

module.exports = { seedDefaultCategories, seedDefaultSubcategories };
