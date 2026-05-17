import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { useLang } from '../contexts/LanguageContext';

const FALLBACK = [
    {
        url: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85',
        title: 'Sandhya Aarti',
    },
    {
        url: 'https://images.unsplash.com/photo-1666694051761-cd972857da30?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85',
        title: 'Prasad Vitran',
    },
    {
        url: 'https://images.unsplash.com/photo-1538024333176-f25f63f873ee?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85',
        title: 'Bhandara Seva',
    },
    {
        url: 'https://images.unsplash.com/photo-1604078893234-ff3a1a5d5292?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85',
        title: 'Satsang',
    },
    {
        url: 'https://images.unsplash.com/photo-1772648892935-bba3be725552?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85',
        title: 'Festival Celebrations',
    },
];

export default function ActivitiesCarousel() {
    const { t } = useLang();
    const [items, setItems] = useState(FALLBACK);
    const [active, setActive] = useState(0);
    const touchStart = useRef(null);

    useEffect(() => {
        api.get('/activities')
            .then((r) => {
                const list = r.data?.activities || [];
                if (list.length) setItems(list);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (items.length < 2) return undefined;
        const id = setInterval(() => setActive((i) => (i + 1) % items.length), 5000);
        return () => clearInterval(id);
    }, [items.length]);

    const go = (delta) => {
        setActive((i) => (i + delta + items.length) % items.length);
    };

    const onTouchStart = (e) => {
        touchStart.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e) => {
        if (touchStart.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchStart.current = null;
    };

    const getSlide = (offset) => {
        const n = items.length;
        return items[(((active + offset) % n) + n) % n];
    };

    return (
        <section className="relative py-20 sm:py-28 bg-ashram-bg overflow-hidden" data-testid="activities-section">
            <div className="om-watermark" aria-hidden>ॐ</div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
                <div className="tracking-label fade-up">{t('activities_label')}</div>
                <h2 className="fade-up delay-1 mt-3 font-display text-3xl sm:text-4xl lg:text-5xl text-ashram-red tracking-tight" data-testid="activities-heading">
                    Sacred Activities at the Ashram
                </h2>
                <div className="ornament mt-6 max-w-md mx-auto" aria-hidden>
                    <span className="font-devanagari">❉</span>
                </div>
            </div>

            <div
                className="relative mt-14 max-w-7xl mx-auto px-4 sm:px-6"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                data-testid="activities-carousel"
            >
                <div className="relative h-[58vh] min-h-[380px] sm:min-h-[460px] flex items-center justify-center">
                    {/* Prev preview */}
                    <div
                        className="hidden md:block act-slide absolute left-[4%] top-1/2 -translate-y-1/2 w-[28%] h-[80%] rounded-2xl overflow-hidden opacity-50 scale-90 z-0 cursor-pointer"
                        onClick={() => go(-1)}
                        aria-hidden
                    >
                        <img src={getSlide(-1).url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-black/50" />
                    </div>

                    {/* Next preview */}
                    <div
                        className="hidden md:block act-slide absolute right-[4%] top-1/2 -translate-y-1/2 w-[28%] h-[80%] rounded-2xl overflow-hidden opacity-50 scale-90 z-0 cursor-pointer"
                        onClick={() => go(1)}
                        aria-hidden
                    >
                        <img src={getSlide(1).url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-black/50" />
                    </div>

                    {/* Active card */}
                    <div className="act-slide relative w-full md:w-[64%] h-full rounded-3xl overflow-hidden z-10 shadow-[0_20px_60px_rgba(155,34,38,0.18)]">
                        <img
                            key={getSlide(0).url}
                            src={getSlide(0).url}
                            alt={getSlide(0).title || 'Activity'}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-black/10" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
                            <div className="tracking-label !text-ashram-goldSoft">{t('activities_label')}</div>
                            <h3 className="font-display text-3xl sm:text-4xl mt-2 tracking-tight" data-testid="activities-active-title">
                                {getSlide(0).title || 'Sacred Activity'}
                            </h3>
                            {getSlide(0).description && (
                                <p className="mt-2 text-white/85 max-w-xl">{getSlide(0).description}</p>
                            )}
                        </div>
                    </div>

                    {/* Arrows */}
                    <button
                        type="button"
                        onClick={() => go(-1)}
                        aria-label="Previous"
                        data-testid="activities-prev"
                        className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/85 hover:bg-white text-ashram-red rounded-full p-2.5 shadow-md transition-colors duration-500"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <button
                        type="button"
                        onClick={() => go(1)}
                        aria-label="Next"
                        data-testid="activities-next"
                        className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/85 hover:bg-white text-ashram-red rounded-full p-2.5 shadow-md transition-colors duration-500"
                    >
                        <ChevronRight size={22} />
                    </button>
                </div>

                {/* Dots */}
                <div className="mt-8 flex items-center justify-center gap-2">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setActive(i)}
                            aria-label={`Activity ${i + 1}`}
                            data-testid={`activities-dot-${i}`}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                i === active ? 'w-10 bg-ashram-saffron' : 'w-2 bg-ashram-border hover:bg-ashram-gold'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
