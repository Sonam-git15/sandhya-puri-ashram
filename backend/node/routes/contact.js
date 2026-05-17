const express = require('express');
const ContactSubmission = require('../models/ContactSubmission');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s));
}

// POST /api/contact
router.post('/', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }
  if (!isEmail(email)) return res.status(400).json({ error: 'invalid email' });
  if (String(message).trim().length < 5) {
    return res.status(400).json({ error: 'message too short' });
  }
  const doc = await ContactSubmission.create({
    name: String(name).trim(),
    email: String(email).toLowerCase().trim(),
    message: String(message).trim(),
  });
  res.status(201).json({ ok: true, id: doc._id.toString() });
});

// GET /api/contact (admin)
router.get('/', requireAdmin, async (_req, res) => {
  const items = await ContactSubmission.find({}).sort({ createdAt: -1 }).lean();
  res.json({
    submissions: items.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      email: d.email,
      message: d.message,
      read: !!d.read,
      createdAt: d.createdAt,
    })),
  });
});

module.exports = router;
