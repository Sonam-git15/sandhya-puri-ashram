import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { api } from '../lib/api';
import { useLang } from '../contexts/LanguageContext';

const FALLBACK = [
    'https://images.unsplash.com/photo-1529733772151-bab41484710a?crop=entropy&cs=srgb&fm=jpg&w=1920&q=85',
    'https://images.unsplash.com/photo-1557062975-96113e46608b?crop=entropy&cs=srgb&fm=jpg&w=1920&q=85',
    'https://images.unsplash.com/photo-1665003725647-3ae0f01140b1?crop=entropy&cs=srgb&fm=jpg&w=1920&q=85',
    'https://images.unsplash.com/photo-1726501604891-19fb7f7cd37b?crop=entropy&cs=srgb&fm=jpg&w=1920&q=85',
];

export default function HeroSlider() {
    const { t } = useLang();
    const [images, setImages] = useState(FALLBACK);
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        let mounted = true;
        api.get('/hero')
            .then((r) => {
                if (!mounted) return;
                const urls = (r.data?.images || []).map((i) => i.url).filter(Boolean);
                if (urls.length) setImages(urls);
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (images.length < 2) return undefined;
        const id = setInterval(() => setIdx((i) => (i + 1) % images.length), 5000);
        return () => clearInterval(id);
    }, [images]);

    return (
        <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden" data-testid="hero-slider">
            {/* Slides */}
            <div className="absolute inset-0">
                {images.map((url, i) => (
                    <div
                        key={url + i}
                        className={`hero-slide ${i === idx ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${url})` }}
                        aria-hidden={i !== idx}
                    />
                ))}
            </div>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

            {/* Om watermark */}
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                aria-hidden
            >
                <span className="font-devanagari text-white/10 text-[22rem] sm:text-[28rem] leading-none">ॐ</span>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5 sm:px-10">
                <div className="fade-up">
                    <div className="tracking-label !text-white/80 mb-5" data-testid="hero-label">
                        {t('hero_label')}
                    </div>
                </div>
                <h1
                    className="fade-up delay-1 font-devanagari text-white max-w-4xl text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)]"
                    data-testid="hero-heading"
                >
                    {t('hero_heading')}
                </h1>
                <p
                    className="fade-up delay-2 mt-6 text-white/90 text-lg sm:text-xl font-devanagari max-w-2xl"
                    data-testid="hero-subheading"
                >
                    {t('hero_sub')}
                </p>
                <div className="fade-up delay-3 mt-10 flex flex-col sm:flex-row gap-4 items-center">
                    <Link to="/donate" className="btn-saffron" data-testid="hero-donate-btn">
                        Donate Now
                    </Link>
                    <Link to="/about" className="btn-ghost-white" data-testid="hero-discover-btn">
                        Discover Ashram
                    </Link>
                </div>
            </div>

            {/* Slide dots */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10" data-testid="hero-dots">
                {images.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setIdx(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        data-testid={`hero-dot-${i}`}
                        className={`h-1.5 rounded-full transition-all duration-700 ${
                            i === idx ? 'w-10 bg-ashram-gold' : 'w-2 bg-white/50 hover:bg-white/80'
                        }`}
                    />
                ))}
            </div>

            {/* Scroll cue */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 text-white/70 animate-pulse">
                <ChevronDown size={22} aria-hidden />
            </div>
        </section>
    );
}
