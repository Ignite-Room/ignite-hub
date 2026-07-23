import { useRef, useState } from 'react';
import { ImagePlus, Upload, X } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { organizerUpload } from '../organizerApi';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];

export default function CoverImageStep({ eventId, coverImageUrl, onChange }: { eventId: string; coverImageUrl: string | null; onChange: (url: string) => void }) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [err, setErr] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        setErr('');
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setErr('Only JPG, PNG, WebP, and AVIF images are accepted.');
            return;
        }
        setUploading(true);
        try {
            const form = new FormData();
            form.append('cover', file);
            const res = await organizerUpload<{ coverImageUrl: string }>(`/${eventId}/cover-image`, form);
            onChange(res.coverImageUrl);
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold mb-1">Event Banner</h3>
                <p className="text-xs text-muted-foreground">This is the first thing people see, on your event page and wherever it's shared. 1200px wide works best.</p>
            </div>

            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFile(file);
                }}
                onClick={() => inputRef.current?.click()}
                className={`relative rounded-2xl overflow-hidden cursor-pointer transition-colors ${
                    coverImageUrl ? 'h-56' : 'h-44 flex items-center justify-center'
                } ${dragOver ? 'border-2 border-primary bg-primary/5' : 'border-2 border-dashed border-border/60 bg-secondary/20 hover:border-primary/40'}`}
            >
                {coverImageUrl ? (
                    <>
                        <div
                            className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-50"
                            style={{ backgroundImage: `url(${coverImageUrl})` }}
                            aria-hidden="true"
                        />
                        <img src={coverImageUrl} alt="Event banner" className="relative w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                            <span className="flex items-center gap-2 text-white text-sm font-medium">
                                <Upload className="w-4 h-4" /> Replace banner
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <ImagePlus className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">{uploading ? 'Uploading...' : 'Drop an image, or click to browse'}</p>
                        <p className="text-xs mt-1">JPG, PNG, WebP, or AVIF, up to 5 MB</p>
                    </div>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
            />

            {err && (
                <p className="text-xs text-destructive flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {err}</p>
            )}
            {coverImageUrl && (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                    <X className="w-3 h-3" /> Choose a different image
                </button>
            )}
        </div>
    );
}
