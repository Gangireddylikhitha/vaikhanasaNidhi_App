const GalleryEvent = require('../models/galleryEvent.model');
const GalleryPhoto = require('../models/galleryPhoto.model');
const catchAsync = require('../utils/catchAsync');

exports.listEvents = catchAsync(async (req, res) => {
  const events = await GalleryEvent.find().sort({ sort_order: 1, label_en: 1 });
  res.json(events.map((e) => e.toPublicJSON()));
});

exports.listPhotos = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.event) {
    filter.event_slug = req.query.event.trim().toLowerCase();
  }
  const photos = await GalleryPhoto.find(filter).sort({ sort_order: 1, createdAt: -1 });
  res.json(photos.map((p) => p.toPublicJSON()));
});
