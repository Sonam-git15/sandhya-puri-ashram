import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Phone } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';

export default function Footer() {
    const { t } = useLang();
    return (
        <footer className="relative mt-16 border-t border-ashram-border bg-white" data-testid="site-footer">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="font-devanagari text-3xl text-ashram-saffron leading-none">ॐ</span>
                        <span className="font-display text-xl tracking-wide">Sandhya Puri Sanyas Ashram</span>
                    </div>
                    <p className="text-ashram-inkSoft text-sm leading-relaxed font-devanagari">
                        {t('footer_tagline')}
                    </p>
                </div>
                <div>
                    <div className="tracking-label mb-3">Contact</div>
                    <ul className="space-y-2 text-sm text-ashram-inkSoft">
                        <li className="flex gap-2"><MapPin size={16} className="text-ashram-gold mt-0.5 shrink-0" /> Street No. 24, Near IG Stadium, IP Estate, New Delhi – 110002</li>
                        <li className="flex gap-2"><Clock size={16} className="text-ashram-gold mt-0.5 shrink-0" /> Open until 9 PM</li>
                        <li className="flex gap-2"><Phone size={16} className="text-ashram-gold mt-0.5 shrink-0" /> +91 11 2345 6789</li>
                    </ul>
                </div>
                <div>
                    <div className="tracking-label mb-3">Explore</div>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/about" className="link-soft" data-testid="footer-link-about">About</Link></li>
                        <li><Link to="/history" className="link-soft" data-testid="footer-link-history">History</Link></li>
                        <li><Link to="/gallery" className="link-soft" data-testid="footer-link-gallery">Gallery</Link></li>
                        <li><Link to="/donate" className="link-soft" data-testid="footer-link-donate">Donate</Link></li>
                        <li><Link to="/contact" className="link-soft" data-testid="footer-link-contact">Contact</Link></li>
                        <li className="pt-2 text-xs text-ashram-inkSoft/70"><Link to="/admin/login" className="hover:text-ashram-saffron" data-testid="footer-admin-link">Admin Portal</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-ashram-border">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-5 text-center text-xs text-ashram-inkSoft font-devanagari">
                    {t('footer_rights')}
                </div>
            </div>
        </footer>
    );
}
