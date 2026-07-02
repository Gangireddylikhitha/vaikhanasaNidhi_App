const mongoose = require('mongoose');

const panchangamSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, trim: true, index: true },
    location_key: { type: String, required: true, trim: true, index: true },
    source: { type: String, enum: ['computed'], default: 'computed' },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    fetched_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

panchangamSchema.index({ date: 1, location_key: 1 }, { unique: true });

panchangamSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    ...this.data,
    source: 'stored',
    storedAt: this.fetched_at,
  };
};

module.exports = mongoose.model('Panchangam', panchangamSchema);
