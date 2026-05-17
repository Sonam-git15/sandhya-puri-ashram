const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.warn('[seed] ADMIN_EMAIL / ADMIN_PASSWORD missing — skipping admin seed');
    return;
  }

  const existing = await Admin.findOne({ email });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    await Admin.create({ email, passwordHash, name: 'Ashram Admin', role: 'admin' });
    // eslint-disable-next-line no-console
    console.log(`[seed] admin created: ${email}`);
  } else {
    // Update password if it has changed
    const matches = await bcrypt.compare(password, existing.passwordHash);
    if (!matches) {
      existing.passwordHash = await bcrypt.hash(password, 10);
      await existing.save();
      // eslint-disable-next-line no-console
      console.log(`[seed] admin password refreshed: ${email}`);
    }
  }
}

module.exports = seedAdmin;
