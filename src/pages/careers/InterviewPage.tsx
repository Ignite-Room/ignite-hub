import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClock, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import igniteLogo from '@/assets/ignite-logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Slot { id: string; startTime: string; capacity: number; remaining: number }

interface InterviewData {
    applicantName: string;
    interview: { title: string; description: string | null; location: string | null; durationMinutes: number };
    status: 'INVITED' | 'SCHEDULED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
    bookedSlot: { id: string; startTime: string } | null;
    slots: Slot[];
}

function fmtDay(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long' });
}
function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function InterviewPage() {
    const { token } = useParams<{ token: string }>();
    const [data, setData] = useState<InterviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [booking, setBooking] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState('');

    const load = () => {
        fetch(`${API_URL}/careers/interview/${token}`)
            .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
            .then((d) => { setData(d); setLoading(false); })
            .catch(() => { setNotFound(true); setLoading(false); });
    };

    useEffect(() => { load(); }, [token]);

    const handleBook = async () => {
        if (!selectedSlot) return;
        setBooking(true);
        setError('');
        try {
            const r = await fetch(`${API_URL}/careers/interview/${token}/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slotId: selectedSlot }),
            });
            const body = await r.json();
            if (!r.ok) throw new Error(body.message);
            load();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Booking failed. Please try again.');
        } finally {
            setBooking(false);
        }
    };

    const handleCancel = async () => {
        setCancelling(true);
        setError('');
        try {
            const r = await fetch(`${API_URL}/careers/interview/${token}/cancel`, { method: 'POST' });
            const body = await r.json();
            if (!r.ok) throw new Error(body.message);
            load();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Cancellation failed. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    const slotsByDay = useMemo(() => {
        if (!data) return [];
        const groups = new Map<string, Slot[]>();
        for (const s of data.slots) {
            const key = fmtDay(s.startTime);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(s);
        }
        return Array.from(groups.entries());
    }, [data]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (notFound || !data) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
                <img src={igniteLogo} alt="Ignite Room" className="h-10 w-auto opacity-50" />
                <h1 className="text-xl font-semibold text-foreground">Link not found</h1>
                <p className="text-sm text-muted-foreground max-w-xs">This scheduling link is invalid or has expired. If you think this is a mistake, reach out to us at admin@igniteroom.in.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-2xl items-center gap-3 px-6 py-4">
                    <img src={igniteLogo} alt="Ignite Room" className="h-8 w-auto" />
                    <span className="font-heading font-semibold text-foreground">Ignite Room</span>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-6 py-12">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <p className="mb-2 text-sm text-muted-foreground">Hi {data.applicantName.split(' ')[0]},</p>
                    <h1 className="mb-4 font-heading text-2xl font-bold text-foreground">{data.interview.title}</h1>

                    <div className="mb-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> {data.interview.durationMinutes} minutes</span>
                        {data.interview.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {data.interview.location}</span>}
                    </div>

                    {data.interview.description && (
                        <div className="mb-8 rounded-xl border border-border/50 bg-secondary/20 p-6">
                            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Details</h2>
                            {data.interview.description.split('\n').map((line, i) => (
                                <p key={i} className="mb-3 last:mb-0 leading-7 text-sm text-muted-foreground">{line}</p>
                            ))}
                        </div>
                    )}

                    {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

                    {data.status === 'SCHEDULED' && data.bookedSlot ? (
                        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                            className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
                            <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
                            <h3 className="mb-1 font-semibold text-foreground">You're scheduled</h3>
                            <p className="mb-1 text-sm text-muted-foreground">{fmtDay(data.bookedSlot.startTime)}</p>
                            <p className="mb-5 text-lg font-semibold text-foreground">{fmtTime(data.bookedSlot.startTime)} IST</p>
                            <Button variant="outline" size="sm" onClick={handleCancel} disabled={cancelling}>
                                {cancelling ? 'Cancelling…' : 'Cancel & pick another time'}
                            </Button>
                        </motion.div>
                    ) : data.status === 'CANCELLED' ? (
                        <div className="rounded-xl border border-border/50 bg-secondary/20 p-6 text-center">
                            <p className="text-sm text-muted-foreground">This interview invite has been cancelled. Reach out to us if you think this is a mistake.</p>
                        </div>
                    ) : data.status === 'COMPLETED' || data.status === 'NO_SHOW' ? (
                        <div className="rounded-xl border border-border/50 bg-secondary/20 p-6 text-center">
                            <p className="text-sm text-muted-foreground">This interview has already taken place. Thanks for your time, we'll be in touch.</p>
                        </div>
                    ) : data.slots.length === 0 ? (
                        <div className="rounded-xl border border-border/50 bg-secondary/20 p-6 text-center">
                            <p className="text-sm text-muted-foreground">No time slots are open right now. We'll follow up with you directly to schedule.</p>
                        </div>
                    ) : (
                        <div>
                            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                                <CalendarClock className="h-3.5 w-3.5" /> Pick a time
                            </h2>
                            <div className="space-y-5">
                                {slotsByDay.map(([day, slots]) => (
                                    <div key={day}>
                                        <p className="mb-2 text-sm font-medium text-foreground">{day}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {slots.map((s) => (
                                                <button key={s.id} disabled={s.remaining <= 0}
                                                    onClick={() => setSelectedSlot(s.id)}
                                                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                                                        s.remaining <= 0
                                                            ? 'cursor-not-allowed border-border/30 bg-secondary/10 text-muted-foreground/30 line-through'
                                                            : selectedSlot === s.id
                                                                ? 'border-primary bg-primary/10 text-primary'
                                                                : 'border-border/50 bg-secondary/40 text-foreground hover:border-primary/40'
                                                    }`}>
                                                    {fmtTime(s.startTime)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button onClick={handleBook} disabled={!selectedSlot || booking} className="mt-8 w-full">
                                {booking ? 'Confirming…' : 'Confirm this time'}
                            </Button>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
