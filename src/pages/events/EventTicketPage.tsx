import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, CheckCircle2, XCircle, ExternalLink, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, EventTicket, TicketRound } from '@/lib/api';

const ROUND_STATUS_META: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Not submitted yet', color: 'text-amber-400' },
    SUBMITTED: { label: 'Submitted', color: 'text-sky-400' },
    SHORTLISTED: { label: 'Shortlisted', color: 'text-emerald-400' },
    REJECTED: { label: 'Not shortlisted', color: 'text-muted-foreground' },
};

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
    }) + ' IST';
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
    CONFIRMED: { label: 'Confirmed', color: 'text-emerald-400' },
    CHECKED_IN: { label: 'Checked In', color: 'text-primary' },
    CANCELLED: { label: 'Cancelled', color: 'text-destructive' },
    NO_SHOW: { label: 'No Show', color: 'text-muted-foreground' },
    REFUNDED: { label: 'Refunded', color: 'text-muted-foreground' },
    PENDING_PAYMENT: { label: 'Pending Payment', color: 'text-amber-400' },
};

export default function EventTicketPage() {
    const { token } = useParams<{ token: string }>();
    const [ticket, setTicket] = useState<EventTicket | null>(null);
    const [rounds, setRounds] = useState<TicketRound[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const load = () => {
        if (!token) return;
        setLoading(true);
        api.getEventTicket(token)
            .then(setTicket)
            .catch(e => setError(e instanceof Error ? e.message : 'Ticket not found'))
            .finally(() => setLoading(false));
        api.getTicketRounds(token).then(setRounds).catch(() => setRounds([]));
    };

    useEffect(load, [token]);

    const handleCancel = async () => {
        if (!token) return;
        if (!confirm('Cancel this registration? This cannot be undone.')) return;
        setCancelling(true);
        try {
            await api.cancelEventTicket(token);
            load();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Cancellation failed');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[100dvh] bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-6 text-center">
                <XCircle className="w-10 h-10 text-destructive mb-3" />
                <h1 className="text-xl font-bold mb-2">Ticket not found</h1>
                <p className="text-muted-foreground text-sm mb-6">{error}</p>
                <Button asChild variant="outline"><Link to="/events">Browse Events</Link></Button>
            </div>
        );
    }

    const statusMeta = STATUS_LABEL[ticket.status] ?? { label: ticket.status, color: 'text-muted-foreground' };
    const canCancel = ticket.status === 'CONFIRMED' && new Date(ticket.event.startAt) > new Date();

    return (
        <div className="min-h-[100dvh] bg-background flex flex-col items-center px-6 py-10" style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
            <div className="w-full max-w-sm glass-card rounded-2xl p-6 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{ticket.event.organizer.orgName}</p>
                <h1 className="text-xl font-bold mb-4">{ticket.event.title}</h1>

                <div className="bg-white rounded-xl p-4 inline-block mb-4">
                    <QRCodeSVG value={ticket.token} size={200} />
                </div>

                <div className={`flex items-center justify-center gap-1.5 text-sm font-medium mb-4 ${statusMeta.color}`}>
                    <CheckCircle2 className="w-4 h-4" /> {statusMeta.label}
                </div>

                <div className="text-left space-y-3 border-t border-border/40 pt-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span>{formatDateTime(ticket.event.startAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span>{ticket.event.mode === 'ONLINE' ? 'Online' : (ticket.event.venueName || ticket.event.venueAddress || 'TBA')}</span>
                    </div>
                    {ticket.event.onlineUrl && (
                        <a href={ticket.event.onlineUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                            <ExternalLink className="w-4 h-4 flex-shrink-0" /> Join online
                        </a>
                    )}
                    <div className="text-sm pt-2">
                        <p className="text-muted-foreground text-xs mb-0.5">Registered as</p>
                        <p className="font-medium">{ticket.name}{ticket.teamName ? ` (Team ${ticket.teamName})` : ''}</p>
                    </div>
                    {ticket.teamMembers.length > 0 && (
                        <div className="text-sm">
                            <p className="text-muted-foreground text-xs mb-1">Team Members</p>
                            <ul className="space-y-0.5">
                                {ticket.teamMembers.map((m, i) => <li key={i}>{m.name}</li>)}
                            </ul>
                        </div>
                    )}
                </div>

                {rounds.length > 0 && (
                    <div className="text-left border-t border-border/40 pt-4 mt-4 space-y-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Rounds</p>
                        {rounds.map(round => {
                            const status = round.submission?.status ?? 'PENDING';
                            const meta = ROUND_STATUS_META[status];
                            const canSubmit = status === 'PENDING' && !round.deadlinePassed;
                            return (
                                <div key={round.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/30 border border-border/40">
                                    <div>
                                        <p className="text-sm font-medium">{round.name}</p>
                                        <p className={`text-xs ${meta.color}`}>{meta.label}</p>
                                        {round.submissionDeadline && !round.submission && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Clock className="w-3 h-3" />
                                                {round.deadlinePassed ? 'Deadline passed' : `Due ${new Date(round.submissionDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                                            </p>
                                        )}
                                    </div>
                                    {canSubmit && (
                                        <Button asChild size="sm" variant="outline">
                                            <Link to={`/events/ticket/${token}/rounds/${round.id}`}>
                                                Submit <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {canCancel && (
                    <Button
                        variant="outline"
                        className="w-full mt-6 border-destructive/40 text-destructive hover:bg-destructive/10"
                        onClick={handleCancel}
                        disabled={cancelling}
                    >
                        {cancelling ? 'Cancelling...' : 'Cancel Registration'}
                    </Button>
                )}
            </div>
        </div>
    );
}
