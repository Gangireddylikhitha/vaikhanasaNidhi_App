const mongoose = require('mongoose');

const verificationApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    full_name: { type: String, required: true, trim: true },
    gothram: { type: String, required: true, trim: true },
    kalpasutram: { type: String, required: true, trim: true },
    veda_shakha: { type: String, default: '', trim: true },
    native_place: { type: String, required: true, trim: true },
    whatsapp: { type: String, required: true, trim: true },
    temple_reference: { type: String, default: '', trim: true },
    proof_url: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    admin_note: { type: String, default: '' },
    reviewed_at: { type: Date },
  },
  { timestamps: true }
);

verificationApplicationSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    user_id: this.user?.toString?.() || String(this.user),
    full_name: this.full_name,
    gothram: this.gothram,
    kalpasutram: this.kalpasutram,
    veda_shakha: this.veda_shakha,
    native_place: this.native_place,
    whatsapp: this.whatsapp,
    temple_reference: this.temple_reference,
    proof_url: this.proof_url,
    status: this.status,
    admin_note: this.admin_note,
    submitted_at: this.createdAt,
    reviewed_at: this.reviewed_at,
  };
};

const VerificationApplication = mongoose.model('VerificationApplication', verificationApplicationSchema);

module.exports = VerificationApplication;
