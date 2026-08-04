import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CheckCircle2, IndianRupee, QrCode, ExternalLink, CalendarCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import EventPanelTabs from '@/components/organizer/EventPanelTabs';
import { organizerFetch, fetchEventOverviewStats, OrganizerEvent, EventOverviewStats } from './organizerApi';

const STATUS_COLOR: Record<string, string> = {
    DRAFT: 'bg-secondary text-muted-foreground',
    PUBLISHED: 'bg-emerald-500/20 text-emerald-400',
    CANCELLED: 'bg-destructive/20 text-destructive',
    COMPLETED: 'bg-blue-500/20 text-blue-400',
};

function formatRupees(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function StatTile({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string | number }) {
    return (
        <div className="rounded-2xl bg-gradient-card border border-border/60 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
                <p className="text-2xl font-bold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
        </div>
    );
}

export default function EventOverviewPage() {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<OrganizerEvent | null>(null);
    const [stats, setStats] = useState<EventOverviewStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        Promise.all([organizerFetch<OrganizerEvent>(`/${id}`), fetchEventOverviewStats(id)])
            .then(([e, s]) => { setEvent(e); setStats(s); })
            .catch(err => setError(err instanceof Error ? err.message : 'Failed to load event'))
            .finally(() => setLoading(false));
    }, [id]);

    if (!id) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-28 pb-20 px-6 max-w-6xl mx-auto">
                <EventPanelTabs eventId={id} active="overview" />

                {loading && <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />}
                {!loading && error && <p className="text-destructive text-center py-10">{error}</p>}

                {!loading && event && stats && (
                    <>
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Badge className={STATUS_COLOR[event.status]}>{event.status}</Badge>
                                    <span className="text-xs text-muted-foreground">{event.category.replace('_', ' ')} · {event.mode}</span>
                                </div>
                                <h1 className="text-2xl font-bold">{event.title}</h1>
                                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                                    <CalendarCheck className="w-3.5 h-3.5" />
                                    {new Date(event.startAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    {' - '}
                                    {new Date(event.endAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button asChild size="sm" variant="outline"><Link to={`/events/${event.slug}`} target="_blank"><ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Public Page</Link></Button>
                                <Button asChild size="sm" variant="outline"><Link to={`/events/organizer/${id}/checkin`}><QrCode className="w-3.5 h-3.5 mr-1.5" /> Check-in</Link></Button>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <StatTile icon={Users} label="Total Registrations" value={stats.totalRegistrations} />
                            <StatTile icon={CheckCircle2} label="Confirmed" value={stats.confirmedCount} />
                            <StatTile icon={QrCode} label="Checked In" value={stats.checkedInCount} />
                            <StatTile icon={IndianRupee} label="Revenue" value={formatRupees(stats.revenueInPaise)} />
                        </div>

                        {stats.registrationTrend.length > 1 && (
                            <div className="rounded-2xl bg-gradient-card border border-border/60 p-5 mb-6">
                                <h3 className="font-semibold mb-4">Registrations Over Time</h3>
                                <div className="h-[160px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats.registrationTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="hsl(345 100% 59%)" stopOpacity={0.35} />
                                                    <stop offset="100%" stopColor="hsl(345 100% 59%)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(0 0% 60%)', fontSize: 11 }}
                                                tickFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
                                            <Tooltip
                                                contentStyle={{ background: 'hsl(0 0% 8%)', border: '1px solid hsl(0 0% 100% / 0.1)', borderRadius: 8, fontSize: 12 }}
                                                labelFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                formatter={(value: number) => [value, 'Registrations']}
                                            />
                                            <Area type="monotone" dataKey="count" stroke="hsl(345 100% 59%)" strokeWidth={2} fill="url(#regGradient)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        <h3 className="font-semibold mb-3">Rounds</h3>
                        {event.rounds.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No rounds added yet. Add one from the Rounds & Submissions tab.</p>
                        ) : (
                            <div className="space-y-2">
                                {event.rounds.map(round => (
                                    <Link key={round.id} to={`/events/organizer/${id}/rounds/${round.id}`}
                                        className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 px-4 py-3 hover:border-primary/40 transition-colors">
                                        <span className="font-medium text-sm">{round.name}</span>
                                        <span className="text-xs text-muted-foreground">{round._count?.submissions ?? 0} submission(s)</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
