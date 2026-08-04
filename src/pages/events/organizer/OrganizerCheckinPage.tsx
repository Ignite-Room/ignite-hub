import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { organizerFetch } from './organizerApi';

type ScanResult =
    | { kind: 'idle' }
    | { kind: 'success'; name: string; teamName: string | null }
    | { kind: 'already'; message: string }
    | { kind: 'invalid'; message: string };

const SCANNER_ELEMENT_ID = 'checkin-qr-reader';

export default function OrganizerCheckinPage() {
    const { id } = useParams<{ id: string }>();
    const [result, setResult] = useState<ScanResult>({ kind: 'idle' });
    const [scanning, setScanning] = useState(true);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const busyRef = useRef(false);

    useEffect(() => {
        if (!id) return;
        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = scanner;

        scanner.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            async (decodedText) => {
                if (busyRef.current) return;
                busyRef.current = true;
                try {
                    const res = await organizerFetch<{ ok: boolean; name: string; teamName: string | null }>(`/${id}/checkin`, {
                        method: 'POST',
                        body: JSON.stringify({ token: decodedText }),
                    });
                    setResult({ kind: 'success', name: res.name, teamName: res.teamName });
                } catch (e) {
                    const msg = e instanceof Error ? e.message : 'Check-in failed';
                    setResult(msg.toLowerCase().includes('already') ? { kind: 'already', message: msg } : { kind: 'invalid', message: msg });
                } finally {
                    setTimeout(() => { busyRef.current = false; }, 2500);
                }
            },
            () => { /* ignore per-frame scan errors — expected while no code is in view */ },
        ).catch(() => setScanning(false));

        return () => {
            scanner.stop().catch(() => { });
        };
    }, [id]);

    const resultMeta = {
        idle: { icon: null, bg: 'bg-zinc-900', text: 'Point camera at a ticket QR code' },
        success: { icon: <CheckCircle2 className="w-16 h-16 text-emerald-400" />, bg: 'bg-emerald-500/10', text: '' },
        already: { icon: <AlertTriangle className="w-16 h-16 text-amber-400" />, bg: 'bg-amber-500/10', text: '' },
        invalid: { icon: <XCircle className="w-16 h-16 text-destructive" />, bg: 'bg-destructive/10', text: '' },
    }[result.kind];

    return (
        <div
            className="bg-black text-white flex flex-col"
            style={{ minHeight: '100dvh', touchAction: 'none', paddingBottom: 'env(safe-area-inset-bottom)', paddingTop: 'env(safe-area-inset-top)' }}
        >
            <div className="flex items-center justify-between p-4">
                <Link to={`/events/organizer/${id}`} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Exit
                </Link>
                <span className="text-sm font-medium">Check-in Scanner</span>
                <span className="w-12" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6">
                {!scanning && (
                    <p className="text-center text-zinc-400 text-sm mb-4">Could not access camera. Check browser permissions.</p>
                )}
                <div id={SCANNER_ELEMENT_ID} className="w-full max-w-sm rounded-2xl overflow-hidden" />

                {result.kind !== 'idle' && (
                    <div className={`mt-6 w-full max-w-sm rounded-2xl p-6 text-center ${resultMeta.bg}`}>
                        <div className="flex justify-center mb-3">{resultMeta.icon}</div>
                        {result.kind === 'success' && (
                            <>
                                <p className="text-xl font-bold">{result.name}</p>
                                {result.teamName && <p className="text-zinc-400 text-sm mt-1">Team {result.teamName}</p>}
                                <p className="text-emerald-400 text-sm font-medium mt-2">Checked In</p>
                            </>
                        )}
                        {result.kind === 'already' && <p className="text-amber-300 font-medium">{result.message}</p>}
                        {result.kind === 'invalid' && <p className="text-destructive font-medium">{result.message}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
