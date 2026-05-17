const express = require('express');
const HeroImage = require('../models/HeroImage');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

function serialize(d) {
  return { id: d._id.toString(), url: d.url, alt: d.alt || '', order: d.order || 0 };
}

router.get('/', async (_req, res) => {
  const items = await HeroImage.find({}).sort({ order: 1, createdAt: 1 }).lean();
  res.json({ images: items.map(serialize) });
});

router.post('/', requireAdmin, async (req, res) => {
  const { url, alt } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });
  const order = (await HeroImage.countDocuments()) || 0;
  const doc = await HeroImage.create({ url, alt: alt || '', order });
  res.status(201).json(serialize(doc.toObject()));
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const r = await HeroImage.findByIdAndDelete(req.params.id);
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json({ deleted: true });
});

module.exports = router;
