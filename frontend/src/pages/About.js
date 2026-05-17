import React, { useEffect, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import { api } from '../lib/api';
import { useLang } from '../contexts/LanguageContext';

const DEFAULT_VIDEO = 'https://www.youtube.com/embed/8sYUyMaW8Sk';

function toEmbedUrl(url) {
    if (!url) return DEFAULT_VIDEO;
    try {
        const u = new URL(url);
        if (u.hostname.includes('youtube.com') && u.pathname === '/watch') {
            const v = u.searchParams.get('v');
            return v ? `https://www.youtube.com/embed/${v}` : url;
        }
        if (u.hostname === 'youtu.be') {
            return `https://www.youtube.com/embed${u.pathname}`;
        }
        return url;
    } catch {
        return url;
    }
}

export default function About() {
    const { t } = useLang();
    const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO);

    useEffect(() => {
        api.get('/video')
            .then((r) => {
                if (r.data?.url) setVideoUrl(toEmbedUrl(r.data.url));
            })
            .catch(() => {});
    }, []);

    return (
        <div data-testid="about-page" className="relative">
            <section className="relative py-20 sm:py-28 bg-ashram-bg overflow-hidden">
                <div className="om-watermark" aria-hidden>ॐ</div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                    <SectionHeading
                        label={t('about_label')}
                        title={t('about_heading')}
                        subtitle={t('about_intro')}
                    />

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
                        {/* Left: Video */}
                        <div className="relative">
                            <div className="aspect-video w-full rounded-3xl overflow-hidden border border-ashram-gold/40 shadow-[0_18px_60px_rgba(212,175,55,0.18)] bg-black">
                                <iframe
                                    src={videoUrl}
                                    title="About Ashram"
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    loading="lazy"
                                    data-testid="about-video"
                                />
                            </div>
                            <div className="mt-3 tracking-label">A glimpse into the ashram</div>
                        </div>

                        {/* Right: Content */}
                        <div className="space-y-8" data-testid="about-content">
                            <div>
                                <div className="tracking-label">{t('about_mission_label')}</div>
                                <p className="mt-2 text-ashram-inkSoft font-devanagari text-base sm:text-lg leading-relaxed">
                                    {t('about_mission')}
                                </p>
                            </div>
                            <div>
                                <div className="tracking-label">{t('about_purpose_label')}</div>
                                <p className="mt-2 text-ashram-inkSoft font-devanagari text-base sm:text-lg leading-relaxed">
                                    {t('about_purpose')}
                                </p>
                            </div>
                            <div>
                                <div className="tracking-label">{t('about_community_label')}</div>
                                <p className="mt-2 text-ashram-inkSoft font-devanagari text-base sm:text-lg leading-relaxed">
                                    {t('about_community')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
