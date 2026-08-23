import { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AvatarCropModalProps {
    imageDataUrl: string;
    onConfirm: (croppedBlob: Blob) => void;
    onCancel: () => void;
}

/** Extract a cropped circular blob from the image using a canvas */
async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', reject);
        image.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    const size = Math.min(pixelCrop.width, pixelCrop.height);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Circular clip
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(
        img,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        size,
        size
    );

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas toBlob returned null'));
        }, 'image/jpeg', 0.9);
    });
}

export default function AvatarCropModal({ imageDataUrl, onConfirm, onCancel }: AvatarCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [confirming, setConfirming] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return;
        setConfirming(true);
        try {
            const blob = await getCroppedBlob(imageDataUrl, croppedAreaPixels);
            onConfirm(blob);
        } catch (e) {
            console.error('Crop error', e);
        } finally {
            setConfirming(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />

                <motion.div
                    ref={containerRef}
                    className="relative z-10 w-full max-w-md bg-background border border-border/60 rounded-md overflow-hidden shadow-2xl"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                        <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-primary" />
                            <h2 className="font-semibold text-foreground text-sm">Crop Profile Photo</h2>
                        </div>
                        <button
                            onClick={onCancel}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Crop area */}
                    <div className="relative bg-black" style={{ height: 320 }}>
                        <Cropper
                            image={imageDataUrl}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>

                    {/* Controls */}
                    <div className="px-5 py-4 space-y-3 border-t border-border/40 bg-secondary/20">
                        {/* Zoom */}
                        <div className="flex items-center gap-3">
                            <ZoomOut className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.05}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="flex-1 h-1.5 rounded-full accent-primary cursor-pointer"
                            />
                            <ZoomIn className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>

                        {/* Rotate */}
                        <div className="flex items-center gap-3">
                            <RotateCcw className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <input
                                type="range"
                                min={-180}
                                max={180}
                                step={1}
                                value={rotation}
                                onChange={(e) => setRotation(Number(e.target.value))}
                                className="flex-1 h-1.5 rounded-full accent-primary cursor-pointer"
                            />
                            <span className="text-xs text-muted-foreground w-10 text-right">{rotation}°</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 px-5 py-4 border-t border-border/40">
                        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={confirming}>
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 gap-1.5"
                            onClick={handleConfirm}
                            disabled={confirming}
                        >
                            {confirming
                                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <Check className="w-4 h-4" />}
                            Save Photo
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
