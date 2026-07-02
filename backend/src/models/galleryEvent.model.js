const mongoose = require('mongoose');

const galleryEventSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    label: { type: String, required: true, trim: true },
    label_te: { type: String, default: '', trim: true },
    label_en: { type: String, default: '', trim: true },
    sort_order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

galleryEventSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this.slug,
    slug: this.slug,
    label: this.label_te || this.label,
    label_te: this.label_te || this.label,
    label_en: this.label_en || this.label,
    sort_order: this.sort_order,
  };
};

module.exports = mongoose.model('GalleryEvent', galleryEventSchema);
