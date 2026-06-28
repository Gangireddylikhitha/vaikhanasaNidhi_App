const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    bookmarks: {
      type: [{
        scripture_id: { type: String, required: true },
        title_telugu: { type: String, default: '' },
        category: { type: String, default: '' },
        deity: { type: String, default: '' },
        added_at: { type: Date, default: Date.now },
      }],
      default: [],
    },
    reading_progress: {
      type: [{
        scripture_id: { type: String, required: true },
        title_telugu: { type: String, default: '' },
        category: { type: String, default: '' },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        last_verse: { type: Number, default: 0 },
        updated_at: { type: Date, default: Date.now },
      }],
      default: [],
    },
    settings: {
      themeMode: { type: String, default: 'dark' },
      fontSize: { type: String, default: 'large' },
      textColor: { type: String, default: 'bright' },
      notifyDailySloka: { type: Boolean, default: true },
      notifyPanchangam: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    role: this.role,
    name: this.name,
    username: this.username,
    logged_in: true,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
