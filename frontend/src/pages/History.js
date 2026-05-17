import React from 'react';
import { useLang } from '../contexts/LanguageContext';

export default function History() {
    const { t } = useLang();
    return (
        <div data-testid="history-page" className="relative">
            <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
                <div className="om-watermark" aria-hidden>ॐ</div>
                <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
                    <div className="tracking-label fade-up">Itihaas</div>
                    <h1
                        className="fade-up delay-1 mt-3 font-devanagari text-ashram-red text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight"
                        data-testid="history-heading"
                    >
                        {t('history_heading')}
                    </h1>
                    <div className="ornament mt-6 mx-auto max-w-md" aria-hidden>
                        <span className="font-devanagari">❉</span>
                    </div>
                </div>

                <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 mt-12 space-y-7 text-ashram-ink leading-loose">
                    <p className="font-devanagari text-base sm:text-lg fade-up">
                        <span className="float-left mr-3 text-6xl font-display text-ashram-saffron leading-[0.8] mt-1">
                            {t('history_p1').charAt(0)}
                        </span>
                        {t('history_p1').slice(1)}
                    </p>
                    <p className="font-devanagari text-base sm:text-lg text-ashram-inkSoft fade-up delay-1">
                        {t('history_p2')}
                    </p>
                    <p className="font-devanagari text-base sm:text-lg text-ashram-inkSoft fade-up delay-2">
                        {t('history_p3')}
                    </p>
                    <p className="font-devanagari text-base sm:text-lg text-ashram-inkSoft fade-up delay-3">
                        {t('history_p4')}
                    </p>
                    <div className="ornament mt-12 max-w-xs mx-auto" aria-hidden>
                        <span className="font-devanagari text-ashram-gold">ॐ</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
