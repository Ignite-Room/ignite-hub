import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar, MapPin, Search, Users, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api, EventSummary } from '@/lib/api';
import { useSEO } from '@/hooks/use-seo';

const CATEGORIES = ['HACKATHON', 'WORKSHOP', 'TECH_TALK', 'WEBINAR', 'COMPETITION', 'CULTURAL', 'SPORTS', 'MEETUP', 'OTHER'];
const MODES = ['ONLINE', 'OFFLINE', 'HYBRID'];
const DATE_RANGES = [
    { value: '', label: 'Any time' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
];

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRupees(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function dateRangeToFromTo(range: string): { from?: string; to?: string } {
    const now = new Date();
    if (range === 'upcoming') return { from: now.toISOString() };
    if (range === 'week') {
        const end = new Date(now);
        end.setDate(end.getDate() + 7);
        return { from: now.toISOString(), to: end.toISOString() };
    }
    if (range === 'month') {
        const end = new Date(now);
        end.setMonth(end.getMonth() + 1);
        return { from: now.toISOString(), to: end.toISOString() };
    }
    return {};
}

function PriceBadge({ startingPriceInPaise }: { startingPriceInPaise: number | null }) {
    if (startingPriceInPaise === null) return <span className="text-sm text-muted-foreground">No tickets yet</span>;
    if (startingPriceInPaise === 0) return <span className="text-sm text-emerald-500 font-medium">Free</span>;
    return <span className="text-sm text-muted-foreground">From {formatRupees(startingPriceInPaise)}</span>;
}

function EventCard({ event, past }: { event: EventSummary; past?: boolean }) {
    return (
        <Link
            to={`/events/${event.slug}`}
            className={`group glow-card hover:border-primary/40 transition-all flex flex-col ${past ? 'opacity-70 hover:opacity-100' : ''}`}
        >
            <div className="relative h-40 bg-secondary/40 overflow-hidden">
                {event.coverImageUrl ? (
                    <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/25 to-accent/20 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-primary/50" />
                    </div>
                )}
                <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur-sm px-3 py-1 text-sm font-semibold uppercase tracking-wide text-foreground">
                    {event.category.replace('_', ' ')}
                </span>
                <span className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                </span>
                {past && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-background/90 backdrop-blur-sm px-2.5 py-0.5 text-sm text-muted-foreground">Past</span>
                )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="w-3.5 h-3.5" />{formatDate(event.startAt)}
                    <span className="text-border">&middot;</span>
                    <MapPin className="w-3.5 h-3.5" />{event.venueName || event.venueAddress || event.mode}
                </div>
                <h3 className="font-heading font-semibold text-foreground leading-snug mb-1">{event.title}</h3>
                {event.tagline && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{event.tagline}</p>}
                <div className="mt-auto flex items-center justify-between pt-3">
                    <PriceBadge startingPriceInPaise={event.startingPriceInPaise} />
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />{event.registrationCount}
                    </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-3">
                    {past ? 'View recap' : 'Reserve a spot'} <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
            </div>
        </Link>
    );
}

export default function EventsListPage() {
    useSEO({
        title: 'Events',
        description: 'Discover hackathons, workshops, tech talks, and competitions hosted by Ignite Room and its campus chapters. Find and register for upcoming events.',
        path: '/events',
    });

    const [events, setEvents] = useState<EventSummary[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [q, setQ] = useState('');
    const [category, setCategory] = useState<string>('');
    const [mode, setMode] = useState<string>('');
    const [dateRange, setDateRange] = useState<string>('');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');
        const { from, to } = dateRangeToFromTo(dateRange);
        api.listEvents({ q: q || undefined, category: category || undefined, mode: mode || undefined, from, to, limit: 15 })
            .then(res => { if (!cancelled) { setEvents(res.events); setNextCursor(res.nextCursor); } })
            .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load events'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [q, category, mode, dateRange]);

    const loadMore = async () => {
        if (!nextCursor) return;
        setLoadingMore(true);
        try {
            const { from, to } = dateRangeToFromTo(dateRange);
            const res = await api.listEvents({ q: q || undefined, category: category || undefined, mode: mode || undefined, from, to, cursor: nextCursor, limit: 15 });
            setEvents(prev => [...prev, ...res.events]);
            setNextCursor(res.nextCursor);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load more events');
        } finally {
            setLoadingMore(false);
        }
    };

    const now = Date.now();
    const featured = events.filter(e => e.isFeatured && new Date(e.startAt).getTime() >= now);
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

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search events..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="pl-9 bg-secondary/50 border-border/50"
                        />
                    </div>
                    <Select value={mode || 'all'} onValueChange={(v) => setMode(v === 'all' ? '' : v)}>
                        <SelectTrigger className="sm:w-40 bg-secondary/50 border-border/50"><SelectValue placeholder="Mode" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All modes</SelectItem>
                            {MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={dateRange || 'any'} onValueChange={(v) => setDateRange(v === 'any' ? '' : v)}>
                        <SelectTrigger className="sm:w-40 bg-secondary/50 border-border/50"><SelectValue placeholder="Date" /></SelectTrigger>
                        <SelectContent>
                            {DATE_RANGES.map(r => <SelectItem key={r.value || 'any'} value={r.value || 'any'}>{r.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-wrap gap-2 mb-10">
                    <button
                        onClick={() => setCategory('')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${!category ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border/50 text-muted-foreground hover:text-foreground'}`}
                    >
                        All
                    </button>
                    {CATEGORIES.map(c => (
                        <button
                            key={c}
                            onClick={() => setCategory(c === category ? '' : c)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${category === c ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border/50 text-muted-foreground hover:text-foreground'}`}
                        >
                            {c.replace('_', ' ')}
                        </button>
                    ))}
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
                        {featured.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" /> Featured Events
                                </h2>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {featured.map(event => <EventCard key={event.id} event={event} />)}
                                </div>
                            </section>
                        )}

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

                        {nextCursor && (
                            <div className="text-center">
                                <Button variant="outline" disabled={loadingMore} onClick={loadMore}>
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                </Button>
                            </div>
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
