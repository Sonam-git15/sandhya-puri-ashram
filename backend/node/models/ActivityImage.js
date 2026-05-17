const mongoose = require('mongoose');

const ActivityImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    titleKey: { type: String, default: '' }, // e.g. sandhya_aarti
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityImage', ActivityImageSchema);
