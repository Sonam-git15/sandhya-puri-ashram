import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';

const NAV = [
    { to: '/', label: 'Home', testid: 'nav-home' },
    { to: '/about', label: 'About', testid: 'nav-about' },
    { to: '/history', label: 'History', testid: 'nav-history' },
    { to: '/donate', label: 'Donate', testid: 'nav-donate' },
    { to: '/gallery', label: 'Gallery', testid: 'nav-gallery' },
    { to: '/contact', label: 'Contact', testid: 'nav-contact' },
];

const LANG_OPTIONS = [
    { code: 'hi', short: 'हि', label: 'Hindi' },
    { code: 'en', short: 'En', label: 'English' },
    { code: 'sa', short: 'सं', label: 'Sanskrit' },
];

export default function Header() {
    const { lang, setLang } = useLang();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    return (
        <header
            data-testid="site-header"
            className={`sticky top-0 z-50 transition-colors duration-700 ${
                scrolled
                    ? 'bg-white/85 backdrop-blur-xl border-b border-ashram-border'
                    : 'bg-white/40 backdrop-blur-md'
            }`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group" data-testid="brand-link">
                    <span
                        className="font-devanagari text-3xl text-ashram-saffron leading-none transition-transform duration-700 group-hover:scale-105"
                        aria-hidden
                    >
                        ॐ
                    </span>
                    <span className="flex flex-col leading-tight">
                        <span className="font-display text-lg sm:text-xl text-ashram-ink tracking-wide">
                            Sandhya Puri
                        </span>
                        <span className="tracking-label !text-[0.6rem] text-ashram-gold">
                            Sanyas Ashram
                        </span>
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
                    {NAV.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            data-testid={item.testid}
                            className={({ isActive }) =>
                                `px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-500 ${
                                    isActive
                                        ? 'text-ashram-saffron'
                                        : 'text-ashram-ink hover:text-ashram-saffron'
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Right cluster */}
                <div className="flex items-center gap-2">
                    {/* Language switcher */}
                    <div className="flex items-center gap-1 rounded-full border border-ashram-border bg-white/70 px-1 py-1" data-testid="language-switcher">
                        <Globe size={14} className="ml-2 text-ashram-gold hidden sm:block" aria-hidden />
                        {LANG_OPTIONS.map((opt) => (
                            <button
                                key={opt.code}
                                type="button"
                                onClick={() => setLang(opt.code)}
                                aria-pressed={lang === opt.code}
                                data-testid={`lang-${opt.code}`}
                                className={`px-2.5 py-1 text-xs rounded-full transition-colors duration-500 ${
                                    lang === opt.code
                                        ? 'bg-ashram-saffron text-white'
                                        : 'text-ashram-inkSoft hover:text-ashram-saffron'
                                }`}
                                title={opt.label}
                            >
                                <span className="font-devanagari sm:hidden">{opt.short}</span>
                                <span className="hidden sm:inline">{opt.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Donate CTA */}
                    <Link
                        to="/donate"
                        className="hidden md:inline-flex btn-saffron !py-2 !px-5 text-sm"
                        data-testid="header-donate-btn"
                    >
                        Donate Now
                    </Link>

                    {/* Mobile toggle */}
                    <button
                        type="button"
                        className="lg:hidden p-2 rounded-md text-ashram-ink"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Toggle menu"
                        data-testid="mobile-menu-toggle"
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <nav
                    className="lg:hidden border-t border-ashram-border bg-white"
                    data-testid="mobile-menu"
                    aria-label="Mobile"
                >
                    <ul className="px-4 py-3 flex flex-col gap-1">
                        {NAV.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    end={item.to === '/'}
                                    data-testid={`${item.testid}-mobile`}
                                    className={({ isActive }) =>
                                        `block px-3 py-3 rounded-md text-base transition-colors duration-500 ${
                                            isActive
                                                ? 'text-ashram-saffron bg-ashram-bg'
                                                : 'text-ashram-ink hover:bg-ashram-bg'
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                        <li className="pt-2">
                            <Link
                                to="/donate"
                                className="btn-saffron w-full justify-center"
                                data-testid="mobile-donate-btn"
                            >
                                Donate Now
                            </Link>
                        </li>
                    </ul>
                </nav>
            )}
        </header>
    );
}
