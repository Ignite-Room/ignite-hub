import { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/EventCard';
import { api, EventSummary } from '@/lib/api';
import { useSEO } from '@/hooks/use-seo';
import SectionEyebrow from '@/components/design-system/SectionEyebrow';
import RevealOnScroll from '@/components/design-system/RevealOnScroll';
import sparkle from '@/assets/figma/sparkle.png';
import { cityIcons } from '@/lib/city-icons';

const CHAPTERS: Record<string, { name: string; blurb: string }> = {
    delhi: { name: 'Delhi', blurb: 'Home to our national Grand Finale, the beating heart of the Ignite Room hackathon circuit.' },
    chandigarh: { name: 'Chandigarh', blurb: 'A HackArena 2.0 zonal round city, bringing builders from across Punjab and Haryana together.' },
    mumbai: { name: 'Mumbai', blurb: 'Where fintech meets hustle, one of our most active offline hackathon chapters.' },
    hyderabad: { name: 'Hyderabad', blurb: 'A growing hub for AI and product builders in the south.' },
    bangalore: { name: 'Bangalore', blurb: "India's startup capital, and one of our earliest and largest chapters." },
    kolkata: { name: 'Kolkata', blurb: 'Bringing the Ignite Room community to the east, one build session at a time.' },
};

export default function ChapterDetailPage() {
    const { city } = useParams<{ city: string }>();
    const key = (city || '').toLowerCase();
    const chapter = CHAPTERS[key];

    const [events, setEvents] = useState<EventSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useSEO({
        title: chapter ? `${chapter.name} Chapter` : 'Chapter',
        description: chapter ? `Ignite Room's ${chapter.name} chapter: events, hackathons, and the local builder community.` : undefined,
        path: `/chapters/${key}`,
    });

    useEffect(() => {
        if (!chapter) return;
        let cancelled = false;
        setLoading(true);
        api.listEvents({ q: chapter.name, limit: 20 })
            .then((res) => { if (!cancelled) setEvents(res.events); })
            .catch(() => { if (!cancelled) setEvents([]); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [chapter]);

    if (!chapter) return <Navigate to="/" replace />;

    const now = Date.now();
    const upcoming = events.filter(e => new Date(e.startAt).getTime() >= now);
    const past = events.filter(e => new Date(e.startAt).getTime() < now);

    return (
        <div className="relative min-h-screen bg-background overflow-x-hidden">
            <Navbar />

            <main className="relative z-10">
                {/* Hero */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="section-padding pb-14 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
                    <img
                        src={cityIcons[key]}
                        alt=""
                        aria-hidden="true"
                        className="hidden md:block absolute -bottom-8 -right-8 w-72 lg:w-96 opacity-[0.07] dark:opacity-[0.1] dark:invert pointer-events-none select-none"
                    />
                    <div className="max-w-4xl mx-auto relative z-10">
                        <Link to="/#chapters" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8">
                            <ArrowLeft className="w-4 h-4" /> All chapters
                        </Link>

                        <SectionEyebrow label="Chapter" />
                        <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 leading-[1.05]">
                            {chapter.name}
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                            {chapter.blurb}
                        </p>

                        <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-border/40">
                            <div>
                                <div className="text-3xl font-heading font-bold text-foreground">{loading ? '-' : events.length}</div>
                                <div className="text-sm text-muted-foreground mt-1 uppercase tracking-wider">Events hosted</div>
                            </div>
                            <div>
                                <div className="text-3xl font-heading font-bold text-foreground">{loading ? '-' : upcoming.length}</div>
                                <div className="text-sm text-muted-foreground mt-1 uppercase tracking-wider">Coming up</div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Events */}
                <section className="section-padding pt-0">
                    <div className="max-w-6xl mx-auto">
                        {upcoming.length > 0 && (
                            <RevealOnScroll className="mb-16">
                                <div className="flex items-center gap-2 mb-8">
                                    <CalendarDays className="w-5 h-5 text-primary" />
                                    <h2 className="font-heading text-2xl font-bold">Upcoming in {chapter.name}</h2>
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {upcoming.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </RevealOnScroll>
                        )}

                        {past.length > 0 && (
                            <RevealOnScroll delay={0.1}>
                                <div className="flex items-center gap-2 mb-8">
                                    <MapPin className="w-5 h-5 text-muted-foreground" />
                                    <h2 className="font-heading text-2xl font-bold">Past events</h2>
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {past.map((event) => (
                                        <EventCard key={event.id} event={event} past />
                                    ))}
                                </div>
                            </RevealOnScroll>
                        )}

                        {!loading && events.length === 0 && (
                            <div className="info-section w-screen relative left-1/2 -translate-x-1/2">
                                <RevealOnScroll className="max-w-xl mx-auto px-6 py-16 text-center">
                                    <img src={sparkle} alt="" aria-hidden="true" className="w-8 h-8 mx-auto mb-4" />
                                    <h2 className="font-heading text-xl font-bold mb-2">The {chapter.name} chapter is just getting started</h2>
                                    <p className="text-muted-foreground mb-6">
                                        No events have been announced here yet. Check back soon, or bring one to your campus yourself.
                                    </p>
                                    <Link to="/ambassador/apply">
                                        <Button className="rounded-full gap-2">
                                            Become a Campus Ambassador <ArrowUpRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </RevealOnScroll>
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA */}
                <section className="section-padding pt-0">
                    <div className="info-section w-screen relative left-1/2 -translate-x-1/2">
                        <RevealOnScroll className="max-w-3xl mx-auto px-6 py-16 md:py-20 text-center">
                            <h2 className="font-heading text-3xl font-bold mb-3">Want more Ignite Room in {chapter.name}?</h2>
                            <p className="text-muted-foreground mb-8">
                                Lead the next hackathon, workshop, or meetup on your campus as a Campus Ambassador.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link to="/ambassador/apply">
                                    <Button size="lg" className="rounded-full gap-2 px-8">
                                        Become an Ambassador <ArrowUpRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <Link to="/events">
                                    <Button size="lg" variant="outline" className="rounded-full px-8">
                                        Browse all events
                                    </Button>
                                </Link>
                            </div>
                        </RevealOnScroll>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
