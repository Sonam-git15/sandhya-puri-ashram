import React, { useEffect, useState } from 'react';
import { MapPin, Clock, Accessibility, Send, Loader2, Navigation, MessageCircle, Phone } from 'lucide-react';
import { toast } from 'sonner';
import SectionHeading from '../components/SectionHeading';
import { api } from '../lib/api';
import { useLang } from '../contexts/LanguageContext';

const ADDRESS = `Sandhya Puri Sanyas Ashram, Street Number 24, Near IG Stadium, IP Estate, New Delhi – 110002`;
const DEFAULT_LAT = 28.6293963;
const DEFAULT_LNG = 77.2474045;

export default function Contact() {
    const { t } = useLang();
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [contactInfo, setContactInfo] = useState({
        phone: '',
        whatsapp: '',
        lat: DEFAULT_LAT,
        lng: DEFAULT_LNG,
    });
    const [captcha] = useState(() => {
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        return { a, b, answer: a + b };
    });
    const [captchaInput, setCaptchaInput] = useState('');

    useEffect(() => {
        api.get('/admin/public-settings')
            .then((r) => {
                setContactInfo({
                    phone: r.data?.phone || '',
                    whatsapp: r.data?.whatsapp || '',
                    lat: Number(r.data?.lat) || DEFAULT_LAT,
                    lng: Number(r.data?.lng) || DEFAULT_LNG,
                });
            })
            .catch(() => {});
    }, []);

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (parseInt(captchaInput, 10) !== captcha.answer) {
            toast.error('Captcha incorrect. Please try again.');
            return;
        }
        if (!form.name || !form.email || !form.message) {
            toast.error('Please fill all fields.');
            return;
        }
        try {
            setSubmitting(true);
            await api.post('/contact', form);
            toast.success('Thank you — your message has been received.');
            setForm({ name: '', email: '', message: '' });
            setCaptchaInput('');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Could not send message. Please try later.');
        } finally {
            setSubmitting(false);
        }
    };

    const { lat, lng, phone, whatsapp } = contactInfo;
    const mapSrc = `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=ChIJz_Yz9y39DDkRjoYWqMKUQfA`;
    const whatsappNum = (whatsapp || '').replace(/[^\d]/g, '');
    const waUrl = whatsappNum
        ? `https://wa.me/${whatsappNum}?text=${encodeURIComponent('Namaste! I would like to learn more about Sandhya Puri Sanyas Ashram.')}`
        : '';
    const telUrl = phone ? `tel:${phone.replace(/\s+/g, '')}` : '';

    return (
        <div data-testid="contact-page" className="relative">
            <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                    <SectionHeading label={t('contact_label')} title={t('contact_heading')} />

                    <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Map + info */}
                        <div className="space-y-6">
                            <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border border-ashram-border" data-testid="contact-map">
                                <iframe
                                    title="Ashram Location"
                                    src={mapSrc}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    allowFullScreen
                                />
                                {/* Custom decorative pin overlay (does not block clicks on the iframe outside this area) */}
                                <div
                                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full"
                                    aria-hidden
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="bg-ashram-saffron text-white text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                                            ॐ Ashram
                                        </div>
                                        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-ashram-saffron" />
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons row */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" data-testid="contact-actions">
                                <a
                                    href={directionsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-saffron justify-center text-sm !py-2.5"
                                    data-testid="contact-directions-btn"
                                >
                                    <Navigation size={16} /> Get Directions
                                </a>
                                <a
                                    href={waUrl || '#'}
                                    target={waUrl ? '_blank' : undefined}
                                    rel="noreferrer"
                                    onClick={(e) => { if (!waUrl) { e.preventDefault(); toast.message('WhatsApp number not configured.'); } }}
                                    className="btn-outline-gold justify-center text-sm !py-2.5"
                                    style={{ borderColor: '#22C55E', color: '#15803d' }}
                                    data-testid="contact-whatsapp-btn"
                                >
                                    <MessageCircle size={16} /> WhatsApp
                                </a>
                                <a
                                    href={telUrl || '#'}
                                    onClick={(e) => { if (!telUrl) { e.preventDefault(); toast.message('Phone not configured.'); } }}
                                    className="btn-outline-gold justify-center text-sm !py-2.5"
                                    data-testid="contact-call-btn"
                                >
                                    <Phone size={16} /> Call Now
                                </a>
                            </div>

                            <div className="rounded-2xl border border-ashram-border bg-ashram-bg p-6 space-y-4">
                                <div>
                                    <div className="tracking-label">{t('contact_address_label')}</div>
                                    <div className="mt-2 flex gap-3 text-ashram-ink">
                                        <MapPin size={18} className="text-ashram-saffron mt-0.5 shrink-0" />
                                        <p className="text-sm sm:text-base leading-relaxed">{ADDRESS}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-ashram-inkSoft">
                                    <span className="inline-flex items-center gap-2"><Clock size={16} className="text-ashram-gold" /> {t('contact_hours')}</span>
                                    <span className="inline-flex items-center gap-2"><Accessibility size={16} className="text-ashram-gold" /> {t('contact_accessibility')}</span>
                                </div>
                                {phone && (
                                    <div className="text-sm text-ashram-inkSoft">
                                        <span className="tracking-label !text-ashram-inkSoft mr-2">Phone</span>
                                        <a href={telUrl} className="text-ashram-saffron" data-testid="contact-phone-text">{phone}</a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="rounded-3xl border border-ashram-border bg-white p-6 sm:p-8 space-y-5 shadow-[0_18px_60px_rgba(155,34,38,0.06)]"
                            data-testid="contact-form"
                        >
                            <div>
                                <label className="text-sm font-medium text-ashram-ink">Name</label>
                                <input name="name" type="text" required value={form.name} onChange={handleChange}
                                    className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm focus:outline-none focus:border-ashram-saffron transition-colors duration-500"
                                    placeholder="Your full name" data-testid="contact-name-input" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-ashram-ink">Email</label>
                                <input name="email" type="email" required value={form.email} onChange={handleChange}
                                    className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm focus:outline-none focus:border-ashram-saffron transition-colors duration-500"
                                    placeholder="you@example.com" data-testid="contact-email-input" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-ashram-ink">Message</label>
                                <textarea name="message" required rows={5} value={form.message} onChange={handleChange}
                                    className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm focus:outline-none focus:border-ashram-saffron resize-none transition-colors duration-500"
                                    placeholder="Share your thoughts or query…" data-testid="contact-message-input" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-ashram-ink">
                                    Captcha — what is {captcha.a} + {captcha.b}?
                                </label>
                                <input type="text" inputMode="numeric" required value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-ashram-border bg-ashram-bg px-4 py-3 text-sm focus:outline-none focus:border-ashram-saffron transition-colors duration-500"
                                    placeholder="Type the sum" data-testid="contact-captcha-input" />
                            </div>
                            <button type="submit" disabled={submitting} className="btn-saffron w-full justify-center disabled:opacity-60" data-testid="contact-submit-btn">
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {submitting ? 'Sending…' : 'Contact Us'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
