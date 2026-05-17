require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

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

// Body parsing - bigger limit because images are uploaded as base64
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cors({ origin: '*' }));

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
app.use('/api/donations', donateRoutes); // GET /api/donations alias
app.use('/api/gallery', galleryRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/admin', adminRoutes);

// 404
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
