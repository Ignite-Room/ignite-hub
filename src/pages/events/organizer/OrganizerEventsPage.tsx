import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Pencil, QrCode, Download, Rocket, Trash2, CalendarCheck, FileEdit, Sparkles, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OrganizerLayout from '@/components/organizer/OrganizerLayout';
import { organizerFetch, organizerExportUrl, OrganizerEvent } from './organizerApi';
import { fetchEarnings } from './organizerPayoutsApi';

function formatRupees(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

const STATUS_COLOR: Record<string, string> = {
    DRAFT: 'bg-secondary text-muted-foreground',
    PUBLISHED: 'bg-emerald-500/20 text-emerald-400',
    CANCELLED: 'bg-destructive/20 text-destructive',
    COMPLETED: 'bg-blue-500/20 text-blue-400',
};

function StatTile({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number | string }) {
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

export default function OrganizerEventsPage() {
    const [events, setEvents] = useState<OrganizerEvent[]>([]);
    const [pendingPayoutInPaise, setPendingPayoutInPaise] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notOrganizer, setNotOrganizer] = useState(false);

    const load = () => {
        setLoading(true);
        organizerFetch<OrganizerEvent[]>('/')
            .then(setEvents)
            .catch(e => {
                const msg = e instanceof Error ? e.message : 'Failed to load events';
                if (msg.toLowerCase().includes('organizer profile') || msg.toLowerCase().includes('pending') || msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('suspended')) {
                    setNotOrganizer(true);
                }
                setError(msg);
            })
            .finally(() => setLoading(false));
        fetchEarnings().then(e => setPendingPayoutInPaise(e.pendingInPaise)).catch(() => {});
    };

    useEffect(load, []);

    const stats = useMemo(() => ({
        published: events.filter(e => e.status === 'PUBLISHED').length,
        draft: events.filter(e => e.status === 'DRAFT').length,
        registrations: events.reduce((sum, e) => sum + e._count.registrations, 0),
    }), [events]);

    const handlePublish = async (id: string) => {
        try {
            await organizerFetch(`/${id}/publish`, { method: 'POST' });
            load();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to publish');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this draft event? This cannot be undone.')) return;
        try {
            await organizerFetch(`/${id}`, { method: 'DELETE' });
            load();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to delete');
        }
    };

    return (
        <OrganizerLayout
            title="Publisher Dashboard"
            breadcrumb={['Organizer']}
            actions={!notOrganizer ? (
                <Button asChild size="sm"><Link to="/events/organizer/new"><Plus className="w-4 h-4 mr-1" /> New Event</Link></Button>
            ) : undefined}
        >
                {loading && <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />}

                {!loading && notOrganizer && (
                    <div className="glass-card rounded-2xl p-8 text-center border border-border/50">
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button asChild variant="outline"><Link to="/events/organizers/apply">Apply to Become an Organizer</Link></Button>
                    </div>
                )}

                {!loading && !notOrganizer && error && (
                    <p className="text-destructive text-center py-10">{error}</p>
                )}

                {!loading && !notOrganizer && !error && events.length === 0 && (
                    <div className="glass-card rounded-2xl p-8 text-center border border-border/50">
                        <p className="text-muted-foreground mb-4">You haven't created any events yet.</p>
                        <Button asChild><Link to="/events/organizer/new"><Plus className="w-4 h-4 mr-1" /> Create Your First Event</Link></Button>
                    </div>
                )}

                {!loading && events.length > 0 && (
                    <>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatTile icon={Rocket} label="Published" value={stats.published} />
                            <StatTile icon={FileEdit} label="Drafts" value={stats.draft} />
                            <StatTile icon={Users} label="Total registrations" value={stats.registrations} />
                            <Link to="/events/organizer/earnings">
                                <StatTile icon={IndianRupee} label="Pending payout" value={formatRupees(pendingPayoutInPaise)} />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {events.map(event => (
                                <div key={event.id} className="rounded-2xl bg-gradient-card border border-border/60 p-5 flex flex-wrap items-center gap-5 justify-between">
                                    <div className="flex items-center gap-4 flex-1 min-w-[220px]">
                                        <div className="w-20 h-14 rounded-lg bg-secondary/40 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            {event.coverImageUrl ? (
                                                <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <Sparkles className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <Badge className={STATUS_COLOR[event.status]}>{event.status}</Badge>
                                                <span className="text-xs text-muted-foreground">{event.category.replace('_', ' ')}</span>
                                            </div>
                                            <h3 className="font-bold">{event.title}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                                <CalendarCheck className="w-3 h-3" />
                                                {new Date(event.startAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                {' · '}<Users className="w-3 h-3" /> {event._count.registrations} registered
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {event.status === 'DRAFT' && (
                                            <>
                                                <Button size="sm" variant="outline" onClick={() => handlePublish(event.id)}>
                                                    <Rocket className="w-3.5 h-3.5 mr-1" /> Publish
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(event.id)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </>
                                        )}
                                        <Button asChild size="sm" variant="outline"><Link to={`/events/organizer/${event.id}/edit`}><Pencil className="w-3.5 h-3.5 mr-1" /> Edit</Link></Button>
                                        <Button asChild size="sm" variant="outline"><Link to={`/events/organizer/${event.id}/registrations`}><Users className="w-3.5 h-3.5 mr-1" /> Registrations</Link></Button>
                                        <Button asChild size="sm" variant="outline"><Link to={`/events/organizer/${event.id}/checkin`}><QrCode className="w-3.5 h-3.5 mr-1" /> Check-in</Link></Button>
                                        <a href={organizerExportUrl(event.id)} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" variant="ghost"><Download className="w-3.5 h-3.5" /></Button>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
        </OrganizerLayout>
    );
}
