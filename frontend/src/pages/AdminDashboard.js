import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LogOut,
    Download,
    Trash2,
    Plus,
    RefreshCcw,
    IndianRupee,
    Mail,
    Image as ImageIcon,
    Film,
    Sparkles,
    Loader2,
    ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'donations', label: 'Donations' },
    { id: 'messages', label: 'Messages' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'hero', label: 'Hero Images' },
    { id: 'activities', label: 'Activities' },
    { id: 'video', label: 'About Video' },
    { id: 'settings', label: 'Settings' },
];

function fmtDate(d) {
    if (!d) return '';
    try {
        return new Date(d).toLocaleString();
    } catch {
        return String(d);
    }
}

export default function AdminDashboard() {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState({ totalDonations: 0, totalAmount: 0, totalSubmissions: 0 });
    const [donations, setDonations] = useState([]);
    const [filter, setFilter] = useState({ from: '', to: '' });
    const [messages, setMessages] = useState([]);
    const [gallery, setGallery] = useState({ images: [], totalPages: 1, page: 1 });
    const [hero, setHero] = useState([]);
    const [activities, setActivities] = useState([]);
    const [videoUrl, setVideoUrl] = useState('');
    const [upi, setUpi] = useState({ id: '', qr: '' });
    const [loading, setLoading] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const loadStats = useCallback(() => {
        api.get('/admin/stats').then((r) => setStats(r.data)).catch(() => {});
    }, []);

    const loadDonations = useCallback(() => {
        const params = {};
        if (filter.from) params.from = filter.from;
        if (filter.to) params.to = filter.to;
        api.get('/donations', { params }).then((r) => setDonations(r.data.donations || [])).catch(() => {});
    }, [filter]);

    const loadMessages = useCallback(() => {
        api.get('/contact').then((r) => setMessages(r.data.submissions || [])).catch(() => {});
    }, []);

    const loadGallery = useCallback((page = 1) => {
        api.get('/gallery', { params: { page, limit: 12 } }).then((r) => setGallery({ ...r.data, page })).catch(() => {});
    }, []);

    const loadHero = useCallback(() => {
        api.get('/hero').then((r) => setHero(r.data.images || [])).catch(() => {});
    }, []);

    const loadActivities = useCallback(() => {
        api.get('/activities').then((r) => setActivities(r.data.activities || [])).catch(() => {});
    }, []);

    const loadVideo = useCallback(() => {
        api.get('/video').then((r) => setVideoUrl(r.data.url || '')).catch(() => {});
    }, []);

    const loadSettings = useCallback(async () => {
        try {
            const r = await api.get('/admin/public-settings');
            setUpi({ id: r.data.upi_id || '', qr: r.data.upi_qr_url || '' });
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    useEffect(() => {
        if (tab === 'donations') loadDonations();
        if (tab === 'messages') loadMessages();
        if (tab === 'gallery') loadGallery(1);
        if (tab === 'hero') loadHero();
        if (tab === 'activities') loadActivities();
        if (tab === 'video') loadVideo();
        if (tab === 'settings') loadSettings();
    }, [tab, loadDonations, loadMessages, loadGallery, loadHero, loadActivities, loadVideo, loadSettings]);

    const exportCsv = async () => {
        try {
            const token = window.localStorage.getItem('ashram_admin_token');
            const url = `${process.env.REACT_APP_BACKEND_URL}/api/admin/donations/export`;
            const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const blob = await resp.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `donations_${Date.now()}.csv`;
            link.click();
            toast.success('CSV downloaded');
        } catch {
            toast.error('Could not export CSV');
        }
    };

    const addImage = async (collection, body, after) => {
        try {
            setLoading(true);
            await api.post(`/${collection}`, body);
            toast.success('Added');
            after && after();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Add failed');
        } finally {
            setLoading(false);
        }
    };

    const deleteImage = async (collection, id, after) => {
        try {
            await api.delete(`/${collection}/${id}`);
            toast.success('Removed');
            after && after();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Delete failed');
        }
    };

    const saveVideo = async (url) => {
        try {
            await api.post('/video', { url });
            toast.success('Video saved');
            loadVideo();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Save failed');
        }
    };

    const saveUpi = async () => {
        try {
            await api.put('/admin/settings/upi_id', { value: upi.id });
            await api.put('/admin/settings/upi_qr_url', { value: upi.qr });
            toast.success('Settings saved');
        } catch {
            toast.error('Save failed');
        }
    };

    return (
        <div className="min-h-screen bg-ashram-bg" data-testid="admin-dashboard">
            {/* Top bar */}
            <header className="sticky top-0 z-30 bg-white border-b border-ashram-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
                    <Link to="/" className="flex items-center gap-2 text-ashram-ink hover:text-ashram-saffron transition-colors duration-500" data-testid="admin-home-link">
                        <span className="font-devanagari text-3xl text-ashram-saffron">ॐ</span>
                        <span className="font-display text-lg">Ashram Admin</span>
                    </Link>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="hidden sm:inline text-ashram-inkSoft">{admin?.email}</span>
                        <button onClick={handleLogout} className="btn-outline-gold !py-2 !px-4 text-sm" data-testid="admin-logout-btn">
                            <LogOut size={14} /> Logout
                        </button>
                    </div>
                </div>
                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-10 flex gap-1 overflow-x-auto" data-testid="admin-tabs">
                    {TABS.map((tb) => (
                        <button
                            key={tb.id}
                            onClick={() => setTab(tb.id)}
                            data-testid={`admin-tab-${tb.id}`}
                            className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors duration-500 ${
                                tab === tb.id
                                    ? 'border-ashram-saffron text-ashram-saffron'
                                    : 'border-transparent text-ashram-inkSoft hover:text-ashram-ink'
                            }`}
                        >
                            {tb.label}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 space-y-8">
                {tab === 'overview' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" data-testid="admin-overview">
                        <StatCard icon={IndianRupee} label="Total Donations Amount" value={`₹${stats.totalAmount.toLocaleString('en-IN')}`} testid="stat-amount" />
                        <StatCard icon={Sparkles} label="Donation Records" value={stats.totalDonations} testid="stat-donations" />
                        <StatCard icon={Mail} label="Contact Submissions" value={stats.totalSubmissions} testid="stat-submissions" />
                    </div>
                )}

                {tab === 'donations' && (
                    <div className="space-y-4" data-testid="admin-donations">
                        <div className="flex flex-wrap items-end gap-3">
                            <div>
                                <div className="tracking-label">From</div>
                                <input type="date" value={filter.from} onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value }))} className="mt-1 rounded-lg border border-ashram-border bg-white px-3 py-2 text-sm" data-testid="donation-filter-from" />
                            </div>
                            <div>
                                <div className="tracking-label">To</div>
                                <input type="date" value={filter.to} onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))} className="mt-1 rounded-lg border border-ashram-border bg-white px-3 py-2 text-sm" data-testid="donation-filter-to" />
                            </div>
                            <button onClick={loadDonations} className="btn-outline-gold !py-2 text-sm" data-testid="donation-filter-apply">
                                <RefreshCcw size={14} /> Apply
                            </button>
                            <div className="ml-auto" />
                            <button onClick={exportCsv} className="btn-saffron !py-2 text-sm" data-testid="donation-export-btn">
                                <Download size={14} /> Export CSV
                            </button>
                        </div>
                        <div className="rounded-2xl border border-ashram-border bg-white overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-ashram-bg text-ashram-inkSoft text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="text-left px-4 py-3">Date</th>
                                        <th className="text-left px-4 py-3">Donor</th>
                                        <th className="text-left px-4 py-3">Email</th>
                                        <th className="text-right px-4 py-3">Amount</th>
                                        <th className="text-left px-4 py-3">Mode</th>
                                        <th className="text-left px-4 py-3">Status</th>
                                        <th className="text-left px-4 py-3">Reference</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donations.length === 0 ? (
                                        <tr><td colSpan="7" className="px-4 py-10 text-center text-ashram-inkSoft">No donations yet</td></tr>
                                    ) : donations.map((d) => (
                                        <tr key={d.id} className="border-t border-ashram-border" data-testid={`donation-row-${d.id}`}>
                                            <td className="px-4 py-3 whitespace-nowrap text-ashram-inkSoft">{fmtDate(d.createdAt)}</td>
                                            <td className="px-4 py-3">{d.donorName}</td>
                                            <td className="px-4 py-3 text-ashram-inkSoft">{d.email}</td>
                                            <td className="px-4 py-3 text-right font-medium">₹{Number(d.amount).toLocaleString('en-IN')}</td>
                                            <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-ashram-bg border border-ashram-border">{d.mode}</span></td>
                                            <td className="px-4 py-3"><StatusPill status={d.paymentStatus} /></td>
                                            <td className="px-4 py-3 text-xs text-ashram-inkSoft truncate max-w-[180px]">{d.paymentId || d.upiTxnId || d.orderId}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'messages' && (
                    <div className="space-y-3" data-testid="admin-messages">
                        {messages.length === 0 ? (
                            <div className="rounded-2xl border border-ashram-border bg-white p-10 text-center text-ashram-inkSoft">No messages yet</div>
                        ) : messages.map((m) => (
                            <div key={m.id} className="rounded-2xl border border-ashram-border bg-white p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="font-medium">{m.name} <span className="text-ashram-inkSoft text-sm">· {m.email}</span></div>
                                        <div className="text-xs text-ashram-inkSoft mt-0.5">{fmtDate(m.createdAt)}</div>
                                    </div>
                                </div>
                                <p className="mt-3 text-sm text-ashram-ink leading-relaxed">{m.message}</p>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'gallery' && (
                    <AdminMediaSection
                        title="Gallery Images"
                        items={gallery.images}
                        onAdd={(url, caption) => addImage('gallery', { url, caption }, () => loadGallery(gallery.page))}
                        onDelete={(id) => deleteImage('gallery', id, () => loadGallery(gallery.page))}
                        loading={loading}
                        extraField={{ key: 'caption', label: 'Caption (optional)' }}
                    />
                )}

                {tab === 'hero' && (
                    <AdminMediaSection
                        title="Hero Slider Images"
                        items={hero}
                        onAdd={(url, alt) => addImage('hero', { url, alt }, loadHero)}
                        onDelete={(id) => deleteImage('hero', id, loadHero)}
                        loading={loading}
                        extraField={{ key: 'alt', label: 'Alt text (optional)' }}
                    />
                )}

                {tab === 'activities' && (
                    <AdminActivitiesSection
                        items={activities}
                        onAdd={(payload) => addImage('activities', payload, loadActivities)}
                        onDelete={(id) => deleteImage('activities', id, loadActivities)}
                    />
                )}

                {tab === 'video' && (
                    <AdminVideoSection currentUrl={videoUrl} onSave={saveVideo} />
                )}

                {tab === 'settings' && (
                    <div className="rounded-2xl border border-ashram-border bg-white p-6 max-w-2xl space-y-4" data-testid="admin-settings">
                        <div className="font-display text-xl">UPI Settings</div>
                        <div>
                            <label className="text-sm font-medium">UPI ID</label>
                            <input
                                value={upi.id}
                                onChange={(e) => setUpi((u) => ({ ...u, id: e.target.value }))}
                                placeholder="ashram@upi"
                                className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm"
                                data-testid="settings-upi-id"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">QR Image URL (optional)</label>
                            <input
                                value={upi.qr}
                                onChange={(e) => setUpi((u) => ({ ...u, qr: e.target.value }))}
                                placeholder="https://..."
                                className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm"
                                data-testid="settings-upi-qr"
                            />
                            <p className="text-xs text-ashram-inkSoft mt-1">If empty, a QR is auto-generated from your UPI ID.</p>
                        </div>
                        <button onClick={saveUpi} className="btn-saffron !py-2 text-sm" data-testid="settings-save-btn">Save</button>
                    </div>
                )}
            </main>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, testid }) {
    return (
        <div className="rounded-2xl border border-ashram-border bg-white p-6 flex items-center gap-4" data-testid={testid}>
            <div className="w-12 h-12 rounded-xl bg-ashram-saffron/10 text-ashram-saffron flex items-center justify-center"><Icon size={22} /></div>
            <div>
                <div className="tracking-label">{label}</div>
                <div className="mt-1 font-display text-2xl text-ashram-ink">{value}</div>
            </div>
        </div>
    );
}

function StatusPill({ status }) {
    const map = {
        paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        mock_paid: 'bg-amber-50 text-amber-700 border-amber-200',
        created: 'bg-slate-50 text-slate-600 border-slate-200',
        failed: 'bg-red-50 text-red-700 border-red-200',
    };
    return <span className={`text-xs px-2 py-1 rounded-full border ${map[status] || map.created}`}>{status}</span>;
}

function AdminMediaSection({ title, items, onAdd, onDelete, loading, extraField }) {
    const [url, setUrl] = useState('');
    const [extra, setExtra] = useState('');
    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-ashram-border bg-white p-5 space-y-3">
                <div className="font-display text-lg">{title}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Image URL (https://…)" className="rounded-lg border border-ashram-border bg-ashram-bg px-4 py-2.5 text-sm" data-testid="media-url-input" />
                    {extraField && <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder={extraField.label} className="rounded-lg border border-ashram-border bg-ashram-bg px-4 py-2.5 text-sm" data-testid="media-extra-input" />}
                </div>
                <button
                    disabled={!url || loading}
                    onClick={() => { onAdd(url, extra); setUrl(''); setExtra(''); }}
                    className="btn-saffron !py-2 text-sm disabled:opacity-60"
                    data-testid="media-add-btn"
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Image
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((it) => (
                    <div key={it.id} className="relative rounded-xl overflow-hidden border border-ashram-border bg-white group">
                        <img src={it.url} alt={it.alt || it.caption || ''} className="w-full aspect-square object-cover" />
                        <button onClick={() => onDelete(it.id)} className="absolute top-2 right-2 bg-red-600/90 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" data-testid={`media-delete-${it.id}`}>
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                {items.length === 0 && <div className="col-span-full text-center text-ashram-inkSoft py-10">No items yet</div>}
            </div>
        </div>
    );
}

function AdminActivitiesSection({ items, onAdd, onDelete }) {
    const [form, setForm] = useState({ url: '', title: '', description: '' });
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-ashram-border bg-white p-5 space-y-3">
                <div className="font-display text-lg">Activities Carousel</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input value={form.url} onChange={(e) => set('url', e.target.value)} placeholder="Image URL" className="rounded-lg border border-ashram-border bg-ashram-bg px-4 py-2.5 text-sm" data-testid="activity-url-input" />
                    <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Title (e.g. Sandhya Aarti)" className="rounded-lg border border-ashram-border bg-ashram-bg px-4 py-2.5 text-sm" data-testid="activity-title-input" />
                    <input value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Short description" className="rounded-lg border border-ashram-border bg-ashram-bg px-4 py-2.5 text-sm" data-testid="activity-desc-input" />
                </div>
                <button
                    disabled={!form.url}
                    onClick={() => { onAdd(form); setForm({ url: '', title: '', description: '' }); }}
                    className="btn-saffron !py-2 text-sm disabled:opacity-60"
                    data-testid="activity-add-btn"
                >
                    <Plus size={14} /> Add Activity
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((it) => (
                    <div key={it.id} className="relative rounded-xl overflow-hidden border border-ashram-border bg-white group">
                        <img src={it.url} alt={it.title} className="w-full aspect-[4/3] object-cover" />
                        <div className="p-3">
                            <div className="font-medium">{it.title || '—'}</div>
                            <div className="text-xs text-ashram-inkSoft">{it.description}</div>
                        </div>
                        <button onClick={() => onDelete(it.id)} className="absolute top-2 right-2 bg-red-600/90 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" data-testid={`activity-delete-${it.id}`}>
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                {items.length === 0 && <div className="col-span-full text-center text-ashram-inkSoft py-10">No activities yet</div>}
            </div>
        </div>
    );
}

function AdminVideoSection({ currentUrl, onSave }) {
    const [url, setUrl] = useState(currentUrl || '');
    useEffect(() => { setUrl(currentUrl || ''); }, [currentUrl]);
    return (
        <div className="rounded-2xl border border-ashram-border bg-white p-6 space-y-4 max-w-3xl" data-testid="admin-video">
            <div className="font-display text-xl flex items-center gap-2"><Film size={18} className="text-ashram-saffron" /> About-Page Video</div>
            <p className="text-sm text-ashram-inkSoft">Paste a YouTube/Vimeo embed URL or direct video URL. Watch URLs are auto-converted.</p>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/embed/…" className="w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm" data-testid="video-url-input" />
            <div className="flex gap-2">
                <button onClick={() => onSave(url)} className="btn-saffron !py-2 text-sm" data-testid="video-save-btn"><Plus size={14} /> Save</button>
                {currentUrl && <a href={currentUrl} target="_blank" rel="noreferrer" className="btn-outline-gold !py-2 text-sm"><ExternalLink size={14} /> Open</a>}
            </div>
        </div>
    );
}
