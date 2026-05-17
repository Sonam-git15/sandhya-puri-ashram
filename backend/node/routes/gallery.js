const express = require('express');
const GalleryImage = require('../models/GalleryImage');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

function serialize(d) {
  return {
    id: d._id.toString(),
    url: d.url,
    caption: d.caption || '',
    order: d.order || 0,
    createdAt: d.createdAt,
  };
}

// GET /api/gallery?page=1&limit=9
router.get('/', async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 9, 1), 50);
  const skip = (page - 1) * limit;
  const total = await GalleryImage.countDocuments();
  const items = await GalleryImage.find({})
    .sort({ order: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  res.json({
    images: items.map(serialize),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

// POST /api/gallery (admin)  { url, caption }
router.post('/', requireAdmin, async (req, res) => {
  const { url, caption } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });
  const order = (await GalleryImage.countDocuments()) || 0;
  const doc = await GalleryImage.create({ url, caption: caption || '', order });
  res.status(201).json(serialize(doc.toObject()));
});

// DELETE /api/gallery/:id (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  const r = await GalleryImage.findByIdAndDelete(req.params.id);
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json({ deleted: true });
});

module.exports = router;
