import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Pencil, QrCode, Download, Rocket, Trash2, CalendarCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OrganizerLayout from '@/components/organizer/OrganizerLayout';
import { organizerFetch, organizerExportUrl, OrganizerEvent } from './organizerApi';

const STATUS_COLOR: Record<string, string> = {
    DRAFT: 'bg-secondary text-muted-foreground',
    PUBLISHED: 'bg-emerald-500/20 text-emerald-400',
    CANCELLED: 'bg-destructive/20 text-destructive',
    COMPLETED: 'bg-blue-500/20 text-blue-400',
};

export default function MyEventsPage() {
    const [events, setEvents] = useState<OrganizerEvent[]>([]);
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
    };

    useEffect(load, []);

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
            title="My Events"
            breadcrumb={['Organizer']}
            actions={!notOrganizer ? (
                <Button asChild size="sm"><Link to="/events/organizer/new"><Plus className="w-4 h-4 mr-1" /> New Event</Link></Button>
            ) : undefined}
        >
            {loading && <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />}

            {!loading && notOrganizer && (
                <div className="glass-card rounded-md p-8 text-center border border-border/50">
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button asChild variant="outline"><Link to="/events/organizers/apply">Apply to Become an Organizer</Link></Button>
                </div>
            )}

            {!loading && !notOrganizer && error && (
                <p className="text-destructive text-center py-10">{error}</p>
            )}

            {!loading && !notOrganizer && !error && events.length === 0 && (
                <div className="glass-card rounded-md p-8 text-center border border-border/50">
                    <p className="text-muted-foreground mb-4">You haven't created any events yet.</p>
                    <Button asChild><Link to="/events/organizer/new"><Plus className="w-4 h-4 mr-1" /> Create Your First Event</Link></Button>
                </div>
            )}

            {!loading && events.length > 0 && (
                <div className="space-y-4">
                    {events.map(event => (
                        <div key={event.id} className="rounded-md bg-gradient-card border border-border/60 p-5 flex flex-wrap items-center gap-5 justify-between">
                            <Link to={`/events/organizer/${event.id}`} className="flex items-center gap-4 flex-1 min-w-[220px]">
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
                            </Link>
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
            )}
        </OrganizerLayout>
    );
}
