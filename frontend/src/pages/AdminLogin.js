import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, LogIn, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setBusy(true);
            await login(email, password);
            toast.success('Welcome, admin.');
            navigate('/admin');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen bg-ashram-bg flex items-center justify-center p-4 relative overflow-hidden" data-testid="admin-login-page">
            <div className="om-watermark" aria-hidden>ॐ</div>
            <div className="relative w-full max-w-md">
                <Link to="/" className="inline-flex items-center gap-1 text-sm text-ashram-inkSoft hover:text-ashram-saffron mb-6 transition-colors duration-500" data-testid="admin-back-link">
                    <ArrowLeft size={14} /> Back to site
                </Link>
                <div className="rounded-3xl border border-ashram-border bg-white p-8 shadow-[0_18px_60px_rgba(155,34,38,0.08)]">
                    <div className="flex items-center gap-3">
                        <span className="font-devanagari text-4xl text-ashram-saffron leading-none">ॐ</span>
                        <div>
                            <div className="font-display text-2xl text-ashram-ink">Admin Portal</div>
                            <div className="tracking-label !text-ashram-inkSoft mt-1">Sandhya Puri Ashram</div>
                        </div>
                    </div>
                    <form className="mt-8 space-y-5" onSubmit={handleSubmit} data-testid="admin-login-form">
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm focus:outline-none focus:border-ashram-saffron transition-colors duration-500"
                                placeholder="admin@sandhyapuri.org"
                                data-testid="admin-email-input"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm focus:outline-none focus:border-ashram-saffron transition-colors duration-500"
                                placeholder="••••••••"
                                data-testid="admin-password-input"
                            />
                        </div>
                        <div className="flex justify-end -mt-2">
                            <Link
                                to="/admin/forgot-password"
                                className="text-xs text-ashram-saffron hover:text-ashram-saffronDeep transition-colors duration-500"
                                data-testid="admin-forgot-link"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                        <button
                            type="submit"
                            disabled={busy}
                            className="btn-saffron w-full justify-center disabled:opacity-60"
                            data-testid="admin-login-btn"
                        >
                            {busy ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                            {busy ? 'Signing in…' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
