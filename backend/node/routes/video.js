const express = require('express');
const Setting = require('../models/Setting');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/video — public; returns about-page video URL
router.get('/', async (_req, res) => {
  const s = await Setting.findOne({ key: 'about_video_url' }).lean();
  res.json({ url: s ? s.value : '' });
});

// POST /api/video (admin)  { url }
router.post('/', requireAdmin, async (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });
  await Setting.findOneAndUpdate(
    { key: 'about_video_url' },
    { key: 'about_video_url', value: url },
    { upsert: true, new: true }
  );
  res.json({ ok: true, url });
});

module.exports = router;
