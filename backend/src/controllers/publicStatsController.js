const Scripture = require('../models/scripture.model');
const catchAsync = require('../utils/catchAsync');
const { DEFAULT_CATEGORIES } = require('../data/defaultCategories');

function isImageGalleryScripture(s) {
  return s.parent_category === 'chitralu' || s.category === 'chitralu' || (s.images?.length > 0);
}

exports.getPublicStats = catchAsync(async (req, res) => {
  const scriptures = await Scripture.find().select('verses images parent_category category').lean();

  const textScriptures = scriptures.filter((s) => !isImageGalleryScripture(s));
  const imageScriptures = scriptures.filter((s) => isImageGalleryScripture(s));

  res.json({
    totalScriptures: textScriptures.length,
    totalVerses: textScriptures.reduce((sum, s) => sum + (s.verses?.length || 0), 0),
    totalImageAlbums: imageScriptures.length,
    totalImages: imageScriptures.reduce((sum, s) => sum + (s.images?.length || 0), 0),
    totalCategories: DEFAULT_CATEGORIES.length,
  });
});
