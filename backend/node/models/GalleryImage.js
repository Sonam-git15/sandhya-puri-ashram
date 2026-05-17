const mongoose = require('mongoose');

const GalleryImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true }, // remote URL or data URL
    caption: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryImage', GalleryImageSchema);
