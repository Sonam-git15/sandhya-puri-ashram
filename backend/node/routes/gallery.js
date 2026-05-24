const express = require('express');
const fs = require('fs');
const path = require('path');
const GalleryImage = require('../models/GalleryImage');
const { requireAdmin } = require('../middleware/auth');
const { uploadGallery, ROOT } = require('../middleware/upload');

const router = express.Router();

function publicUrl(filename) {
  return `/api/uploads/gallery/${filename}`;
}

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

// POST /api/gallery (admin)  JSON { url, caption } — legacy URL-based add
router.post('/', requireAdmin, async (req, res) => {
  const { url, caption } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });
  const order = (await GalleryImage.countDocuments()) || 0;
  const doc = await GalleryImage.create({ url, caption: caption || '', order });
  res.status(201).json(serialize(doc.toObject()));
});

// POST /api/gallery/upload — multipart 'images' (multiple)
router.post('/upload', requireAdmin, uploadGallery.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const startOrder = (await GalleryImage.countDocuments()) || 0;
    const captionsRaw = req.body.captions || '';
    const captions = Array.isArray(captionsRaw)
      ? captionsRaw
      : typeof captionsRaw === 'string' && captionsRaw.length
      ? captionsRaw.split('|||')
      : [];
    const docs = await GalleryImage.insertMany(
      req.files.map((f, i) => ({
        url: publicUrl(f.filename),
        caption: captions[i] || '',
        order: startOrder + i,
      }))
    );
    res.status(201).json({ images: docs.map((d) => serialize(d.toObject())) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/gallery/:id — update caption and/or replace image
router.put('/:id', requireAdmin, uploadGallery.single('image'), async (req, res) => {
  const doc = await GalleryImage.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  if (req.file) {
    if (doc.url && doc.url.startsWith('/api/uploads/gallery/')) {
      const old = path.join(ROOT, 'gallery', path.basename(doc.url));
      fs.unlink(old, () => {});
    }
    doc.url = publicUrl(req.file.filename);
  }
  if (typeof req.body.caption === 'string') doc.caption = req.body.caption;
  if (req.body.url && !req.file) doc.url = req.body.url;
  await doc.save();
  res.json(serialize(doc.toObject()));
});

// POST /api/gallery/reorder
router.post('/reorder', requireAdmin, async (req, res) => {
  const items = Array.isArray(req.body?.order) ? req.body.order : [];
  await Promise.all(
    items.map((it) => GalleryImage.updateOne({ _id: it.id }, { $set: { order: Number(it.order) || 0 } }))
  );
  res.json({ ok: true });
});

// DELETE /api/gallery/:id (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  const doc = await GalleryImage.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: 'not found' });
  if (doc.url && doc.url.startsWith('/api/uploads/gallery/')) {
    const f = path.join(ROOT, 'gallery', path.basename(doc.url));
    fs.unlink(f, () => {});
  }
  res.json({ deleted: true });
});

module.exports = router;
