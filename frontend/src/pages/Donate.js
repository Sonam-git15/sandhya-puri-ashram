import React, { useEffect, useState } from 'react';
import { HeartHandshake, Loader2, ShieldCheck, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import SectionHeading from '../components/SectionHeading';
import { api } from '../lib/api';
import { useLang } from '../contexts/LanguageContext';

const QUICK_AMOUNTS = [101, 501, 1100, 2100, 5100, 11000];

function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });
}

export default function Donate() {
    const { t } = useLang();
    const [form, setForm] = useState({ donorName: '', email: '', amount: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [upi, setUpi] = useState({ id: 'sandhyapuri@upi', qr: '' });
    const [upiForm, setUpiForm] = useState({ donorName: '', email: '', amount: '', upiTxnId: '' });
    const [upiSubmitting, setUpiSubmitting] = useState(false);

    useEffect(() => {
        api.get('/admin/public-settings')
            .then((r) => {
                setUpi({
                    id: r.data?.upi_id || 'sandhyapuri@upi',
                    qr: r.data?.upi_qr_url || '',
                });
            })
            .catch(() => {});
    }, []);

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleDonate = async (e) => {
        e.preventDefault();
        const amt = Number(form.amount);
        if (!form.donorName || !form.email || !amt || amt < 1) {
            toast.error('Please enter your name, email and a valid amount.');
            return;
        }
        try {
            setSubmitting(true);
            const { data } = await api.post('/donate/create-order', {
                donorName: form.donorName,
                email: form.email,
                amount: amt,
                message: form.message,
            });

            if (data.mock) {
                // MOCK FLOW — verify immediately and show success
                const verify = await api.post('/donate/verify', {
                    razorpay_order_id: data.order.id,
                    razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).slice(2),
                    razorpay_signature: 'sig_mock',
                });
                if (verify.data.verified) {
                    setSuccess({
                        amount: amt,
                        donorName: form.donorName,
                        donationId: verify.data.donationId,
                        mock: true,
                    });
                    toast.success('Donation recorded (MOCK MODE).');
                    setForm({ donorName: '', email: '', amount: '', message: '' });
                }
                return;
            }

            // Real Razorpay flow
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                toast.error('Unable to load Razorpay. Please check your connection.');
                return;
            }
            const rzp = new window.Razorpay({
                key: data.keyId,
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'Sandhya Puri Sanyas Ashram',
                description: 'Seva Donation',
                order_id: data.order.id,
                prefill: { name: form.donorName, email: form.email },
                theme: { color: '#E86A33' },
                handler: async (resp) => {
                    try {
                        const v = await api.post('/donate/verify', resp);
                        if (v.data.verified) {
                            setSuccess({
                                amount: amt,
                                donorName: form.donorName,
                                donationId: v.data.donationId,
                                mock: false,
                            });
                            toast.success('Thank you for your seva-yogdaan.');
                            setForm({ donorName: '', email: '', amount: '', message: '' });
                        } else {
                            toast.error('Payment verification failed.');
                        }
                    } catch {
                        toast.error('Payment verification failed.');
                    }
                },
                modal: {
                    ondismiss: () => toast.message('Payment cancelled.'),
                },
            });
            rzp.open();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Could not start donation.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpiRecord = async (e) => {
        e.preventDefault();
        if (!upiForm.donorName || !upiForm.email || !upiForm.amount || !upiForm.upiTxnId) {
            toast.error('Please fill all UPI fields.');
            return;
        }
        try {
            setUpiSubmitting(true);
            await api.post('/donate/upi-record', upiForm);
            toast.success('UPI donation recorded. Thank you.');
            setUpiForm({ donorName: '', email: '', amount: '', upiTxnId: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Could not record donation.');
        } finally {
            setUpiSubmitting(false);
        }
    };

    const upiPayUri = `upi://pay?pa=${encodeURIComponent(upi.id)}&pn=${encodeURIComponent('Sandhya Puri Sanyas Ashram')}&cu=INR`;
    const generatedQr =
        upi.qr ||
        `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=10&data=${encodeURIComponent(
            upiPayUri
        )}`;

    return (
        <div data-testid="donate-page" className="relative">
            <section className="relative py-20 sm:py-28 bg-ashram-bg overflow-hidden">
                <div className="om-watermark" aria-hidden>ॐ</div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                    <SectionHeading
                        label={t('donate_label')}
                        title={t('donate_heading')}
                    />

                    <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                        {/* LEFT: Razorpay form */}
                        <div className="rounded-3xl border border-ashram-border bg-white p-6 sm:p-8 shadow-[0_18px_60px_rgba(232,106,51,0.08)]">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-ashram-saffron/10 text-ashram-saffron">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <div className="font-display text-xl text-ashram-ink">Online Donation</div>
                                    <div className="text-xs tracking-label !text-ashram-inkSoft mt-1">{t('donate_left_sub')}</div>
                                </div>
                            </div>

                            {success ? (
                                <div className="mt-8 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center" data-testid="donate-success">
                                    <div className="text-emerald-700 font-display text-2xl">Thank you, {success.donorName}!</div>
                                    <p className="mt-2 text-emerald-700/80">
                                        Your seva of ₹{success.amount} has been recorded.
                                        {success.mock && <span className="block text-xs mt-2 italic">(MOCK MODE — no actual payment was processed.)</span>}
                                    </p>
                                    <p className="mt-3 text-xs text-emerald-700/60">Donation ID: {success.donationId}</p>
                                    <button
                                        type="button"
                                        className="mt-6 btn-outline-gold"
                                        onClick={() => setSuccess(null)}
                                        data-testid="donate-new-btn"
                                    >
                                        Donate Again
                                    </button>
                                </div>
                            ) : (
                                <form className="mt-6 space-y-5" onSubmit={handleDonate} data-testid="donate-form">
                                    <div>
                                        <label className="text-sm font-medium">Donor Name</label>
                                        <input
                                            name="donorName"
                                            required
                                            value={form.donorName}
                                            onChange={handleChange}
                                            className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm focus:outline-none focus:border-ashram-saffron transition-colors duration-500"
                                            placeholder="Your full name"
                                            data-testid="donate-name-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Email</label>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={handleChange}
                                            className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm focus:outline-none focus:border-ashram-saffron transition-colors duration-500"
                                            placeholder="you@example.com"
                                            data-testid="donate-email-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Custom Amount (₹)</label>
                                        <input
                                            name="amount"
                                            type="number"
                                            min="1"
                                            required
                                            value={form.amount}
                                            onChange={handleChange}
                                            className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm focus:outline-none focus:border-ashram-saffron transition-colors duration-500"
                                            placeholder="e.g. 501"
                                            data-testid="donate-amount-input"
                                        />
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {QUICK_AMOUNTS.map((a) => (
                                                <button
                                                    key={a}
                                                    type="button"
                                                    onClick={() => setForm((f) => ({ ...f, amount: String(a) }))}
                                                    className="px-3 py-1.5 text-xs rounded-full border border-ashram-border hover:border-ashram-saffron hover:text-ashram-saffron transition-colors duration-500"
                                                    data-testid={`donate-quick-${a}`}
                                                >
                                                    ₹{a.toLocaleString()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Message (optional)</label>
                                        <textarea
                                            name="message"
                                            rows={3}
                                            value={form.message}
                                            onChange={handleChange}
                                            className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm focus:outline-none focus:border-ashram-saffron resize-none transition-colors duration-500"
                                            placeholder="A few words for the ashram…"
                                            data-testid="donate-message-input"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn-saffron w-full justify-center disabled:opacity-60"
                                        data-testid="donate-submit-btn"
                                    >
                                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <HeartHandshake size={16} />}
                                        {submitting ? 'Processing…' : 'Donate Now'}
                                    </button>
                                    <p className="text-[11px] text-ashram-inkSoft/80 text-center">
                                        Secure payment processed via Razorpay. We never store card details.
                                    </p>
                                </form>
                            )}
                        </div>

                        {/* RIGHT: UPI QR */}
                        <div className="rounded-3xl border border-ashram-gold/40 bg-gradient-to-br from-[#FFF8EC] to-white p-6 sm:p-8" data-testid="donate-upi-section">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-ashram-gold/15 text-ashram-gold">
                                    <QrCode size={20} />
                                </div>
                                <div>
                                    <div className="font-display text-xl text-ashram-ink">Quick UPI Donate</div>
                                    <div className="text-xs tracking-label !text-ashram-inkSoft mt-1">{t('donate_right_sub')}</div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col items-center">
                                <div className="rounded-2xl bg-white p-4 border border-ashram-border">
                                    <img
                                        src={generatedQr}
                                        alt="UPI QR code"
                                        className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                                        data-testid="upi-qr-image"
                                    />
                                </div>
                                <div className="mt-4 text-center text-sm text-ashram-ink font-devanagari">
                                    {t('scan_to_donate')}
                                </div>
                                <div className="mt-2 text-xs text-ashram-inkSoft tracking-wide">
                                    UPI ID:&nbsp;<span className="text-ashram-saffron font-medium" data-testid="upi-id-text">{upi.id}</span>
                                </div>
                                <div className="mt-3 flex flex-wrap justify-center gap-2 text-[10px] text-ashram-inkSoft/80 uppercase tracking-[0.2em]">
                                    <span>PhonePe</span><span>•</span><span>Google Pay</span><span>•</span><span>Paytm</span>
                                </div>
                            </div>

                            {/* Optional: record UPI transaction */}
                            <details className="mt-6 group" data-testid="upi-record-toggle">
                                <summary className="cursor-pointer text-sm font-medium text-ashram-saffron hover:text-ashram-saffronDeep transition-colors duration-500">
                                    Already paid via UPI? Record your transaction →
                                </summary>
                                <form className="mt-4 space-y-3" onSubmit={handleUpiRecord} data-testid="upi-record-form">
                                    <input
                                        placeholder="Your name"
                                        required
                                        value={upiForm.donorName}
                                        onChange={(e) => setUpiForm((f) => ({ ...f, donorName: e.target.value }))}
                                        className="w-full rounded-lg border border-ashram-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-ashram-saffron"
                                        data-testid="upi-name-input"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        required
                                        value={upiForm.email}
                                        onChange={(e) => setUpiForm((f) => ({ ...f, email: e.target.value }))}
                                        className="w-full rounded-lg border border-ashram-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-ashram-saffron"
                                        data-testid="upi-email-input"
                                    />
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Amount (₹)"
                                        required
                                        value={upiForm.amount}
                                        onChange={(e) => setUpiForm((f) => ({ ...f, amount: e.target.value }))}
                                        className="w-full rounded-lg border border-ashram-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-ashram-saffron"
                                        data-testid="upi-amount-input"
                                    />
                                    <input
                                        placeholder="UPI Transaction ID"
                                        required
                                        value={upiForm.upiTxnId}
                                        onChange={(e) => setUpiForm((f) => ({ ...f, upiTxnId: e.target.value }))}
                                        className="w-full rounded-lg border border-ashram-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-ashram-saffron"
                                        data-testid="upi-txn-input"
                                    />
                                    <button
                                        type="submit"
                                        disabled={upiSubmitting}
                                        className="btn-outline-gold w-full justify-center text-sm disabled:opacity-60"
                                        data-testid="upi-submit-btn"
                                    >
                                        {upiSubmitting ? 'Recording…' : 'Record UPI Donation'}
                                    </button>
                                </form>
                            </details>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
