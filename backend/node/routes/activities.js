const express = require('express');
const ActivityImage = require('../models/ActivityImage');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

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

router.delete('/:id', requireAdmin, async (req, res) => {
  const r = await ActivityImage.findByIdAndDelete(req.params.id);
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json({ deleted: true });
});

module.exports = router;
