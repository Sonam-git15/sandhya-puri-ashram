import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LogOut, Download, Trash2, RefreshCcw, IndianRupee, Mail, Film, Sparkles, Loader2,
    Pencil, Save, Copy, ExternalLink, X, Image as ImageIcon, Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from '../components/FileUpload';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
function resolveUrl(u) {
    if (!u) return u;
    if (/^https?:\/\//i.test(u) || u.startsWith('data:')) return u;
    return `${BACKEND_URL}${u}`;
}

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'donations', label: 'Donations' },
    { id: 'messages', label: 'Messages' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'hero', label: 'Hero Images' },
    { id: 'activities', label: 'Activities' },
    { id: 'video', label: 'About Video' },
    { id: 'settings', label: 'Settings' },
    { id: 'resets', label: 'Recent Resets' },
];

function fmtDate(d) {
    if (!d) return '';
    try { return new Date(d).toLocaleString(); } catch { return String(d); }
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
    const [resets, setResets] = useState([]);
    const [publicSettings, setPublicSettings] = useState({ upi_id: '', upi_qr_url: '', phone: '', whatsapp: '' });

    const handleLogout = () => { logout(); navigate('/admin/login'); };

    const loadStats = useCallback(() => api.get('/admin/stats').then((r) => setStats(r.data)).catch(() => {}), []);
    const loadDonations = useCallback(() => {
        const params = {}; if (filter.from) params.from = filter.from; if (filter.to) params.to = filter.to;
        api.get('/donations', { params }).then((r) => setDonations(r.data.donations || [])).catch(() => {});
    }, [filter]);
    const loadMessages = useCallback(() => api.get('/contact').then((r) => setMessages(r.data.submissions || [])).catch(() => {}), []);
    const loadGallery = useCallback((page = 1) => api.get('/gallery', { params: { page, limit: 12 } }).then((r) => setGallery({ ...r.data, page })).catch(() => {}), []);
    const loadHero = useCallback(() => api.get('/hero').then((r) => setHero(r.data.images || [])).catch(() => {}), []);
    const loadActivities = useCallback(() => api.get('/activities').then((r) => setActivities(r.data.activities || [])).catch(() => {}), []);
    const loadVideo = useCallback(() => api.get('/video').then((r) => setVideoUrl(r.data.url || '')).catch(() => {}), []);
    const loadResets = useCallback(() => api.get('/auth/recent-resets').then((r) => setResets(r.data.resets || [])).catch(() => {}), []);
    const loadPublicSettings = useCallback(async () => {
        try { const r = await api.get('/admin/public-settings'); setPublicSettings(r.data); } catch { /* ignore */ }
    }, []);

    useEffect(() => { loadStats(); }, [loadStats]);

    useEffect(() => {
        if (tab === 'donations') loadDonations();
        if (tab === 'messages') loadMessages();
        if (tab === 'gallery') loadGallery(1);
        if (tab === 'hero') loadHero();
        if (tab === 'activities') loadActivities();
        if (tab === 'video') loadVideo();
        if (tab === 'settings') loadPublicSettings();
        if (tab === 'resets') loadResets();
    }, [tab, loadDonations, loadMessages, loadGallery, loadHero, loadActivities, loadVideo, loadPublicSettings, loadResets]);

    const exportCsv = async () => {
        try {
            const token = window.localStorage.getItem('ashram_admin_token');
            const resp = await fetch(`${BACKEND_URL}/api/admin/donations/export`, { headers: { Authorization: `Bearer ${token}` } });
            const blob = await resp.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `donations_${Date.now()}.csv`;
            link.click();
            toast.success('CSV downloaded');
        } catch { toast.error('Could not export CSV'); }
    };

    return (
        <div className="min-h-screen bg-ashram-bg" data-testid="admin-dashboard">
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
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-10 flex gap-1 overflow-x-auto" data-testid="admin-tabs">
                    {TABS.map((tb) => (
                        <button key={tb.id} onClick={() => setTab(tb.id)} data-testid={`admin-tab-${tb.id}`}
                            className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors duration-500 ${
                                tab === tb.id ? 'border-ashram-saffron text-ashram-saffron' : 'border-transparent text-ashram-inkSoft hover:text-ashram-ink'
                            }`}>
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
                            <div><div className="tracking-label">From</div><input type="date" value={filter.from} onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value }))} className="mt-1 rounded-lg border border-ashram-border bg-white px-3 py-2 text-sm" data-testid="donation-filter-from" /></div>
                            <div><div className="tracking-label">To</div><input type="date" value={filter.to} onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))} className="mt-1 rounded-lg border border-ashram-border bg-white px-3 py-2 text-sm" data-testid="donation-filter-to" /></div>
                            <button onClick={loadDonations} className="btn-outline-gold !py-2 text-sm" data-testid="donation-filter-apply"><RefreshCcw size={14} /> Apply</button>
                            <div className="ml-auto" />
                            <button onClick={exportCsv} className="btn-saffron !py-2 text-sm" data-testid="donation-export-btn"><Download size={14} /> Export CSV</button>
                        </div>
                        <div className="rounded-2xl border border-ashram-border bg-white overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-ashram-bg text-ashram-inkSoft text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="text-left px-4 py-3">Date</th><th className="text-left px-4 py-3">Donor</th>
                                        <th className="text-left px-4 py-3">Email</th><th className="text-right px-4 py-3">Amount</th>
                                        <th className="text-left px-4 py-3">Mode</th><th className="text-left px-4 py-3">Status</th>
                                        <th className="text-left px-4 py-3">Reference</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donations.length === 0 ? <tr><td colSpan="7" className="px-4 py-10 text-center text-ashram-inkSoft">No donations yet</td></tr>
                                    : donations.map((d) => (
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
                        {messages.length === 0 ? <div className="rounded-2xl border border-ashram-border bg-white p-10 text-center text-ashram-inkSoft">No messages yet</div>
                        : messages.map((m) => (
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
                    <MediaUploadSection category="gallery" items={gallery.images} captionField="caption" reload={() => loadGallery(gallery.page)} />
                )}
                {tab === 'hero' && (
                    <MediaUploadSection category="hero" items={hero} captionField="alt" reload={loadHero} title="Hero Slider Images" multiple uploadFieldName="images" />
                )}
                {tab === 'activities' && (
                    <ActivitiesUploadSection items={activities} reload={loadActivities} />
                )}
                {tab === 'video' && (
                    <VideoUploadSection currentUrl={videoUrl} reload={loadVideo} />
                )}

                {tab === 'settings' && (
                    <SettingsSection settings={publicSettings} setSettings={setPublicSettings} reload={loadPublicSettings} />
                )}

                {tab === 'resets' && (
                    <RecentResetsSection resets={resets} reload={loadResets} />
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

// Gallery / Hero — multiple image upload + caption edit + delete + replace
function MediaUploadSection({ category, items, captionField, reload, title, multiple = true, uploadFieldName = 'images' }) {
    const [busy, setBusy] = useState(false);
    const [editing, setEditing] = useState(null); // {id, caption}
    const isGallery = category === 'gallery';
    const heading = title || (isGallery ? 'Gallery Images' : `${category[0].toUpperCase()}${category.slice(1)} Images`);

    const upload = async (files, resetUI) => {
        try {
            setBusy(true);
            const form = new FormData();
            files.forEach((f) => form.append(multiple ? uploadFieldName : 'images', f));
            await api.post(`/${category}/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success(`${files.length} file(s) uploaded`);
            resetUI && resetUI();
            reload();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Upload failed');
        } finally {
            setBusy(false);
        }
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this image?')) return;
        try {
            await api.delete(`/${category}/${id}`);
            toast.success('Deleted');
            reload();
        } catch (e) { toast.error(e.response?.data?.error || 'Delete failed'); }
    };

    const saveCaption = async (id, value) => {
        try {
            const body = isGallery ? { caption: value } : { alt: value };
            await api.put(`/${category}/${id}`, body);
            toast.success('Updated');
            setEditing(null);
            reload();
        } catch (e) { toast.error(e.response?.data?.error || 'Update failed'); }
    };

    const replaceImage = async (id, file) => {
        if (!file) return;
        try {
            const form = new FormData();
            form.append('image', file);
            await api.put(`/${category}/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Image replaced');
            reload();
        } catch (e) { toast.error(e.response?.data?.error || 'Replace failed'); }
    };

    return (
        <div className="space-y-6" data-testid={`media-${category}`}>
            <div className="rounded-2xl border border-ashram-border bg-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="font-display text-lg">{heading}</div>
                    <div className="text-xs text-ashram-inkSoft">{items.length} item{items.length !== 1 ? 's' : ''}</div>
                </div>
                <FileUpload
                    multiple={multiple}
                    onFiles={upload}
                    busy={busy}
                    uploadLabel="Upload"
                    testidPrefix={`${category}-upload`}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((it) => (
                    <div key={it.id} className="rounded-2xl overflow-hidden border border-ashram-border bg-white" data-testid={`media-card-${it.id}`}>
                        <div className="relative aspect-[4/3]">
                            <img src={resolveUrl(it.url)} alt={it.caption || it.alt || ''} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3 space-y-2">
                            {editing?.id === it.id ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        value={editing.value}
                                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                        className="flex-1 rounded-md border border-ashram-border bg-ashram-bg px-2 py-1 text-sm"
                                        data-testid={`media-caption-input-${it.id}`}
                                    />
                                    <button onClick={() => saveCaption(it.id, editing.value)} className="text-emerald-600" data-testid={`media-save-${it.id}`}><Save size={16} /></button>
                                    <button onClick={() => setEditing(null)} className="text-ashram-inkSoft"><X size={16} /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 text-sm text-ashram-inkSoft truncate">{it[captionField] || <span className="italic text-ashram-inkSoft/50">No {captionField}</span>}</div>
                                    <button onClick={() => setEditing({ id: it.id, value: it[captionField] || '' })} className="text-ashram-saffron" data-testid={`media-edit-${it.id}`}><Pencil size={14} /></button>
                                </div>
                            )}
                            <div className="flex gap-2 text-xs">
                                <label className="cursor-pointer text-ashram-saffron hover:underline" data-testid={`media-replace-${it.id}`}>
                                    Replace
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => replaceImage(it.id, e.target.files?.[0])} />
                                </label>
                                <button onClick={() => remove(it.id)} className="text-red-600 hover:underline ml-auto" data-testid={`media-delete-${it.id}`}>
                                    <Trash2 size={12} className="inline" /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <div className="col-span-full text-center text-ashram-inkSoft py-10">No items yet</div>}
            </div>
        </div>
    );
}

// Activities — title + description + image
function ActivitiesUploadSection({ items, reload }) {
    const [form, setForm] = useState({ title: '', description: '', file: null });
    const [busy, setBusy] = useState(false);
    const [editing, setEditing] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        if (!form.file) return toast.error('Please choose an image');
        try {
            setBusy(true);
            const fd = new FormData();
            fd.append('image', form.file);
            fd.append('title', form.title);
            fd.append('description', form.description);
            await api.post('/activities/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Activity added');
            setForm({ title: '', description: '', file: null });
            reload();
        } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
        finally { setBusy(false); }
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this activity?')) return;
        try { await api.delete(`/activities/${id}`); toast.success('Deleted'); reload(); }
        catch (e) { toast.error(e.response?.data?.error || 'Delete failed'); }
    };

    const saveEdit = async (id) => {
        try {
            const body = { title: editing.title, description: editing.description };
            await api.put(`/activities/${id}`, body);
            toast.success('Updated');
            setEditing(null);
            reload();
        } catch (e) { toast.error(e.response?.data?.error || 'Update failed'); }
    };

    const replace = async (id, file) => {
        if (!file) return;
        try {
            const fd = new FormData(); fd.append('image', file);
            await api.put(`/activities/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Image replaced'); reload();
        } catch (e) { toast.error(e.response?.data?.error || 'Replace failed'); }
    };

    return (
        <div className="space-y-6" data-testid="media-activities">
            <form onSubmit={submit} className="rounded-2xl border border-ashram-border bg-white p-5 space-y-3" data-testid="activity-add-form">
                <div className="font-display text-lg">Add Activity</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title (e.g. Sandhya Aarti)" className="rounded-lg border border-ashram-border bg-ashram-bg px-4 py-2.5 text-sm" data-testid="activity-title-input" />
                    <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" className="rounded-lg border border-ashram-border bg-ashram-bg px-4 py-2.5 text-sm" data-testid="activity-desc-input" />
                </div>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} className="text-sm" data-testid="activity-file-input" />
                <button type="submit" disabled={busy || !form.file} className="btn-saffron !py-2 text-sm disabled:opacity-60" data-testid="activity-add-btn">
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />} Add Activity
                </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((it) => (
                    <div key={it.id} className="rounded-2xl overflow-hidden border border-ashram-border bg-white" data-testid={`activity-card-${it.id}`}>
                        <div className="aspect-[4/3] relative"><img src={resolveUrl(it.url)} alt={it.title} className="w-full h-full object-cover" /></div>
                        <div className="p-3 space-y-2">
                            {editing?.id === it.id ? (
                                <div className="space-y-2">
                                    <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full rounded-md border border-ashram-border bg-ashram-bg px-2 py-1 text-sm" data-testid={`activity-edit-title-${it.id}`} />
                                    <input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full rounded-md border border-ashram-border bg-ashram-bg px-2 py-1 text-sm" data-testid={`activity-edit-desc-${it.id}`} />
                                    <div className="flex gap-2 text-xs">
                                        <button onClick={() => saveEdit(it.id)} className="text-emerald-600" data-testid={`activity-save-${it.id}`}><Check size={14} className="inline" /> Save</button>
                                        <button onClick={() => setEditing(null)} className="text-ashram-inkSoft">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium truncate">{it.title || '—'}</div>
                                        <button onClick={() => setEditing({ id: it.id, title: it.title, description: it.description })} className="text-ashram-saffron" data-testid={`activity-edit-${it.id}`}><Pencil size={14} /></button>
                                    </div>
                                    <div className="text-xs text-ashram-inkSoft">{it.description || <span className="italic">No description</span>}</div>
                                </>
                            )}
                            <div className="flex gap-3 text-xs">
                                <label className="cursor-pointer text-ashram-saffron hover:underline" data-testid={`activity-replace-${it.id}`}>
                                    Replace image
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => replace(it.id, e.target.files?.[0])} />
                                </label>
                                <button onClick={() => remove(it.id)} className="text-red-600 hover:underline ml-auto" data-testid={`activity-delete-${it.id}`}>
                                    <Trash2 size={12} className="inline" /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <div className="col-span-full text-center text-ashram-inkSoft py-10">No activities yet</div>}
            </div>
        </div>
    );
}

function VideoUploadSection({ currentUrl, reload }) {
    const [url, setUrl] = useState(currentUrl || '');
    const [file, setFile] = useState(null);
    const [busy, setBusy] = useState(false);
    useEffect(() => { setUrl(currentUrl || ''); }, [currentUrl]);

    const saveUrl = async () => {
        if (!url) return toast.error('Please enter a URL');
        try { await api.post('/video', { url }); toast.success('Video URL saved'); reload(); }
        catch (e) { toast.error(e.response?.data?.error || 'Save failed'); }
    };

    const uploadFile = async () => {
        if (!file) return;
        try {
            setBusy(true);
            const fd = new FormData(); fd.append('video', file);
            await api.post('/video/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Video uploaded');
            setFile(null);
            reload();
        } catch (e) { toast.error(e.response?.data?.error || 'Upload failed'); }
        finally { setBusy(false); }
    };

    const clearVideo = async () => {
        if (!window.confirm('Remove current video?')) return;
        try { await api.delete('/video'); toast.success('Video cleared'); reload(); }
        catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    };

    const isLocalUpload = currentUrl && currentUrl.startsWith('/api/uploads/');

    return (
        <div className="space-y-6 max-w-3xl" data-testid="admin-video">
            <div className="rounded-2xl border border-ashram-border bg-white p-6 space-y-3">
                <div className="font-display text-xl flex items-center gap-2"><Film size={18} className="text-ashram-saffron" /> Current About-Page Video</div>
                {currentUrl ? (
                    <div className="space-y-3">
                        <div className="aspect-video bg-black rounded-xl overflow-hidden border border-ashram-border">
                            {isLocalUpload
                                ? <video controls className="w-full h-full" src={resolveUrl(currentUrl)} data-testid="video-preview-local" />
                                : <iframe title="Current Video" src={resolveUrl(currentUrl)} className="w-full h-full" allowFullScreen data-testid="video-preview-iframe" />
                            }
                        </div>
                        <div className="flex gap-2 text-sm">
                            <a href={resolveUrl(currentUrl)} target="_blank" rel="noreferrer" className="text-ashram-saffron hover:underline" data-testid="video-open-link"><ExternalLink size={12} className="inline" /> Open</a>
                            <button onClick={clearVideo} className="ml-auto text-red-600 hover:underline" data-testid="video-clear-btn"><Trash2 size={12} className="inline" /> Remove video</button>
                        </div>
                    </div>
                ) : <div className="text-sm text-ashram-inkSoft py-6 text-center">No video set</div>}
            </div>

            <div className="rounded-2xl border border-ashram-border bg-white p-6 space-y-3">
                <div className="font-display text-lg">Embed URL (YouTube / Vimeo)</div>
                <p className="text-xs text-ashram-inkSoft">Paste a YouTube/Vimeo embed or watch URL.</p>
                <div className="flex gap-2">
                    <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/embed/…" className="flex-1 rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm" data-testid="video-url-input" />
                    <button onClick={saveUrl} className="btn-saffron !py-2 text-sm" data-testid="video-save-btn"><Save size={14} /> Save</button>
                </div>
            </div>

            <div className="rounded-2xl border border-ashram-border bg-white p-6 space-y-3">
                <div className="font-display text-lg">Upload MP4 / WebM</div>
                <p className="text-xs text-ashram-inkSoft">Max 12 MB. Allowed: mp4, webm, mov, m4v, ogg.</p>
                <input type="file" accept="video/mp4,video/webm,video/quicktime,video/ogg" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" data-testid="video-file-input" />
                {file && <div className="text-xs text-ashram-inkSoft">Selected: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)</div>}
                <button onClick={uploadFile} disabled={!file || busy} className="btn-saffron !py-2 text-sm disabled:opacity-60" data-testid="video-upload-btn">
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <Film size={14} />} {busy ? 'Uploading…' : 'Upload Video'}
                </button>
            </div>
        </div>
    );
}

