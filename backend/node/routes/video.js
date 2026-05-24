const express = require('express');
const fs = require('fs');
const path = require('path');
const Setting = require('../models/Setting');
const { requireAdmin } = require('../middleware/auth');
const { uploadVideos, ROOT } = require('../middleware/upload');

const router = express.Router();

// GET /api/video — public; returns about-page video URL
router.get('/', async (_req, res) => {
  const s = await Setting.findOne({ key: 'about_video_url' }).lean();
  res.json({ url: s ? s.value : '' });
});

// POST /api/video (admin) JSON { url } — YouTube/Vimeo/embed URL
router.post('/', requireAdmin, async (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });
  // If replacing a previously uploaded file, delete it
  const current = await Setting.findOne({ key: 'about_video_url' });
  if (current && typeof current.value === 'string' && current.value.startsWith('/api/uploads/videos/')) {
    const f = path.join(ROOT, 'videos', path.basename(current.value));
    fs.unlink(f, () => {});
  }
  await Setting.findOneAndUpdate(
    { key: 'about_video_url' },
    { key: 'about_video_url', value: url },
    { upsert: true, new: true }
  );
  res.json({ ok: true, url });
});

// POST /api/video/upload — multipart 'video' (single)
router.post('/upload', requireAdmin, uploadVideos.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/api/uploads/videos/${req.file.filename}`;
    // Delete old uploaded file if exists
    const current = await Setting.findOne({ key: 'about_video_url' });
    if (current && typeof current.value === 'string' && current.value.startsWith('/api/uploads/videos/')) {
      const old = path.join(ROOT, 'videos', path.basename(current.value));
      fs.unlink(old, () => {});
    }
    await Setting.findOneAndUpdate(
      { key: 'about_video_url' },
      { key: 'about_video_url', value: url },
      { upsert: true, new: true }
    );
    res.status(201).json({ ok: true, url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/video — clear the video setting
router.delete('/', requireAdmin, async (_req, res) => {
  const current = await Setting.findOne({ key: 'about_video_url' });
  if (current && typeof current.value === 'string' && current.value.startsWith('/api/uploads/videos/')) {
    const f = path.join(ROOT, 'videos', path.basename(current.value));
    fs.unlink(f, () => {});
  }
  await Setting.findOneAndUpdate(
    { key: 'about_video_url' },
    { key: 'about_video_url', value: '' },
    { upsert: true, new: true }
  );
  res.json({ ok: true });
});

module.exports = router;
