const Subcategory = require('../models/subcategory.model');
const catchAsync = require('../utils/catchAsync');

exports.listSubcategories = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.parent_key) {
    filter.parent_key = req.query.parent_key.trim().toLowerCase();
  }

  const subcategories = await Subcategory.find(filter).sort({ parent_key: 1, label_en: 1 });
  res.json(subcategories.map((s) => s.toAdminJSON()));
});
