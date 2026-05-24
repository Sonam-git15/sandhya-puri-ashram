require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const seedAdmin = require('./utils/seed');
const seedDefaults = require('./utils/seedDefaults');

const authRoutes = require('./routes/auth');
const donateRoutes = require('./routes/donate');
const galleryRoutes = require('./routes/gallery');
const heroRoutes = require('./routes/hero');
const activitiesRoutes = require('./routes/activities');
const contactRoutes = require('./routes/contact');
const videoRoutes = require('./routes/video');
const adminRoutes = require('./routes/admin');

const app = express();

// Body parsing  (multipart bypasses this — multer handles it)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cors({ origin: '*' }));

// Static — serve uploaded files
const uploadsRoot = path.resolve(__dirname, 'uploads');
fs.mkdirSync(uploadsRoot, { recursive: true });
for (const sub of ['gallery', 'hero', 'activities', 'videos']) {
  fs.mkdirSync(path.join(uploadsRoot, sub), { recursive: true });
}
app.use('/api/uploads', express.static(uploadsRoot, { maxAge: '7d', fallthrough: true }));

// Health
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Sandhya Puri Sanyas Ashram',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    razorpay_mode: process.env.RAZORPAY_MODE || 'mock',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donate', donateRoutes);
app.use('/api/donations', donateRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/admin', adminRoutes);

// 404 for unknown /api routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

// Error handler
app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error('[error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 8002;

(async () => {
  await connectDB();
  await seedAdmin();
  await seedDefaults();
  app.listen(PORT, '127.0.0.1', () => {
    // eslint-disable-next-line no-console
    console.log(`[node] Express listening on 127.0.0.1:${PORT}`);
  });
})();
