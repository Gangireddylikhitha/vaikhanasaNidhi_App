const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const DEFAULT_SETTINGS = {
  themeMode: 'dark',
  fontSize: 'large',
  textColor: 'bright',
  notifyDailySloka: true,
  notifyPanchangam: false,
};

async function loadUser(req) {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  return user;
}

exports.getBookmarks = catchAsync(async (req, res) => {
  const user = await loadUser(req);
  res.json(user.bookmarks || []);
});

exports.addBookmark = catchAsync(async (req, res) => {
  const { scripture_id, title_telugu, category, deity } = req.body;
  if (!scripture_id) throw new AppError('scripture_id is required', 400, 'BAD_REQUEST');

  const user = await loadUser(req);
  const exists = user.bookmarks.some((b) => b.scripture_id === scripture_id);
  if (!exists) {
    user.bookmarks.unshift({
      scripture_id,
      title_telugu: title_telugu || '',
      category: category || '',
      deity: deity || '',
      added_at: new Date(),
    });
    await user.save();
  }
  res.status(201).json(user.bookmarks);
});

exports.removeBookmark = catchAsync(async (req, res) => {
  const user = await loadUser(req);
  user.bookmarks = user.bookmarks.filter((b) => b.scripture_id !== req.params.scriptureId);
  await user.save();
  res.json(user.bookmarks);
});

exports.getProgress = catchAsync(async (req, res) => {
  const user = await loadUser(req);
  res.json(user.reading_progress || []);
});

exports.saveProgress = catchAsync(async (req, res) => {
  const { scripture_id, title_telugu, category, progress, last_verse } = req.body;
  if (!scripture_id) throw new AppError('scripture_id is required', 400, 'BAD_REQUEST');

  const user = await loadUser(req);
  const entry = {
    scripture_id,
    title_telugu: title_telugu || '',
    category: category || '',
    progress: Math.min(100, Math.max(0, Number(progress) || 0)),
    last_verse: Number(last_verse) || 0,
    updated_at: new Date(),
  };

  const idx = user.reading_progress.findIndex((p) => p.scripture_id === scripture_id);
  if (idx >= 0) user.reading_progress[idx] = entry;
  else user.reading_progress.unshift(entry);

  user.reading_progress = user.reading_progress
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 20);

  await user.save();
  res.json(user.reading_progress);
});

exports.getSettings = catchAsync(async (req, res) => {
  const user = await loadUser(req);
  res.json({ ...DEFAULT_SETTINGS, ...(user.settings?.toObject?.() || user.settings || {}) });
});

exports.updateSettings = catchAsync(async (req, res) => {
  const user = await loadUser(req);
  const allowed = ['themeMode', 'fontSize', 'textColor', 'notifyDailySloka', 'notifyPanchangam'];
  const next = { ...(user.settings?.toObject?.() || user.settings || {}) };
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) next[key] = req.body[key];
  });
  user.settings = next;
  await user.save();
  res.json({ ...DEFAULT_SETTINGS, ...next });
});

exports.updateProfile = catchAsync(async (req, res) => {
  const user = await loadUser(req);
  const { name } = req.body;
  if (name !== undefined) {
    if (!name.trim()) throw new AppError('Name is required', 400, 'BAD_REQUEST');
    user.name = name.trim();
  }
  await user.save();
  const json = user.toPublicJSON();
  json.id = user._id.toString();
  res.json(json);
});

exports.getUserData = catchAsync(async (req, res) => {
  const user = await loadUser(req);
  res.json({
    bookmarks: user.bookmarks || [],
    reading_progress: user.reading_progress || [],
    settings: { ...DEFAULT_SETTINGS, ...(user.settings?.toObject?.() || user.settings || {}) },
  });
});

exports.syncLocalData = catchAsync(async (req, res) => {
  const { bookmarks = [], reading_progress = [], settings } = req.body;
  const user = await loadUser(req);

  if (Array.isArray(bookmarks)) {
    bookmarks.forEach((b) => {
      if (!b?.scripture_id) return;
      const exists = user.bookmarks.some((x) => x.scripture_id === b.scripture_id);
      if (!exists) {
        user.bookmarks.unshift({
          scripture_id: b.scripture_id,
          title_telugu: b.title_telugu || '',
          category: b.category || '',
          deity: b.deity || '',
          added_at: b.added_at ? new Date(b.added_at) : new Date(),
        });
      }
    });
  }

  if (Array.isArray(reading_progress)) {
    reading_progress.forEach((p) => {
      if (!p?.scripture_id) return;
      const entry = {
        scripture_id: p.scripture_id,
        title_telugu: p.title_telugu || '',
        category: p.category || '',
        progress: Math.min(100, Math.max(0, Number(p.progress) || 0)),
        last_verse: Number(p.last_verse) || 0,
        updated_at: p.updated_at ? new Date(p.updated_at) : new Date(),
      };
      const idx = user.reading_progress.findIndex((x) => x.scripture_id === p.scripture_id);
      if (idx >= 0) {
        const existing = user.reading_progress[idx];
        if (entry.progress >= existing.progress) user.reading_progress[idx] = entry;
      } else {
        user.reading_progress.unshift(entry);
      }
    });
    user.reading_progress = user.reading_progress
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 20);
  }

  if (settings && typeof settings === 'object') {
    const allowed = ['themeMode', 'fontSize', 'textColor', 'notifyDailySloka', 'notifyPanchangam'];
    const next = { ...(user.settings?.toObject?.() || user.settings || {}) };
    allowed.forEach((key) => {
      if (settings[key] !== undefined) next[key] = settings[key];
    });
    user.settings = next;
  }

  await user.save();

  res.json({
    bookmarks: user.bookmarks || [],
    reading_progress: user.reading_progress || [],
    settings: { ...DEFAULT_SETTINGS, ...(user.settings?.toObject?.() || user.settings || {}) },
  });
});
