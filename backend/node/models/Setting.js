const mongoose = require('mongoose');

// Key-value settings (about video URL, UPI ID, QR image URL, etc.)
const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', SettingSchema);
