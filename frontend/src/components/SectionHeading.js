import React from 'react';

// Section heading with golden ornament and tracking label
export default function SectionHeading({ label, title, subtitle, align = 'center', className = '', titleClass = '' }) {
    const alignCls = align === 'left' ? 'text-left' : 'text-center mx-auto';
    return (
        <div className={`${alignCls} max-w-3xl ${className}`}>
            {label && <div className="tracking-label fade-up">{label}</div>}
            {title && (
                <h2
                    className={`fade-up delay-1 mt-3 font-display tracking-tight text-3xl sm:text-4xl lg:text-5xl text-ashram-red ${titleClass}`}
                >
                    {title}
                </h2>
            )}
            {subtitle && (
                <p className="fade-up delay-2 mt-4 text-ashram-inkSoft font-devanagari text-base sm:text-lg leading-relaxed">
                    {subtitle}
                </p>
            )}
            {align === 'center' && (
                <div className="ornament mt-6 mx-auto max-w-xs" aria-hidden>
                    <span className="font-devanagari">❉</span>
                </div>
            )}
        </div>
    );
}
