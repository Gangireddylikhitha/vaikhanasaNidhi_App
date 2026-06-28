const mongoose = require('mongoose');

const verseSchema = new mongoose.Schema(
  {
    telugu: { type: String, default: '' },
    meaning: { type: String, default: '' },
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    caption: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const scriptureSchema = new mongoose.Schema(
  {
    title_telugu: { type: String, required: true, trim: true },
    title_english: { type: String, default: '', trim: true },
    category: { type: String, required: true, trim: true, lowercase: true },
    parent_category: { type: String, default: '', trim: true, lowercase: true },
    subcategory: { type: String, default: '', trim: true, lowercase: true },
    deity: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    cover_url: { type: String, default: null },
    popularity: { type: Number, default: 80, min: 0, max: 100 },
    verses: { type: [verseSchema], default: [] },
    images: { type: [imageSchema], default: [] },
    legacyFirebaseId: { type: String, trim: true, sparse: true, unique: true },
  },
  { timestamps: true }
);

scriptureSchema.methods.toAdminJSON = function toAdminJSON() {
  return {
    id: this._id.toString(),
    title_telugu: this.title_telugu,
    title_english: this.title_english,
    category: this.category,
    parent_category: this.parent_category,
    subcategory: this.subcategory,
    deity: this.deity,
    description: this.description,
    cover_url: this.cover_url,
    popularity: this.popularity,
    verses: this.verses,
    images: this.images || [],
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Scripture = mongoose.model('Scripture', scriptureSchema);

module.exports = Scripture;
