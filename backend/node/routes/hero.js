const express = require('express');
const fs = require('fs');
const path = require('path');
const HeroImage = require('../models/HeroImage');
const { requireAdmin } = require('../middleware/auth');
const { uploadHero, ROOT } = require('../middleware/upload');

const router = express.Router();

function publicUrl(req, filename) {
  return `/api/uploads/hero/${filename}`;
}

function serialize(d) {
  return { id: d._id.toString(), url: d.url, alt: d.alt || '', order: d.order || 0 };
}

router.get('/', async (_req, res) => {
  const items = await HeroImage.find({}).sort({ order: 1, createdAt: 1 }).lean();
  res.json({ images: items.map(serialize) });
});

// POST /api/hero — JSON {url, alt}
router.post('/', requireAdmin, async (req, res) => {
  const { url, alt } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });
  const order = (await HeroImage.countDocuments()) || 0;
  const doc = await HeroImage.create({ url, alt: alt || '', order });
  res.status(201).json(serialize(doc.toObject()));
});

// POST /api/hero/upload — multipart 'images' (multiple)
router.post('/upload', requireAdmin, uploadHero.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const startOrder = (await HeroImage.countDocuments()) || 0;
    const docs = await HeroImage.insertMany(
      req.files.map((f, i) => ({
        url: publicUrl(req, f.filename),
        alt: req.body.alt || f.originalname,
        order: startOrder + i,
      }))
    );
    res.status(201).json({ images: docs.map((d) => serialize(d.toObject())) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/hero/:id — update alt and/or replace file
router.put('/:id', requireAdmin, uploadHero.single('image'), async (req, res) => {
  const doc = await HeroImage.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  if (req.file) {
    // Delete old file if it was a local upload
    if (doc.url && doc.url.startsWith('/api/uploads/hero/')) {
      const old = path.join(ROOT, 'hero', path.basename(doc.url));
      fs.unlink(old, () => {});
    }
    doc.url = publicUrl(req, req.file.filename);
  }
  if (typeof req.body.alt === 'string') doc.alt = req.body.alt;
  if (req.body.url && !req.file) doc.url = req.body.url;
  await doc.save();
  res.json(serialize(doc.toObject()));
});

// POST /api/hero/reorder  { order: [{id, order}, ...] }
router.post('/reorder', requireAdmin, async (req, res) => {
  const items = Array.isArray(req.body?.order) ? req.body.order : [];
  await Promise.all(
    items.map((it) => HeroImage.updateOne({ _id: it.id }, { $set: { order: Number(it.order) || 0 } }))
  );
  res.json({ ok: true });
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const doc = await HeroImage.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: 'not found' });
  if (doc.url && doc.url.startsWith('/api/uploads/hero/')) {
    const f = path.join(ROOT, 'hero', path.basename(doc.url));
    fs.unlink(f, () => {});
  }
  res.json({ deleted: true });
});

module.exports = router;
