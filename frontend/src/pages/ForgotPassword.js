import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your registered email');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }
        try {
            setBusy(true);
            await api.post('/auth/forgot-password', { email });
            setDone(true);
            toast.success('Request received');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Could not process request');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen bg-ashram-bg flex items-center justify-center p-4 relative overflow-hidden" data-testid="forgot-password-page">
            <div className="om-watermark" aria-hidden>ॐ</div>
            <div className="relative w-full max-w-md">
                <Link to="/admin/login" className="inline-flex items-center gap-1 text-sm text-ashram-inkSoft hover:text-ashram-saffron mb-6 transition-colors duration-500" data-testid="forgot-back-link">
                    <ArrowLeft size={14} /> Back to login
                </Link>
                <div className="rounded-3xl border border-ashram-border bg-white p-8 shadow-[0_18px_60px_rgba(155,34,38,0.08)]">
                    <div className="flex items-center gap-3">
                        <span className="w-12 h-12 rounded-2xl bg-ashram-saffron/10 flex items-center justify-center">
                            <KeyRound className="text-ashram-saffron" size={22} />
                        </span>
                        <div>
                            <div className="font-display text-2xl text-ashram-ink">Forgot Password</div>
                            <div className="tracking-label !text-ashram-inkSoft mt-1">Reset Admin Access</div>
                        </div>
                    </div>

                    {done ? (
                        <div className="mt-8 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-emerald-800 text-sm leading-relaxed" data-testid="forgot-success">
                            If an admin account exists for <strong>{email}</strong>, a password reset link has been generated.
                            <p className="mt-3 text-xs text-emerald-700/80">
                                Email sending is disabled in this build. Check the server console output, or the
                                <strong> Admin → Recent Resets</strong> panel (visible to any logged-in admin) to retrieve the link.
                            </p>
                            <button
                                type="button"
                                onClick={() => navigate('/admin/login')}
                                className="btn-saffron mt-6 w-full justify-center"
                                data-testid="forgot-back-to-login"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <form className="mt-8 space-y-5" onSubmit={handleSubmit} data-testid="forgot-password-form">
                            <div>
                                <label className="text-sm font-medium">Registered Email</label>
                                <div className="relative mt-2">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ashram-inkSoft/60" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-lg border border-ashram-border bg-ashram-bg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-ashram-saffron transition-colors duration-500"
                                        placeholder="admin@sandhyapuri.org"
                                        data-testid="forgot-email-input"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-ashram-inkSoft/80">
                                    A secure reset link (valid 15 minutes) will be generated for this email.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={busy}
                                className="btn-saffron w-full justify-center disabled:opacity-60"
                                data-testid="forgot-submit-btn"
                            >
                                {busy ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                                {busy ? 'Sending…' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
