const express = require('express');
const Donation = require('../models/Donation');
const ContactSubmission = require('../models/ContactSubmission');
const Setting = require('../models/Setting');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', requireAdmin, async (_req, res) => {
  const totalDonations = await Donation.countDocuments({
    paymentStatus: { $in: ['paid', 'mock_paid'] },
  });
  const totalAmountAgg = await Donation.aggregate([
    { $match: { paymentStatus: { $in: ['paid', 'mock_paid'] } } },
    { $group: { _id: null, sum: { $sum: '$amount' } } },
  ]);
  const totalAmount = totalAmountAgg.length ? totalAmountAgg[0].sum : 0;
  const totalSubmissions = await ContactSubmission.countDocuments();
  res.json({ totalDonations, totalAmount, totalSubmissions });
});

// GET /api/admin/donations/export
router.get('/donations/export', requireAdmin, async (_req, res) => {
  const list = await Donation.find({}).sort({ createdAt: -1 }).lean();
  const header = [
    'createdAt', 'donorName', 'email', 'amount', 'paymentStatus',
    'mode', 'orderId', 'paymentId', 'upiTxnId', 'message',
  ];
  const lines = [header.join(',')];
  for (const d of list) {
    lines.push(
      header.map((k) => {
        const v = d[k] == null ? '' : String(d[k]).replace(/"/g, '""');
        return `"${v}"`;
      }).join(',')
    );
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="donations_${Date.now()}.csv"`);
  res.send(lines.join('\n'));
});

router.get('/settings/:key', requireAdmin, async (req, res) => {
  const s = await Setting.findOne({ key: req.params.key }).lean();
  res.json({ key: req.params.key, value: s ? s.value : null });
});

router.put('/settings/:key', requireAdmin, async (req, res) => {
  const { value } = req.body || {};
  await Setting.findOneAndUpdate(
    { key: req.params.key },
    { key: req.params.key, value },
    { upsert: true, new: true }
  );
  res.json({ ok: true });
});

// GET /api/admin/public-settings — public for donate / contact pages
router.get('/public-settings', async (_req, res) => {
  const keys = ['upi_id', 'upi_qr_url', 'phone', 'whatsapp'];
  const docs = await Setting.find({ key: { $in: keys } }).lean();
  const map = {};
  for (const d of docs) map[d.key] = d.value;
  res.json({
    upi_id: map.upi_id || 'sandhyapuri@upi',
    upi_qr_url: map.upi_qr_url || '',
    phone: map.phone || process.env.ASHRAM_PHONE || '',
    whatsapp: map.whatsapp || process.env.ASHRAM_WHATSAPP || '',
    lat: Number(process.env.ASHRAM_LAT) || 28.6293963,
    lng: Number(process.env.ASHRAM_LNG) || 77.2474045,
  });
});

module.exports = router;
