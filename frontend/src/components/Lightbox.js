import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Lightbox — full-screen image viewer with prev/next, keyboard navigation,
 * and mobile swipe support.
 *
 * Props:
 *   items: [{ id, url, caption }, ...]
 *   index: number (current index)
 *   onClose: ()=>void
 *   onIndexChange: (next:number)=>void
 */
export default function Lightbox({ items = [], index = 0, onClose, onIndexChange }) {
  const touchStart = useRef(null);
  const [animKey, setAnimKey] = useState(0);

  const total = items.length;
  const current = items[index];

  const go = (delta) => {
    if (total === 0) return;
    const next = (index + delta + total) % total;
    onIndexChange && onIndexChange(next);
    setAnimKey((k) => k + 1);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose && onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total]);

  if (!current) return null;

  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touchStart.current = null;
  };

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      data-testid="lightbox"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close */}
      <button
        type="button"
        className="absolute top-5 right-5 text-white/85 hover:text-white p-2 transition-colors duration-500 z-10"
        aria-label="Close"
        onClick={onClose}
        data-testid="lightbox-close"
      >
        <X size={26} />
      </button>

      {/* Prev */}
      {total > 1 && (
        <button
          type="button"
          aria-label="Previous"
          data-testid="lightbox-prev"
          onClick={(e) => { e.stopPropagation(); go(-1); }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 bg-white/15 hover:bg-white/30 text-white rounded-full p-2.5 transition-colors duration-500 backdrop-blur"
        >
          <ChevronLeft size={26} />
        </button>
      )}

      {/* Image */}
      <img
        key={animKey}
        src={current.url}
        alt={current.caption || ''}
        className="max-w-[92vw] max-h-[88vh] object-contain rounded-md shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        data-testid="lightbox-image"
      />

      {/* Caption */}
      {current.caption && (
        <div className="absolute bottom-20 sm:bottom-10 left-0 right-0 flex justify-center px-6">
          <div className="bg-black/45 text-white text-sm px-4 py-2 rounded-full backdrop-blur" data-testid="lightbox-caption">
            {current.caption}
          </div>
        </div>
      )}

      {/* Next */}
      {total > 1 && (
        <button
          type="button"
          aria-label="Next"
          data-testid="lightbox-next"
          onClick={(e) => { e.stopPropagation(); go(1); }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 bg-white/15 hover:bg-white/30 text-white rounded-full p-2.5 transition-colors duration-500 backdrop-blur"
        >
          <ChevronRight size={26} />
        </button>
      )}

      {/* Counter */}
      {total > 1 && (
        <div className="absolute bottom-5 left-0 right-0 text-center text-white/70 text-xs tracking-widest" data-testid="lightbox-counter">
          {index + 1} / {total}
        </div>
      )}
    </div>
  );
}