function SettingsSection({ settings, setSettings, reload }) {
    const [busy, setBusy] = useState(false);
    const save = async () => {
        try {
            setBusy(true);
            await Promise.all([
                api.put('/admin/settings/upi_id', { value: settings.upi_id || '' }),
                api.put('/admin/settings/upi_qr_url', { value: settings.upi_qr_url || '' }),
                api.put('/admin/settings/phone', { value: settings.phone || '' }),
                api.put('/admin/settings/whatsapp', { value: settings.whatsapp || '' }),
            ]);
            toast.success('Settings saved');
            reload && reload();
        } catch (e) { toast.error(e.response?.data?.error || 'Save failed'); }
        finally { setBusy(false); }
    };
    const upd = (k, v) => setSettings({ ...settings, [k]: v });

    return (
        <div className="rounded-2xl border border-ashram-border bg-white p-6 max-w-2xl space-y-4" data-testid="admin-settings">
            <div className="font-display text-xl">Public Settings</div>
            <div>
                <label className="text-sm font-medium">UPI ID</label>
                <input value={settings.upi_id || ''} onChange={(e) => upd('upi_id', e.target.value)} placeholder="ashram@upi" className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm" data-testid="settings-upi-id" />
            </div>
            <div>
                <label className="text-sm font-medium">UPI QR Image URL (optional)</label>
                <input value={settings.upi_qr_url || ''} onChange={(e) => upd('upi_qr_url', e.target.value)} placeholder="https://..." className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm" data-testid="settings-upi-qr" />
                <p className="text-xs text-ashram-inkSoft mt-1">If empty, a QR is auto-generated from your UPI ID.</p>
            </div>
            <div>
                <label className="text-sm font-medium">Contact Phone (with country code)</label>
                <input value={settings.phone || ''} onChange={(e) => upd('phone', e.target.value)} placeholder="+91 11 2345 6789" className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm" data-testid="settings-phone" />
            </div>
            <div>
                <label className="text-sm font-medium">WhatsApp Number (digits, with country code)</label>
                <input value={settings.whatsapp || ''} onChange={(e) => upd('whatsapp', e.target.value)} placeholder="+9198XXXXXXXX" className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm" data-testid="settings-whatsapp" />
            </div>
            <button onClick={save} disabled={busy} className="btn-saffron !py-2 text-sm disabled:opacity-60" data-testid="settings-save-btn">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {busy ? 'Saving…' : 'Save'}
            </button>
        </div>
    );
}

