import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';

/**
 * FileUpload — Drag & drop file picker with previews.
 * Props:
 *   accept: string (e.g. "image/*" or "video/*")
 *   multiple: boolean
 *   onFiles: (File[]) => void  — called when user clicks the upload action button below
 *   busy: boolean
 *   uploadLabel: string (optional, default "Upload")
 *   testidPrefix: string (optional)
 *   note: string (optional)
 */
export default function FileUpload({
    accept = 'image/jpeg,image/png,image/webp,image/jpg',
    multiple = true,
    onFiles,
    busy = false,
    uploadLabel = 'Upload',
    testidPrefix = 'file-upload',
    note = 'JPG, PNG or WEBP — up to 12 MB each',
}) {
    const inputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [dragOver, setDragOver] = useState(false);

    const addFiles = useCallback(
        (incoming) => {
            const arr = Array.from(incoming || []);
            if (arr.length === 0) return;
            const next = multiple ? [...files, ...arr] : arr.slice(0, 1);
            setFiles(next);
            // Generate previews
            const previewsNext = next.map((f) =>
                f.type.startsWith('video/')
                    ? { type: 'video', name: f.name, url: URL.createObjectURL(f) }
                    : { type: 'image', name: f.name, url: URL.createObjectURL(f) }
            );
            setPreviews(previewsNext);
        },
        [files, multiple]
    );

    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        addFiles(e.dataTransfer.files);
    };

    const removeAt = (idx) => {
        const next = files.slice();
        next.splice(idx, 1);
        setFiles(next);
        const pNext = previews.slice();
        const removed = pNext.splice(idx, 1)[0];
        if (removed) try { URL.revokeObjectURL(removed.url); } catch { /* noop */ }
        setPreviews(pNext);
    };

    const reset = () => {
        previews.forEach((p) => { try { URL.revokeObjectURL(p.url); } catch { /* noop */ } });
        setFiles([]);
        setPreviews([]);
        if (inputRef.current) inputRef.current.value = '';
    };

    const triggerUpload = () => {
        if (files.length === 0) return;
        onFiles && onFiles(files, reset);
    };

    return (
        <div className="space-y-4" data-testid={`${testidPrefix}-root`}>
            <label
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-500 px-6 py-10 text-center ${
                    dragOver
                        ? 'border-ashram-saffron bg-ashram-saffron/5'
                        : 'border-ashram-border bg-ashram-bg hover:border-ashram-gold'
                }`}
                data-testid={`${testidPrefix}-dropzone`}
            >
                <UploadCloud className={`${dragOver ? 'text-ashram-saffron' : 'text-ashram-gold'} transition-colors duration-500`} size={32} />
                <div className="font-display text-base text-ashram-ink">
                    {dragOver ? 'Drop files here' : multiple ? 'Drag & drop files or click to browse' : 'Drag & drop a file or click to browse'}
                </div>
                <div className="text-xs text-ashram-inkSoft">{note}</div>
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                    data-testid={`${testidPrefix}-input`}
                />
            </label>

            {previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" data-testid={`${testidPrefix}-previews`}>
                    {previews.map((p, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden border border-ashram-border bg-white">
                            {p.type === 'video' ? (
                                <video src={p.url} className="w-full aspect-square object-cover" muted />
                            ) : (
                                <img src={p.url} alt={p.name} className="w-full aspect-square object-cover" />
                            )}
                            <button
                                type="button"
                                onClick={() => removeAt(i)}
                                className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                                aria-label="Remove"
                                data-testid={`${testidPrefix}-remove-${i}`}
                            >
                                <X size={12} />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1.5 py-1 truncate">{p.name}</div>
                        </div>
                    ))}
                </div>
            )}

            {files.length > 0 && (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={triggerUpload}
                        disabled={busy}
                        className="btn-saffron !py-2 text-sm disabled:opacity-60"
                        data-testid={`${testidPrefix}-submit`}
                    >
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                        {busy ? 'Uploading…' : `${uploadLabel} (${files.length})`}
                    </button>
                    <button
                        type="button"
                        onClick={reset}
                        disabled={busy}
                        className="btn-outline-gold !py-2 text-sm"
                        data-testid={`${testidPrefix}-clear`}
                    >
                        Clear
                    </button>
                </div>
            )}
        </div>
    );
}
