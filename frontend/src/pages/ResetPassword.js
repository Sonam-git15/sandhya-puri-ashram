import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, KeyRound, Eye, EyeOff, Check, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';

function validate(p) {
    return {
        len: p.length >= 8,
        upper: /[A-Z]/.test(p),
        num: /\d/.test(p),
        special: /[!@#$%^&*()_+\-={}[\]:;"'<>,.?/\\|`~]/.test(p),
    };
}

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('checking'); // checking | valid | invalid
    const [reason, setReason] = useState('');
    const [pw, setPw] = useState('');
    const [pw2, setPw2] = useState('');
    const [show, setShow] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let cancelled = false;
        api.get(`/auth/reset-password/${token}`)
            .then(() => { if (!cancelled) setStatus('valid'); })
            .catch((err) => {
                if (cancelled) return;
                setStatus('invalid');
                setReason(err.response?.data?.error || 'Token is not valid');
            });
        return () => { cancelled = true; };
    }, [token]);

    const checks = validate(pw);
    const allOk = Object.values(checks).every(Boolean) && pw === pw2 && pw.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!allOk) {
            toast.error('Please satisfy all password requirements and confirm match.');
            return;
        }
        try {
            setBusy(true);
            await api.post('/auth/reset-password', { token, password: pw });
            toast.success('Password updated. Please log in with the new password.');
            navigate('/admin/login');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Could not reset password');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen bg-ashram-bg flex items-center justify-center p-4 relative overflow-hidden" data-testid="reset-password-page">
            <div className="om-watermark" aria-hidden>ॐ</div>
            <div className="relative w-full max-w-md">
                <Link to="/admin/login" className="inline-flex items-center gap-1 text-sm text-ashram-inkSoft hover:text-ashram-saffron mb-6 transition-colors duration-500" data-testid="reset-back-link">
                    <ArrowLeft size={14} /> Back to login
                </Link>
                <div className="rounded-3xl border border-ashram-border bg-white p-8 shadow-[0_18px_60px_rgba(155,34,38,0.08)]">
                    <div className="flex items-center gap-3">
                        <span className="w-12 h-12 rounded-2xl bg-ashram-saffron/10 flex items-center justify-center">
                            <KeyRound className="text-ashram-saffron" size={22} />
                        </span>
                        <div>
                            <div className="font-display text-2xl text-ashram-ink">Reset Password</div>
                            <div className="tracking-label !text-ashram-inkSoft mt-1">Choose a new password</div>
                        </div>
                    </div>

                    {status === 'checking' && (
                        <div className="mt-10 flex items-center gap-2 text-ashram-inkSoft" data-testid="reset-checking">
                            <Loader2 className="animate-spin" size={16} /> Verifying token…
                        </div>
                    )}

                    {status === 'invalid' && (
                        <div className="mt-8 rounded-2xl bg-red-50 border border-red-200 p-6 text-red-800 text-sm" data-testid="reset-invalid">
                            {reason}. Please request a new reset link.
                            <Link to="/admin/forgot-password" className="block mt-4 text-ashram-saffron underline" data-testid="reset-request-new">
                                Request new link →
                            </Link>
                        </div>
                    )}

                    {status === 'valid' && (
                        <form className="mt-8 space-y-5" onSubmit={handleSubmit} data-testid="reset-password-form">
                            <div>
                                <label className="text-sm font-medium">New Password</label>
                                <div className="relative mt-2">
                                    <input
                                        type={show ? 'text' : 'password'}
                                        value={pw}
                                        onChange={(e) => setPw(e.target.value)}
                                        className="w-full rounded-lg border border-ashram-border bg-ashram-bg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-ashram-saffron"
                                        placeholder="••••••••"
                                        data-testid="reset-pw-input"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShow((s) => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ashram-inkSoft hover:text-ashram-saffron"
                                        aria-label={show ? 'Hide password' : 'Show password'}
                                        data-testid="reset-pw-toggle"
                                    >
                                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Confirm Password</label>
                                <input
                                    type={show ? 'text' : 'password'}
                                    value={pw2}
                                    onChange={(e) => setPw2(e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm focus:outline-none focus:border-ashram-saffron"
                                    placeholder="••••••••"
                                    data-testid="reset-pw2-input"
                                />
                            </div>

                            <ul className="space-y-1.5 text-xs" data-testid="reset-checklist">
                                <Item ok={checks.len} text="At least 8 characters" />
                                <Item ok={checks.upper} text="One uppercase letter" />
                                <Item ok={checks.num} text="One number" />
                                <Item ok={checks.special} text="One special character (!@#$…)" />
                                <Item ok={pw.length > 0 && pw === pw2} text="Passwords match" />
                            </ul>

                            <button
                                type="submit"
                                disabled={!allOk || busy}
                                className="btn-saffron w-full justify-center disabled:opacity-50"
                                data-testid="reset-submit-btn"
                            >
                                {busy ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                                {busy ? 'Updating…' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

function Item({ ok, text }) {
    return (
        <li className={`flex items-center gap-2 ${ok ? 'text-emerald-700' : 'text-ashram-inkSoft/80'}`}>
            {ok ? <Check size={14} /> : <X size={14} />} {text}
        </li>
    );
}
