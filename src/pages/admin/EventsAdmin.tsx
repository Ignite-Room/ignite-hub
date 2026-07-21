import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import igniteLogo from '@/assets/ignite-logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function authHeader() {
    const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}/admin/${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || `HTTP ${res.status}`);
    }
    return res.json();
}

interface OrganizerRow {
    id: string; orgName: string; orgType: string; status: string;
    contactEmail: string; contactPhone: string; createdAt: string;
    user: { name: string; email: string };
    _count: { events: number };
}

interface EventRow {
    id: string; title: string; status: string; startAt: string;
    organizer: { orgName: string };
    _count: { registrations: number };
}

const ORG_STATUS_COLOR: Record<string, string> = {
    PENDING: 'bg-amber-500/10 text-amber-400',
    APPROVED: 'bg-emerald-500/10 text-emerald-400',
    REJECTED: 'bg-destructive/10 text-destructive',
    SUSPENDED: 'bg-secondary text-muted-foreground',
};

const EVENT_STATUS_COLOR: Record<string, string> = {
    DRAFT: 'bg-secondary text-muted-foreground',
    PUBLISHED: 'bg-emerald-500/10 text-emerald-400',
    CANCELLED: 'bg-destructive/10 text-destructive',
    COMPLETED: 'bg-blue-500/10 text-blue-400',
};

export default function EventsAdmin() {
    const [tab, setTab] = useState<'organizers' | 'events'>('organizers');
    const [organizers, setOrganizers] = useState<OrganizerRow[]>([]);
    const [events, setEvents] = useState<EventRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            if (tab === 'organizers') setOrganizers(await adminFetch('organizers'));
            else setEvents(await adminFetch('events'));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [tab]);

    const decideOrganizer = async (id: string, status: 'APPROVED' | 'REJECTED' | 'SUSPENDED') => {
        try {
            await adminFetch(`organizers/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
            load();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to update');
        }
    };

    const moderateEvent = async (id: string, status: 'DRAFT' | 'CANCELLED') => {
        if (!confirm(`Set this event to ${status}?`)) return;
        try {
            await adminFetch(`events/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
            load();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to update');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <img src={igniteLogo} alt="Ignite Room" className="h-7 w-auto" />
                        <span className="font-bold text-gradient">Events Admin</span>
                    </div>
                    <Link to="/ambassador/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Admin
                    </Link>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex gap-2 mb-6">
                    <Button variant={tab === 'organizers' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('organizers')}>Organizer Applications</Button>
                    <Button variant={tab === 'events' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('events')}>All Events</Button>
                </div>

                {loading && <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />}
                {!loading && error && <p className="text-destructive text-center py-10">{error}</p>}

                {!loading && !error && tab === 'organizers' && (
                    <div className="space-y-3">
                        {organizers.length === 0 && <p className="text-muted-foreground text-center py-10">No organizer applications.</p>}
                        {organizers.map(o => (
                            <div key={o.id} className="rounded-xl border border-border/50 bg-card p-4 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge className={ORG_STATUS_COLOR[o.status]}>{o.status}</Badge>
                                        <span className="text-xs text-muted-foreground">{o.orgType}</span>
                                    </div>
                                    <p className="font-medium">{o.orgName}</p>
                                    <p className="text-sm text-muted-foreground">{o.user.name} · {o.user.email} · {o._count.events} event(s)</p>
                                </div>
                                <div className="flex gap-2">
                                    {o.status === 'PENDING' && (
                                        <>
                                            <Button size="sm" variant="outline" className="text-emerald-400" onClick={() => decideOrganizer(o.id, 'APPROVED')}>
                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => decideOrganizer(o.id, 'REJECTED')}>
                                                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                            </Button>
                                        </>
                                    )}
                                    {o.status === 'APPROVED' && (
                                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => decideOrganizer(o.id, 'SUSPENDED')}>
                                            <Ban className="w-3.5 h-3.5 mr-1" /> Suspend
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && tab === 'events' && (
                    <div className="space-y-3">
                        {events.length === 0 && <p className="text-muted-foreground text-center py-10">No events yet.</p>}
                        {events.map(e => (
                            <div key={e.id} className="rounded-xl border border-border/50 bg-card p-4 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge className={EVENT_STATUS_COLOR[e.status]}>{e.status}</Badge>
                                    </div>
                                    <p className="font-medium">{e.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        By {e.organizer.orgName} · {new Date(e.startAt).toLocaleDateString('en-IN')} · {e._count.registrations} registered
                                    </p>
                                </div>
                                {e.status === 'PUBLISHED' && (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => moderateEvent(e.id, 'DRAFT')}>Unpublish</Button>
                                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => moderateEvent(e.id, 'CANCELLED')}>Cancel</Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
