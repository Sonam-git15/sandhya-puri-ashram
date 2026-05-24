const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const PasswordResetToken = require('../models/PasswordResetToken');
const { signAccessToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]:;"'<>,.?/\\|`~])[A-Za-z\d!@#$%^&*()_+\-={}[\]:;"'<>,.?/\\|`~]{8,}$/;

// In-memory recent-resets log so the admin UI can show the latest reset link
// (since we are skipping email sending per user choice).
const RECENT_RESETS = []; // newest first; max 20

function pushRecentReset(entry) {
  RECENT_RESETS.unshift(entry);
  if (RECENT_RESETS.length > 20) RECENT_RESETS.length = 20;
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signAccessToken(admin);
  return res.json({
    token,
    admin: { id: admin._id.toString(), email: admin.email, name: admin.name, role: admin.role },
  });
});

// GET /api/auth/me
router.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

// POST /api/auth/forgot-password   { email }
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });
  const normalized = String(email).toLowerCase().trim();

  // Always return ok to avoid email enumeration. Only generate token if admin exists.
  const admin = await Admin.findOne({ email: normalized });
  if (admin) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await PasswordResetToken.create({ adminId: admin._id, token, expiresAt });

    const base = process.env.PUBLIC_BASE_URL || '';
    const resetUrl = `${base}/admin/reset-password/${token}`;

    pushRecentReset({
      email: normalized,
      token,
      resetUrl,
      expiresAt,
      createdAt: new Date(),
    });

    // eslint-disable-next-line no-console
    console.log('\n[forgot-password] Reset link for', normalized);
    // eslint-disable-next-line no-console
    console.log('[forgot-password]', resetUrl);
    // eslint-disable-next-line no-console
    console.log('[forgot-password] expires at', expiresAt.toISOString(), '\n');
  }

  res.json({
    ok: true,
    message:
      'If an admin account exists for that email, a password reset link has been generated. Check the Admin → Recent Resets panel or server logs (email sending is disabled in this build).',
  });
});

// GET /api/auth/reset-password/:token — validate token (used by UI before showing form)
router.get('/reset-password/:token', async (req, res) => {
  const doc = await PasswordResetToken.findOne({ token: req.params.token }).lean();
  if (!doc) return res.status(404).json({ valid: false, error: 'Invalid token' });
  if (doc.used) return res.status(400).json({ valid: false, error: 'Token already used' });
  if (new Date(doc.expiresAt).getTime() < Date.now())
    return res.status(400).json({ valid: false, error: 'Token expired' });
  res.json({ valid: true });
});

// POST /api/auth/reset-password  { token, password }
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ error: 'token and password required' });

  if (!PASSWORD_RULE.test(password)) {
    return res.status(400).json({
      error:
        'Password must be at least 8 characters and include one uppercase letter, one number and one special character.',
    });
  }

  const doc = await PasswordResetToken.findOne({ token });
  if (!doc) return res.status(404).json({ error: 'Invalid token' });
  if (doc.used) return res.status(400).json({ error: 'Token already used' });
  if (doc.expiresAt.getTime() < Date.now())
    return res.status(400).json({ error: 'Token expired' });

  const admin = await Admin.findById(doc.adminId);
  if (!admin) return res.status(404).json({ error: 'Admin not found' });

  admin.passwordHash = await bcrypt.hash(password, 10);
  await admin.save();
  doc.used = true;
  await doc.save();

  res.json({ ok: true });
});

// GET /api/auth/recent-resets (admin) — list of recent reset requests (because we skip emails)
router.get('/recent-resets', requireAdmin, (_req, res) => {
  res.json({ resets: RECENT_RESETS });
});

module.exports = router;
