const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const catchAsync = require('../utils/catchAsync');
const { CATEGORY_DISPLAY_ORDER } = require('../data/defaultCategories');
const { PUBLIC_CATEGORY_META } = require('../data/publicCategoryMeta');

function sortCategories(categories) {
  const order = new Map(CATEGORY_DISPLAY_ORDER.map((slug, index) => [slug, index]));
  return [...categories].sort((a, b) => {
    const ai = order.has(a.slug) ? order.get(a.slug) : 999;
    const bi = order.has(b.slug) ? order.get(b.slug) : 999;
    if (ai !== bi) return ai - bi;
    return a.slug.localeCompare(b.slug);
  });
}

exports.listCategories = catchAsync(async (req, res) => {
  const dbCategories = await Category.find();
  const sorted = sortCategories(dbCategories);

  const categories = sorted.map((c) => {
    const meta = PUBLIC_CATEGORY_META[c.slug] || { hasSearch: false };
    return {
      key: c.slug,
      slug: c.slug,
      label: c.label_te || c.label,
      label_te: c.label_te || c.label,
      label_en: c.label_en,
      en: c.label_en,
      color: c.color,
      bg: c.bg,
      text: c.text,
      ...meta,
    };
  });

  res.json(categories);
});

exports.listSubcategories = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.parent_key) {
    filter.parent_key = req.query.parent_key.trim().toLowerCase();
  }

  const subcategories = await Subcategory.find(filter).sort({ parent_key: 1, label_en: 1 });
  res.json(subcategories.map((s) => s.toAdminJSON()));
});
