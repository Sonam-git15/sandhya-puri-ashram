import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Check } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

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
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-10 py-2.5 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
                {/* Brand — always fully visible, smaller on mobile */}
                <Link to="/" className="flex items-center gap-1.5 sm:gap-3 group min-w-0 shrink" data-testid="brand-link">
                    <span
                        className="font-devanagari text-2xl sm:text-3xl text-ashram-saffron leading-none transition-transform duration-700 group-hover:scale-105 shrink-0"
                        aria-hidden
                    >
                        ॐ
                    </span>
                    <span className="flex flex-col leading-tight min-w-0">
                        <span className="font-display text-sm sm:text-lg lg:text-xl text-ashram-ink tracking-wide whitespace-nowrap">
                            Sandhya Puri
                        </span>
                        <span className="tracking-label !text-[0.5rem] sm:!text-[0.6rem] text-ashram-gold whitespace-nowrap">
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
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    {/* DESKTOP language switcher — horizontal pills (unchanged) */}
                    <div
                        className="hidden lg:flex items-center gap-1 rounded-full border border-ashram-border bg-white/70 px-1 py-1"
                        data-testid="language-switcher"
                    >
                        <Globe size={14} className="ml-2 text-ashram-gold" aria-hidden />
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
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* MOBILE language switcher — globe icon → dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label="Change language"
                                data-testid="mobile-lang-trigger"
                                className="lg:hidden inline-flex items-center justify-center w-10 h-10 shrink-0 rounded-full border border-ashram-border bg-white/70 text-ashram-gold hover:text-ashram-saffron hover:border-ashram-gold transition-colors duration-500"
                            >
                                <Globe size={18} aria-hidden />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8} className="min-w-[10rem]" data-testid="mobile-lang-menu">
                            {LANG_OPTIONS.map((opt) => (
                                <DropdownMenuItem
                                    key={opt.code}
                                    onClick={() => setLang(opt.code)}
                                    data-testid={`mobile-lang-${opt.code}`}
                                    className={`cursor-pointer flex items-center justify-between gap-3 ${
                                        lang === opt.code ? 'text-ashram-saffron font-medium' : ''
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="font-devanagari text-base w-5 text-center">{opt.short}</span>
                                        <span>{opt.label}</span>
                                    </span>
                                    {lang === opt.code && <Check size={14} aria-hidden />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Donate CTA — visible on ALL screens, compact on mobile */}
                    <Link
                        to="/donate"
                        className="btn-saffron !py-1.5 !px-3 sm:!py-2 sm:!px-5 text-xs sm:text-sm shrink-0"
                        data-testid="header-donate-btn"
                    >
                        <span className="hidden sm:inline">Donate Now</span>
                        <span className="sm:hidden">Donate</span>
                    </Link>

                    {/* Mobile menu toggle — 48x48 tap target, never clipped */}
                    <button
                        type="button"
                        className="lg:hidden inline-flex items-center justify-center w-12 h-12 shrink-0 rounded-md text-ashram-ink hover:text-ashram-saffron hover:bg-ashram-bg transition-colors duration-500 -mr-1"
                        onClick={() => setOpen((v) => !v)}
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        aria-expanded={open}
                        data-testid="mobile-menu-toggle"
                    >
                        {open ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
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
