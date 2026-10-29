const mongoose = require('mongoose');

const galleryPhotoSchema = new mongoose.Schema(
  {
    event_slug: { type: String, required: true, trim: true, lowercase: true, index: true },
    url: { type: String, required: true, trim: true },
    caption: { type: String, default: '', trim: true },
    sort_order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

galleryPhotoSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    event_slug: this.event_slug,
    eventId: this.event_slug,
    url: this.url,
    caption: this.caption,
    uploadedAt: this.createdAt,
  };
};

module.exports = mongoose.model('GalleryPhoto', galleryPhotoSchema);
