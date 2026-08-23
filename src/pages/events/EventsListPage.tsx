import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api, EventSummary } from '@/lib/api';
import { useSEO } from '@/hooks/use-seo';
import EventCard from '@/components/EventCard';

const CATEGORIES = ['HACKATHON', 'WORKSHOP', 'TECH_TALK', 'WEBINAR', 'COMPETITION', 'CULTURAL', 'SPORTS', 'MEETUP', 'OTHER'];
const MODES = ['ONLINE', 'OFFLINE', 'HYBRID'];
const DATE_RANGES = [
    { value: '', label: 'Any time' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
];

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
