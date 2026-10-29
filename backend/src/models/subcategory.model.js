const mongoose = require('mongoose');

/** Subcategories under a main section (mantra → sandhyavandanam, …) */
const subcategorySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    key: { type: String, required: true, trim: true, lowercase: true },
    parent_key: { type: String, required: true, trim: true, lowercase: true, index: true },
    filter_cat: { type: String, default: '', trim: true, lowercase: true },
    label: { type: String, required: true, trim: true },
    label_te: { type: String, default: '', trim: true },
    label_en: { type: String, required: true, trim: true },
    search_terms: { type: [String], default: [] },
    color: { type: String, required: true },
    bg: { type: String, default: '' },
    text: { type: String, default: '' },
    image_url: { type: String, default: null },
  },
  { timestamps: true }
);

subcategorySchema.index({ parent_key: 1, key: 1 }, { unique: true });

subcategorySchema.methods.toAdminJSON = function toAdminJSON() {
  return {
    id: this.slug,
    key: this.key,
    kind: 'subcategory',
    parent_key: this.parent_key,
    filter_cat: this.filter_cat || this.parent_key || '',
    label: this.label,
    label_te: this.label_te || this.label,
    label_en: this.label_en,
    search_terms: this.search_terms || [],
    color: this.color,
    bg: this.bg,
    text: this.text,
    image_url: this.image_url,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = Subcategory;
