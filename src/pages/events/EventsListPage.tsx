import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api, EventSummary } from '@/lib/api';

const CATEGORIES = ['HACKATHON', 'WORKSHOP', 'TECH_TALK', 'WEBINAR', 'COMPETITION', 'CULTURAL', 'SPORTS', 'MEETUP', 'OTHER'];
const MODES = ['ONLINE', 'OFFLINE', 'HYBRID'];

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function EventCard({ event, past }: { event: EventSummary; past?: boolean }) {
    return (
        <Link
            to={`/events/${event.slug}`}
            className={`group relative rounded-2xl bg-gradient-card border border-border/60 overflow-hidden hover:border-primary/40 transition-all flex flex-col ${past ? 'opacity-70 hover:opacity-100' : ''}`}
        >
            <div className="h-36 bg-secondary/40 overflow-hidden">
                {event.coverImageUrl ? (
                    <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No cover image</div>
                )}
            </div>
            <div className="p-5 space-y-3 flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{event.category.replace('_', ' ')}</Badge>
                    <Badge variant="outline" className="text-xs">{event.mode}</Badge>
                    {past && <Badge variant="outline" className="text-xs">Past</Badge>}
                </div>
                <h3 className="text-lg font-bold group-hover:text-gradient transition-all line-clamp-2">{event.title}</h3>
                {event.tagline && <p className="text-sm text-muted-foreground line-clamp-2">{event.tagline}</p>}
                <div className="mt-auto space-y-1.5 pt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(event.startAt)}</div>
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{event.venueName || event.venueAddress || event.mode}</div>
                </div>
                <p className="text-xs text-muted-foreground pt-1">By {event.organizer.orgName}</p>
            </div>
        </Link>
    );
}

export default function EventsListPage() {
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [q, setQ] = useState('');
    const [category, setCategory] = useState<string>('');
    const [mode, setMode] = useState<string>('');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');
        api.listEvents({ q: q || undefined, category: category || undefined, mode: mode || undefined, limit: 50 })
            .then(res => { if (!cancelled) setEvents(res.events); })
            .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load events'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [q, category, mode]);

    const now = Date.now();
    const upcoming = events
        .filter(e => new Date(e.startAt).getTime() >= now)
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    const past = events
        .filter(e => new Date(e.startAt).getTime() < now)
        .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="mb-10">
                    <span className="text-primary font-medium text-sm uppercase tracking-wider block mb-3">Events</span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover what's happening</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Hackathons, workshops, and meetups from Ignite Room and our partner communities.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search events..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="pl-9 bg-secondary/50 border-border/50"
                        />
                    </div>
                    <Select value={category || 'all'} onValueChange={(v) => setCategory(v === 'all' ? '' : v)}>
                        <SelectTrigger className="sm:w-48 bg-secondary/50 border-border/50"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={mode || 'all'} onValueChange={(v) => setMode(v === 'all' ? '' : v)}>
                        <SelectTrigger className="sm:w-40 bg-secondary/50 border-border/50"><SelectValue placeholder="Mode" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All modes</SelectItem>
                            {MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {loading && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 rounded-2xl bg-secondary/30 animate-pulse" />
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <p className="text-destructive text-center py-20">{error}</p>
                )}

                {!loading && !error && events.length === 0 && (
                    <p className="text-muted-foreground text-center py-20">No events found. Check back soon.</p>
                )}

                {!loading && !error && events.length > 0 && (
                    <div className="space-y-14">
                        {upcoming.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold mb-5">Upcoming Events</h2>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {upcoming.map(event => <EventCard key={event.id} event={event} />)}
                                </div>
                            </section>
                        )}

                        {past.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold mb-5">Past Events</h2>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {past.map(event => <EventCard key={event.id} event={event} past />)}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                <div className="mt-16 text-center">
                    <p className="text-muted-foreground mb-3">Want to host your own event on Ignite Room?</p>
                    <Button asChild variant="outline">
                        <Link to="/events/organizers/apply">Apply to Become an Organizer</Link>
                    </Button>
                </div>
            </main>
            <Footer />
        </div>
    );
}
