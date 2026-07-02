const GalleryEvent = require('../models/galleryEvent.model');
const GalleryPhoto = require('../models/galleryPhoto.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { deleteByUrl, deleteManyUrls } = require('../utils/cloudinaryDelete');

function slugify(text) {
  return String(text).trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

exports.listEvents = catchAsync(async (req, res) => {
  const events = await GalleryEvent.find().sort({ sort_order: 1, label_en: 1 });
  res.json(events.map((e) => e.toPublicJSON()));
});

exports.createEvent = catchAsync(async (req, res) => {
  const { label, label_te, label_en, sort_order } = req.body;
  if (!label_en?.trim()) throw new AppError('English label is required', 400, 'BAD_REQUEST');

  const slug = slugify(req.body.slug || label_en);
  const exists = await GalleryEvent.findOne({ slug });
  if (exists) throw new AppError('Event already exists', 409, 'CONFLICT');

  const event = await GalleryEvent.create({
    slug,
    label: (label_te || label || label_en).trim(),
    label_te: (label_te || label || label_en).trim(),
    label_en: label_en.trim(),
    sort_order: Number(sort_order) || 0,
  });
  res.status(201).json(event.toPublicJSON());
});

exports.updateEvent = catchAsync(async (req, res) => {
  const event = await GalleryEvent.findOne({ slug: req.params.slug });
  if (!event) throw new AppError('Event not found', 404, 'NOT_FOUND');

  const { label, label_te, label_en, sort_order } = req.body;
  if (label !== undefined) event.label = label.trim();
  if (label_te !== undefined) event.label_te = label_te.trim();
  if (label_en !== undefined) event.label_en = label_en.trim();
  if (sort_order !== undefined) event.sort_order = Number(sort_order) || 0;

  await event.save();
  res.json(event.toPublicJSON());
});

exports.deleteEvent = catchAsync(async (req, res) => {
  const event = await GalleryEvent.findOneAndDelete({ slug: req.params.slug });
  if (!event) throw new AppError('Event not found', 404, 'NOT_FOUND');
  const photos = await GalleryPhoto.find({ event_slug: event.slug });
  await deleteManyUrls(photos.map((p) => p.url));
  await GalleryPhoto.deleteMany({ event_slug: event.slug });
  res.json({ ok: true });
});

exports.createPhotos = catchAsync(async (req, res) => {
  const { event_slug, photos } = req.body;
  if (!event_slug?.trim()) throw new AppError('event_slug is required', 400, 'BAD_REQUEST');

  const slug = event_slug.trim().toLowerCase();
  const event = await GalleryEvent.findOne({ slug });
  if (!event) throw new AppError('Event not found', 404, 'NOT_FOUND');

  if (!Array.isArray(photos) || !photos.length) {
    throw new AppError('At least one photo is required', 400, 'BAD_REQUEST');
  }

  const created = await GalleryPhoto.insertMany(
    photos.map((p, i) => ({
      event_slug: slug,
      url: p.url,
      caption: p.caption?.trim() || '',
      sort_order: Number(p.sort_order) ?? i,
    }))
  );
  res.status(201).json(created.map((p) => p.toPublicJSON()));
});

exports.deletePhoto = catchAsync(async (req, res) => {
  const photo = await GalleryPhoto.findByIdAndDelete(req.params.id);
  if (!photo) throw new AppError('Photo not found', 404, 'NOT_FOUND');
  await deleteByUrl(photo.url);
  res.json({ ok: true });
});