function RecentResetsSection({ resets, reload }) {
    const copy = (s) => {
        try { navigator.clipboard.writeText(s); toast.success('Copied'); } catch { toast.error('Could not copy'); }
    };
    return (
        <div className="space-y-3" data-testid="admin-resets">
            <div className="flex items-center justify-between">
                <div className="font-display text-xl">Recent Password Reset Links</div>
                <button onClick={reload} className="btn-outline-gold !py-2 text-sm" data-testid="resets-refresh"><RefreshCcw size={12} /> Refresh</button>
            </div>
            <p className="text-xs text-ashram-inkSoft">Email sending is disabled. Reset links generated by Forgot Password are listed here for 20 minutes (also printed to server console). Each link is valid for 15 minutes and can only be used once.</p>
            {resets.length === 0 ? <div className="rounded-2xl border border-ashram-border bg-white p-10 text-center text-ashram-inkSoft">No recent resets</div>
            : resets.map((r) => (
                <div key={r.token} className="rounded-2xl border border-ashram-border bg-white p-4 flex flex-col sm:flex-row sm:items-center gap-3" data-testid={`reset-row-${r.token}`}>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{r.email}</div>
                        <div className="text-[11px] text-ashram-inkSoft">Generated {fmtDate(r.createdAt)} · Expires {fmtDate(r.expiresAt)}</div>
                        <div className="text-xs text-ashram-saffron break-all mt-1">{r.resetUrl}</div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => copy(r.resetUrl)} className="btn-outline-gold !py-1.5 text-xs" data-testid={`reset-copy-${r.token}`}><Copy size={12} /> Copy</button>
                        <a href={r.resetUrl.replace(/^https?:\/\/[^/]+/, '')} className="btn-saffron !py-1.5 text-xs" data-testid={`reset-open-${r.token}`}><ExternalLink size={12} /> Open</a>
                    </div>
                </div>
            ))}
        </div>
    );
}
