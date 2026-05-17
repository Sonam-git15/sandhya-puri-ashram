import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Lightbox({ src, alt, onClose }) {
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    if (!src) return null;
    return (
        <div className="lightbox" role="dialog" aria-modal="true" data-testid="lightbox" onClick={onClose}>
            <button
                type="button"
                className="absolute top-5 right-5 text-white/85 hover:text-white p-2 transition-colors duration-500"
                aria-label="Close"
                onClick={onClose}
                data-testid="lightbox-close"
            >
                <X size={26} />
            </button>
            <img
                src={src}
                alt={alt || ''}
                className="max-w-[92vw] max-h-[88vh] object-contain rounded-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}
