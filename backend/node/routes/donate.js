const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Donation = require('../models/Donation');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const MODE = (process.env.RAZORPAY_MODE || 'mock').toLowerCase();
const isMock = MODE === 'mock' || !KEY_ID || !KEY_SECRET;

const rzp = isMock ? null : new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

// POST /api/donate/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { donorName, email, amount, message } = req.body || {};
    const amt = Number(amount);
    if (!donorName || !email || !amt || amt < 1) {
      return res.status(400).json({ error: 'donorName, email and a valid amount are required' });
    }

    if (isMock) {
      const orderId = 'order_mock_' + crypto.randomBytes(8).toString('hex');
      await Donation.create({
        donorName,
        email,
        amount: amt,
        message: message || '',
        orderId,
        paymentStatus: 'created',
        mode: 'mock',
      });
      return res.json({
        mock: true,
        order: { id: orderId, amount: amt * 100, currency: 'INR', status: 'created' },
        keyId: 'rzp_test_mock',
        message:
          'MOCK MODE — Razorpay keys not configured. Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET in backend/.env and RAZORPAY_MODE=live to use real payments.',
      });
    }

    const order = await rzp.orders.create({
      amount: Math.round(amt * 100),
      currency: 'INR',
      receipt: 'rcpt_' + Date.now(),
      payment_capture: 1,
    });

    await Donation.create({
      donorName,
      email,
      amount: amt,
      message: message || '',
      orderId: order.id,
      paymentStatus: 'created',
      mode: 'razorpay',
    });

    return res.json({ mock: false, order, keyId: KEY_ID });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Failed to create order' });
  }
});

// POST /api/donate/verify
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id) return res.status(400).json({ error: 'razorpay_order_id required' });

    const donation = await Donation.findOne({ orderId: razorpay_order_id });
    if (!donation) return res.status(404).json({ error: 'Order not found' });

    if (isMock || donation.mode === 'mock') {
      donation.paymentId = razorpay_payment_id || 'pay_mock_' + crypto.randomBytes(6).toString('hex');
      donation.signature = razorpay_signature || 'sig_mock';
      donation.paymentStatus = 'mock_paid';
      await donation.save();
      return res.json({ verified: true, mock: true, donationId: donation._id.toString() });
    }

    const expected = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      donation.paymentStatus = 'failed';
      await donation.save();
      return res.status(400).json({ verified: false, error: 'Signature mismatch' });
    }

    donation.paymentId = razorpay_payment_id;
    donation.signature = razorpay_signature;
    donation.paymentStatus = 'paid';
    await donation.save();
    return res.json({ verified: true, mock: false, donationId: donation._id.toString() });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Verification failed' });
  }
});

// POST /api/donate/upi-record  — record manual UPI donation
router.post('/upi-record', async (req, res) => {
  try {
    const { donorName, email, amount, upiTxnId, message } = req.body || {};
    if (!donorName || !email || !amount || !upiTxnId) {
      return res.status(400).json({ error: 'donorName, email, amount, upiTxnId required' });
    }
    const donation = await Donation.create({
      donorName,
      email,
      amount: Number(amount),
      message: message || '',
      upiTxnId,
      paymentStatus: 'paid',
      mode: 'upi_manual',
    });
    res.json({ ok: true, donationId: donation._id.toString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/donate or /api/donations (admin only)
router.get('/', requireAdmin, async (req, res) => {
  const { from, to } = req.query;
  const q = {};
  if (from || to) {
    q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(to);
  }
  const list = await Donation.find(q).sort({ createdAt: -1 }).lean();
  const safe = list.map((d) => ({
    id: d._id.toString(),
    donorName: d.donorName,
    email: d.email,
    amount: d.amount,
    message: d.message,
    orderId: d.orderId,
    paymentId: d.paymentId,
    paymentStatus: d.paymentStatus,
    mode: d.mode,
    upiTxnId: d.upiTxnId,
    createdAt: d.createdAt,
  }));
  res.json({ donations: safe, count: safe.length });
});

module.exports = router;
