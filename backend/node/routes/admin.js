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

// GET /api/admin/donations/export?format=csv
router.get('/donations/export', requireAdmin, async (req, res) => {
  const list = await Donation.find({}).sort({ createdAt: -1 }).lean();
  const header = [
    'createdAt',
    'donorName',
    'email',
    'amount',
    'paymentStatus',
    'mode',
    'orderId',
    'paymentId',
    'upiTxnId',
    'message',
  ];
  const lines = [header.join(',')];
  for (const d of list) {
    lines.push(
      header
        .map((k) => {
          const v = d[k] == null ? '' : String(d[k]).replace(/"/g, '""');
          return `"${v}"`;
        })
        .join(',')
    );
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="donations_${Date.now()}.csv"`
  );
  res.send(lines.join('\n'));
});

// GET /api/admin/settings/:key
router.get('/settings/:key', requireAdmin, async (req, res) => {
  const s = await Setting.findOne({ key: req.params.key }).lean();
  res.json({ key: req.params.key, value: s ? s.value : null });
});

// PUT /api/admin/settings/:key  { value }
router.put('/settings/:key', requireAdmin, async (req, res) => {
  const { value } = req.body || {};
  await Setting.findOneAndUpdate(
    { key: req.params.key },
    { key: req.params.key, value },
    { upsert: true, new: true }
  );
  res.json({ ok: true });
});

// GET /api/admin/settings (public-ish: upi id for donate page)
router.get('/public-settings', async (_req, res) => {
  const upi = await Setting.findOne({ key: 'upi_id' }).lean();
  const qr = await Setting.findOne({ key: 'upi_qr_url' }).lean();
  res.json({
    upi_id: upi ? upi.value : 'sandhyapuri@upi',
    upi_qr_url: qr ? qr.value : '',
  });
});

module.exports = router;
