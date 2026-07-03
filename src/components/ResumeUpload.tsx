import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const mainVariant = {
    initial: { x: 0, y: 0 },
    animate: { x: 12, y: -12, opacity: 0.9 },
};

const secondaryVariant = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
};

const MAX_SIZE_MB = 5;

export function ResumeUpload({
    onChange,
    error,
}: {
    onChange?: (file: File | null) => void;
    error?: string;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [localError, setLocalError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const acceptFile = (candidate: File | undefined) => {
        setLocalError('');
        if (!candidate) return;
        if (candidate.type !== 'application/pdf') {
            setLocalError('Please upload your resume as a PDF.');
            return;
        }
        if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
            setLocalError(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
            return;
        }
        setFile(candidate);
        onChange?.(candidate);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(false);
        acceptFile(e.dataTransfer.files?.[0]);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        acceptFile(e.target.files?.[0]);
        e.target.value = ''; // allow re-selecting the same file
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        onChange?.(null);
    };

    const displayedError = error || localError;

    return (
        <div className="w-full">
            <motion.div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={handleDrop}
                whileHover="animate"
                className={cn(
                    'group/file relative block w-full cursor-pointer overflow-hidden rounded-xl border border-dashed p-8 transition-colors',
                    isDragActive ? 'border-primary/70 bg-primary/5' : 'border-border hover:border-primary/40',
                    displayedError && 'border-destructive/60'
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleInputChange}
                    className="hidden"
                />

                {/* Dot grid backdrop, masked to fade toward the edges */}
                <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
                    <GridPattern />
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center">
                    <p className="font-heading text-base font-semibold text-foreground">
                        Upload your resume
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Drag & drop or click to browse — PDF, up to {MAX_SIZE_MB} MB
                    </p>

                    <div className="relative mx-auto mt-8 w-full max-w-xl">
                        {file ? (
                            <motion.div
                                layoutId="resume-upload"
                                className="relative z-40 mx-auto flex w-full flex-col items-start justify-start rounded-lg border border-border/50 bg-card p-4 shadow-lg shadow-black/20"
                            >
                                <div className="flex w-full items-center justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <FileText className="h-5 w-5 shrink-0 text-primary" />
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            layout
                                            className="truncate text-sm font-medium text-foreground"
                                        >
                                            {file.name}
                                        </motion.p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            layout
                                            className="rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground"
                                        >
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </motion.p>
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            aria-label="Remove file"
                                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                <motion.div
                                    layoutId="resume-upload"
                                    variants={mainVariant}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className="relative z-40 mx-auto flex h-28 w-full max-w-[8rem] items-center justify-center rounded-lg border border-border/50 bg-card shadow-[0px_10px_50px_rgba(0,0,0,0.35)] group-hover/file:shadow-2xl"
                                >
                                    {isDragActive ? (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col items-center gap-1 text-xs text-muted-foreground"
                                        >
                                            Drop it
                                            <Upload className="h-4 w-4 text-primary" />
                                        </motion.p>
                                    ) : (
                                        <Upload className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </motion.div>

                                <motion.div
                                    variants={secondaryVariant}
                                    className="absolute inset-0 z-30 mx-auto flex h-28 w-full max-w-[8rem] items-center justify-center rounded-lg border border-dashed border-primary opacity-0"
                                />
                            </>
                        )}
                    </div>
                </div>
            </motion.div>

            {displayedError && (
                <p className="mt-2 text-xs text-destructive">{displayedError}</p>
            )}
        </div>
    );
}

function GridPattern() {
    const columns = 41;
    const rows = 11;
    return (
        <div className="flex shrink-0 scale-105 flex-wrap items-center justify-center gap-x-px gap-y-px bg-secondary/30">
            {Array.from({ length: rows }).map((_, row) =>
                Array.from({ length: columns }).map((_, col) => {
                    const index = row * columns + col;
                    return (
                        <div
                            key={`${col}-${row}`}
                            className={cn(
                                'flex h-10 w-10 shrink-0 rounded-[2px] bg-background/80',
                                index % 2 !== 0 && 'shadow-[0px_0px_1px_3px_hsl(0_0%_4%)_inset]'
                            )}
                        />
                    );
                })
            )}
        </div>
    );
}
