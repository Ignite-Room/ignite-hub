import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, XCircle, Ban, Search, Star, TrendingUp, Users, CalendarDays, IndianRupee, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import ReferralChart from '@/pages/dashboard/components/ReferralChart';
import { adminEventsFetch, fetchEventsAnalytics, AdminEventSummary, EventsAnalytics } from './adminEventsApi';
import igniteLogo from '@/assets/ignite-logo.png';

interface OrganizerRow {
    id: string; orgName: string; orgType: string; status: string;
    contactEmail: string; contactPhone: string; createdAt: string;
    user: { name: string; email: string };
    _count: { events: number };
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

function formatRupees(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <div className="glass-card rounded-xl p-4 border border-border/50 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary flex-shrink-0">{icon}</div>
            <div className="min-w-0">
                <p className="text-lg font-bold text-foreground truncate">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

export default function EventsAdmin() {
    const [tab, setTab] = useState<'organizers' | 'events'>('events');
    const [organizers, setOrganizers] = useState<OrganizerRow[]>([]);
    const [events, setEvents] = useState<AdminEventSummary[]>([]);
    const [analytics, setAnalytics] = useState<EventsAnalytics | null>(null);
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'>('ALL');
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            if (tab === 'organizers') {
                setOrganizers(await adminEventsFetch('/organizers'));
            } else {
                const [eventsRes, analyticsRes] = await Promise.all([
                    adminEventsFetch<AdminEventSummary[]>('/events'),
                    fetchEventsAnalytics(),
                ]);
                setEvents(eventsRes);
                setAnalytics(analyticsRes);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [tab]);

    const decideOrganizer = async (id: string, status: 'APPROVED' | 'REJECTED' | 'SUSPENDED') => {
        try {
            await adminEventsFetch(`/organizers/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
            load();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to update');
        }
    };

    const moderateEvent = async (id: string, status: 'DRAFT' | 'CANCELLED') => {
        if (!confirm(`Set this event to ${status}?`)) return;
        try {
            await adminEventsFetch(`/events/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
            load();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to update');
        }
    };

    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
            if (query && !e.title.toLowerCase().includes(query.toLowerCase()) && !e.organizer.orgName.toLowerCase().includes(query.toLowerCase())) return false;
            return true;
        });
    }, [events, statusFilter, query]);

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
                    <Button variant={tab === 'events' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('events')}>All Events</Button>
                    <Button variant={tab === 'organizers' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('organizers')}>Organizer Applications</Button>
                </div>

                {loading && <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />}
                {!loading && error && <p className="text-destructive text-center py-10">{error}</p>}

                {!loading && !error && tab === 'organizers' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
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
                    </motion.div>
                )}

                {!loading && !error && tab === 'events' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {analytics && (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <StatTile icon={<CalendarDays className="w-4 h-4" />} label="Published events" value={analytics.publishedEvents} />
                                    <StatTile icon={<Users className="w-4 h-4" />} label="Total registrations" value={analytics.totalRegistrations} />
                                    <StatTile icon={<TrendingUp className="w-4 h-4" />} label="Confirmed" value={analytics.confirmedRegistrations} />
                                    <StatTile icon={<IndianRupee className="w-4 h-4" />} label="Total revenue" value={formatRupees(analytics.totalRevenueInPaise)} />
                                </div>

                                <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
                                    <ReferralChart data={analytics.registrationsOverTime} title="Registrations, last 30 days" label="Registrations" />
                                    <div className="glass-card rounded-2xl p-5 border border-border/50">
                                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                            <Star className="w-4 h-4 text-primary" /> Top Events
                                        </h3>
                                        <div className="space-y-3">
                                            {analytics.topEvents.length === 0 && <p className="text-xs text-muted-foreground">No registrations yet.</p>}
                                            {analytics.topEvents.map((e, i) => (
                                                <Link key={e.id} to={`/ambassador/admin/events/${e.id}`} className="flex items-center justify-between gap-2 text-sm hover:text-primary transition-colors">
                                                    <span className="truncate flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                                                        <span className="truncate">{e.title}</span>
                                                    </span>
                                                    <span className="text-xs text-muted-foreground flex-shrink-0">{e.registrations} regs</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="Search by event or organizer..." value={query} onChange={e => setQuery(e.target.value)} className="pl-9 h-10 bg-secondary/30 border-border/40" />
                            </div>
                            <div className="flex gap-1 bg-secondary/30 rounded-lg p-1 border border-border/40 overflow-x-auto">
                                {(['ALL', 'DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'] as const).map(f => (
                                    <button key={f} onClick={() => setStatusFilter(f)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${statusFilter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >{f}</button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filteredEvents.length === 0 && <p className="text-muted-foreground text-center py-10">No events match.</p>}
                            {filteredEvents.map(e => (
                                <div key={e.id} className="rounded-xl border border-border/50 bg-card p-4 flex flex-wrap items-center justify-between gap-4 hover:border-primary/30 transition-colors">
                                    <Link to={`/ambassador/admin/events/${e.id}`} className="flex-1 min-w-0 group">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <Badge className={EVENT_STATUS_COLOR[e.status]}>{e.status}</Badge>
                                            {e.isFeatured && <Badge className="bg-primary/20 text-primary border-primary/30">Featured</Badge>}
                                        </div>
                                        <p className="font-medium group-hover:text-primary transition-colors flex items-center gap-1">
                                            {e.title} <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            By {e.organizer.orgName} · {new Date(e.startAt).toLocaleDateString('en-IN')} · {e._count.registrations} registered
                                            {e.revenueInPaise > 0 && ` · ${formatRupees(e.revenueInPaise)} revenue`}
                                        </p>
                                    </Link>
                                    {e.status === 'PUBLISHED' && (
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Button size="sm" variant="outline" onClick={() => moderateEvent(e.id, 'DRAFT')}>Unpublish</Button>
                                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => moderateEvent(e.id, 'CANCELLED')}>Cancel</Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
