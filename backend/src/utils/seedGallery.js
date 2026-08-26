const GalleryEvent = require('../models/galleryEvent.model');
const { DEFAULT_GALLERY_EVENTS } = require('../data/defaultGalleryEvents');

async function seedDefaultGalleryEvents() {
  let inserted = 0;
  for (const ev of DEFAULT_GALLERY_EVENTS) {
    const exists = await GalleryEvent.findOne({ slug: ev.slug });
    if (exists) continue;
    await GalleryEvent.create(ev);
    inserted += 1;
  }
  if (inserted > 0) console.log(`Gallery events seeded: ${inserted}`);
}

module.exports = { seedDefaultGalleryEvents };
