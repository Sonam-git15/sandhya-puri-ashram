const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    amount: { type: Number, required: true, min: 1 }, // INR rupees
    message: { type: String, default: '' },
    orderId: { type: String, index: true },
    paymentId: { type: String, default: '' },
    signature: { type: String, default: '' },
    paymentStatus: {
      type: String,
      enum: ['created', 'paid', 'failed', 'mock_paid'],
      default: 'created',
    },
    mode: { type: String, enum: ['razorpay', 'upi_manual', 'mock'], default: 'razorpay' },
    upiTxnId: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Donation', DonationSchema);
