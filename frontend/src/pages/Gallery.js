import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import Lightbox from '../components/Lightbox';
import { api } from '../lib/api';
import { useLang } from '../contexts/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Resolve relative /api/uploads URLs against the backend host
function resolveUrl(url) {
    if (!url) return url;
    if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
    return `${BACKEND_URL}${url}`;
}

export default function Gallery() {
    const { t } = useLang();
    const [page, setPage] = useState(1);
    const [data, setData] = useState({ images: [], totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lightboxIndex, setLightboxIndex] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError('');
        api.get('/gallery', { params: { page, limit: 9 } })
            .then((r) => {
                if (!mounted) return;
                setData(r.data);
            })
            .catch(() => {
                if (mounted) setError('Unable to load gallery. Please try again.');
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, [page]);

    const pages = Array.from({ length: data.totalPages }, (_, i) => i + 1);
    const lightboxItems = data.images.map((img) => ({
        id: img.id,
        url: resolveUrl(img.url),
        caption: img.caption || '',
    }));

    return (
        <div data-testid="gallery-page" className="relative">
            <section className="relative py-20 sm:py-28 bg-ashram-bg overflow-hidden">
                <div className="om-watermark" aria-hidden>ॐ</div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                    <SectionHeading label={t('gallery_label')} title={t('gallery_heading')} />

                    {loading ? (
                        <div className="mt-16 flex items-center justify-center text-ashram-inkSoft" data-testid="gallery-loading">
                            <Loader2 className="animate-spin mr-2" size={20} /> Loading…
                        </div>
                    ) : error ? (
                        <div className="mt-16 text-center text-ashram-red" data-testid="gallery-error">{error}</div>
                    ) : data.images.length === 0 ? (
                        <div className="mt-16 text-center text-ashram-inkSoft" data-testid="gallery-empty">
                            No images available yet.
                        </div>
                    ) : (
                        <>
                            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-7" data-testid="gallery-grid">
                                {data.images.map((img, idx) => (
                                    <button
                                        key={img.id}
                                        type="button"
                                        onClick={() => setLightboxIndex(idx)}
                                        className="group relative overflow-hidden rounded-2xl border border-ashram-border bg-white aspect-square"
                                        data-testid={`gallery-item-${img.id}`}
                                    >
                                        <img
                                            src={resolveUrl(img.url)}
                                            alt={img.caption || 'Ashram gallery image'}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    </button>
                                ))}
                            </div>

                            {/* Pagination */}
                            {data.totalPages > 1 && (
                                <div className="mt-12 flex items-center justify-center gap-2" data-testid="gallery-pagination">
                                    <button
                                        type="button"
                                        disabled={page === 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-ashram-border bg-white text-ashram-ink disabled:opacity-40 hover:border-ashram-gold transition-colors duration-500"
                                        data-testid="gallery-prev"
                                    >
                                        <ChevronLeft size={16} /> Previous
                                    </button>
                                    {pages.map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPage(p)}
                                            data-testid={`gallery-page-${p}`}
                                            className={`min-w-9 h-9 px-3 rounded-md text-sm transition-colors duration-500 ${
                                                p === page
                                                    ? 'bg-ashram-saffron text-white'
                                                    : 'bg-white border border-ashram-border text-ashram-ink hover:border-ashram-gold'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        disabled={page === data.totalPages}
                                        onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-ashram-border bg-white text-ashram-ink disabled:opacity-40 hover:border-ashram-gold transition-colors duration-500"
                                        data-testid="gallery-next"
                                    >
                                        Next <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {lightboxIndex != null && (
                <Lightbox
                    items={lightboxItems}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onIndexChange={setLightboxIndex}
                />
            )}
        </div>
    );
}
