import React from 'react';
import { Link } from 'react-router-dom';
import {
    Flame,
    Sparkles,
    HandHeart,
    UtensilsCrossed,
    Compass,
    HeartHandshake,
} from 'lucide-react';

import HeroSlider from '../components/HeroSlider';
import ActivitiesCarousel from '../components/ActivitiesCarousel';
import SectionHeading from '../components/SectionHeading';
import { useLang } from '../contexts/LanguageContext';

const ServiceCard = ({ Icon, title, desc, testid }) => (
    <div
        className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-ashram-border hover:border-ashram-gold transition-all duration-700 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(212,175,55,0.18)]"
        data-testid={testid}
    >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-ashram-bg text-ashram-saffron border border-ashram-border group-hover:bg-ashram-saffron group-hover:text-white transition-colors duration-700">
            <Icon size={22} />
        </div>
        <h3 className="mt-5 font-display text-xl sm:text-2xl text-ashram-ink tracking-tight">
            {title}
        </h3>
        <p className="mt-2 text-ashram-inkSoft text-sm leading-relaxed font-devanagari">{desc}</p>
    </div>
);

export default function Home() {
    const { t } = useLang();

    const services = [
        { key: 'satsang', Icon: Sparkles },
        { key: 'aarti', Icon: Flame },
        { key: 'bhandara', Icon: UtensilsCrossed },
        { key: 'prasad', Icon: HandHeart },
        { key: 'guidance', Icon: Compass },
    ];

    return (
        <div data-testid="home-page">
            <HeroSlider />

            {/* About summary */}
            <section className="relative py-20 sm:py-28 bg-white" data-testid="home-about-summary">
                <div className="absolute inset-0 grain" aria-hidden />
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-ashram-border">
                        <img
                            src="https://images.unsplash.com/photo-1604078893234-ff3a1a5d5292?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85"
                            alt="Spiritual meditation at ashram"
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        <div className="absolute bottom-5 left-5 text-white font-devanagari">
                            <div className="tracking-label !text-ashram-goldSoft">ॐ नमः शिवाय</div>
                        </div>
                    </div>
                    <div>
                        <div className="tracking-label fade-up">{t('about_summary_label')}</div>
                        <h2 className="fade-up delay-1 mt-3 font-display text-3xl sm:text-4xl lg:text-5xl text-ashram-red tracking-tight font-devanagari" data-testid="about-summary-heading">
                            {t('about_summary_heading')}
                        </h2>
                        <p className="fade-up delay-2 mt-6 text-ashram-inkSoft leading-relaxed font-devanagari text-base sm:text-lg">
                            {t('about_summary_body')}
                        </p>
                        <div className="fade-up delay-3 mt-8 flex flex-wrap gap-3">
                            <Link to="/about" className="btn-saffron" data-testid="home-about-cta">
                                Discover Ashram
                            </Link>
                            <Link to="/history" className="btn-outline-gold" data-testid="home-history-cta">
                                View More
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="relative py-20 sm:py-28 bg-ashram-bg" data-testid="home-services">
                <div className="om-watermark" aria-hidden>ॐ</div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                    <SectionHeading
                        label={t('services_label')}
                        title={t('services_heading')}
                    />
                    <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {services.map(({ key, Icon }) => (
                            <ServiceCard
                                key={key}
                                Icon={Icon}
                                title={t(`service_${key}`)}
                                desc={t(`service_${key}_desc`)}
                                testid={`service-card-${key}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Donation CTA */}
            <section className="relative py-20 sm:py-24 bg-white" data-testid="home-donate-cta">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
                    <div className="relative overflow-hidden rounded-3xl border border-ashram-gold/40 bg-gradient-to-br from-[#FFF8EC] to-[#FDFBF7] px-6 sm:px-12 py-12 sm:py-16 text-center">
                        <span className="absolute -top-12 -right-12 text-[18rem] font-devanagari text-ashram-gold/10 leading-none select-none" aria-hidden>ॐ</span>
                        <div className="tracking-label">{t('donate_cta_label')}</div>
                        <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl text-ashram-red tracking-tight font-devanagari">
                            {t('donate_cta_heading')}
                        </h2>
                        <p className="mt-5 max-w-2xl mx-auto text-ashram-inkSoft text-base sm:text-lg font-devanagari leading-relaxed">
                            {t('donate_cta_body')}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3 justify-center">
                            <Link to="/donate" className="btn-saffron" data-testid="home-cta-donate">
                                <HeartHandshake size={18} /> Donate Now
                            </Link>
                            <Link to="/contact" className="btn-outline-gold" data-testid="home-cta-contact">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Activities carousel - placed before footer */}
            <ActivitiesCarousel />
        </div>
    );
}
