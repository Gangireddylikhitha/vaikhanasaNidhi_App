const Subcategory = require('../models/subcategory.model');
const Scripture = require('../models/scripture.model');
const User = require('../models/user.model');
const VerificationApplication = require('../models/verificationApplication.model');
const catchAsync = require('../utils/catchAsync');
const { DEFAULT_CATEGORIES } = require('../data/defaultCategories');
const { DEFAULT_SUBCATEGORIES } = require('../data/defaultSubcategories');
const { countScripturesForMainSection } = require('../utils/scriptureSectionMatch');

/** Built-in defaults + custom rows in subcategories collection (same as admin Categories tab). */
async function countSubcategories() {
  const dbSubs = await Subcategory.find().select('parent_key key').lean();
  const keys = new Set(
    DEFAULT_SUBCATEGORIES.map((s) => `${s.parent_key}__${s.key}`)
  );
  dbSubs.forEach((s) => keys.add(`${s.parent_key}__${s.key}`));
  return keys.size;
}

function isImageGalleryScripture(s) {
  if (s.reading_layout === 'image_pages' || s.reading_layout === 'pdf_pages') return false;
  return s.parent_category === 'chitralu' || s.category === 'chitralu';
}

exports.getDashboard = catchAsync(async (req, res) => {
  const [scriptures, subcategoryCount, totalUsers, pendingVerifications, approvedVerifications] = await Promise.all([
    Scripture.find().lean(),
    countSubcategories(),
    User.countDocuments({ role: 'user' }),
    VerificationApplication.countDocuments({ status: 'pending' }),
    VerificationApplication.countDocuments({ status: 'approved' }),
  ]);

  const textScriptures = scriptures.filter((s) => !isImageGalleryScripture(s));
  const imageScriptures = scriptures.filter((s) => isImageGalleryScripture(s));

  const byCategory = DEFAULT_CATEGORIES.map((cat) => ({
    id: cat.slug,
    label: cat.label,
    label_en: cat.label_en,
    color: cat.color,
    count: countScripturesForMainSection(scriptures, cat.slug),
  }));

  const totalVerses = textScriptures.reduce((sum, s) => sum + (s.verses?.length || 0), 0);
  const totalImages = imageScriptures.reduce((sum, s) => sum + (s.images?.length || 0), 0);

  res.json({
    totalScriptures: textScriptures.length,
    totalVerses,
    totalImageAlbums: imageScriptures.length,
    totalImages,
    totalCategories: DEFAULT_CATEGORIES.length,
    totalSubcategories: subcategoryCount,
    byCategory,
    totalUsers,
    pendingVerifications,
    approvedVerifications,
  });
});

exports.testPushNotification = catchAsync(async (req, res) => {
  const { title = '🕉️ వైఖానస నిధి — పరీక్ష!', body = 'మీ పరికరంలో నోటిఫికేషన్‌లు విజయవంతంగా పనిచేస్తున్నాయి!' } = req.body;
  const { isFirebaseConfigured } = require('../config/firebase');
  const { sendToTokens } = require('../services/notificationService');

  if (!isFirebaseConfigured()) {
    return res.status(500).json({
      ok: false,
      error: 'Firebase is not configured on this server (missing service account credentials in FIREBASE_SERVICE_ACCOUNT_JSON)',
    });
  }

  const users = await User.find({ 'fcm_tokens.0': { $exists: true } }).select('fcm_tokens username');
  const tokens = users.flatMap((u) => (u.fcm_tokens || []).filter((t) => t.platform === 'android').map((t) => t.token));

  const result = await sendToTokens(tokens, {
    title,
    body,
    clickAction: 'OPEN_APP',
    data: { type: 'test_notification' },
  });

  res.json({
    ok: true,
    userCount: users.length,
    androidTokenCount: tokens.length,
    result,
  });
});

