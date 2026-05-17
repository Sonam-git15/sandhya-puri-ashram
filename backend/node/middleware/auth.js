const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET missing');
  return secret;
}

function signAccessToken(admin) {
  return jwt.sign(
    { sub: admin._id.toString(), email: admin.email, role: 'admin' },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const payload = jwt.verify(token, getJwtSecret());
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const admin = await Admin.findById(payload.sub).lean();
    if (!admin) return res.status(401).json({ error: 'Admin not found' });

    req.admin = { id: admin._id.toString(), email: admin.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAdmin, signAccessToken };
