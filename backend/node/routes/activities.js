const express = require('express');
const fs = require('fs');
const path = require('path');
const ActivityImage = require('../models/ActivityImage');
const { requireAdmin } = require('../middleware/auth');
const { uploadActivities, ROOT } = require('../middleware/upload');

const router = express.Router();

function publicUrl(filename) {
  return `/api/uploads/activities/${filename}`;
}

function serialize(d) {
  return {
    id: d._id.toString(),
    url: d.url,
    titleKey: d.titleKey || '',
    title: d.title || '',
    description: d.description || '',
    order: d.order || 0,
  };
}

router.get('/', async (_req, res) => {
  const items = await ActivityImage.find({}).sort({ order: 1, createdAt: 1 }).lean();
  res.json({ activities: items.map(serialize) });
});

router.post('/', requireAdmin, async (req, res) => {
  const { url, title, titleKey, description } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });
  const order = (await ActivityImage.countDocuments()) || 0;
  const doc = await ActivityImage.create({
    url,
    title: title || '',
    titleKey: titleKey || '',
    description: description || '',
    order,
  });
  res.status(201).json(serialize(doc.toObject()));
});

// POST /api/activities/upload — multipart 'image', plus title/description body
router.post('/upload', requireAdmin, uploadActivities.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const order = (await ActivityImage.countDocuments()) || 0;
    const doc = await ActivityImage.create({
      url: publicUrl(req.file.filename),
      title: req.body.title || '',
      titleKey: req.body.titleKey || '',
      description: req.body.description || '',
      order,
    });
    res.status(201).json(serialize(doc.toObject()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/activities/:id
router.put('/:id', requireAdmin, uploadActivities.single('image'), async (req, res) => {
  const doc = await ActivityImage.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  if (req.file) {
    if (doc.url && doc.url.startsWith('/api/uploads/activities/')) {
      const old = path.join(ROOT, 'activities', path.basename(doc.url));
      fs.unlink(old, () => {});
    }
    doc.url = publicUrl(req.file.filename);
  }
  if (typeof req.body.title === 'string') doc.title = req.body.title;
  if (typeof req.body.description === 'string') doc.description = req.body.description;
  if (typeof req.body.titleKey === 'string') doc.titleKey = req.body.titleKey;
  if (req.body.url && !req.file) doc.url = req.body.url;
  await doc.save();
  res.json(serialize(doc.toObject()));
});

// POST /api/activities/reorder
router.post('/reorder', requireAdmin, async (req, res) => {
  const items = Array.isArray(req.body?.order) ? req.body.order : [];
  await Promise.all(
    items.map((it) =>
      ActivityImage.updateOne({ _id: it.id }, { $set: { order: Number(it.order) || 0 } })
    )
  );
  res.json({ ok: true });
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const doc = await ActivityImage.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: 'not found' });
  if (doc.url && doc.url.startsWith('/api/uploads/activities/')) {
    const f = path.join(ROOT, 'activities', path.basename(doc.url));
    fs.unlink(f, () => {});
  }
  res.json({ deleted: true });
});

module.exports = router;
