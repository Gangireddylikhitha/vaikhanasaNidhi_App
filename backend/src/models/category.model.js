const mongoose = require('mongoose');

/** Main app sections only (8) — stotra, mantra, book, … */
const categorySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    label: { type: String, required: true, trim: true },
    label_te: { type: String, default: '', trim: true },
    label_en: { type: String, required: true, trim: true },
    color: { type: String, required: true },
    bg: { type: String, default: '' },
    text: { type: String, default: '' },
  },
  { timestamps: true }
);

categorySchema.methods.toAdminJSON = function toAdminJSON() {
  return {
    id: this.slug,
    key: this.slug,
    kind: 'category',
    label: this.label,
    label_te: this.label_te || this.label,
    label_en: this.label_en,
    color: this.color,
    bg: this.bg,
    text: this.text,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
