import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Clock, MapPin, ExternalLink, Copy, Twitter, Linkedin, Trophy, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { api, EventDetail } from '@/lib/api';
import { formatEventDateTime } from '@/components/events/EventPreviewCard';
import { useSEO, useStructuredData } from '@/hooks/use-seo';
import SectionEyebrow from '@/components/design-system/SectionEyebrow';

type RegoStatus = 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'SOLD_OUT';

const STATUS_META: Record<RegoStatus, { label: string; className: string }> = {
    OPEN: { label: 'Registration Open', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30' },
    CLOSING_SOON: { label: 'Closing Soon', className: 'bg-amber-500/20 text-amber-400 border-amber-400/30' },
    CLOSED: { label: 'Registration Closed', className: 'bg-secondary text-muted-foreground' },
    SOLD_OUT: { label: 'Sold Out', className: 'bg-destructive/20 text-destructive border-destructive/30' },
};

function computeStatus(event: EventDetail): RegoStatus {
    const deadlinePassed = event.registrationDeadline ? new Date(event.registrationDeadline) < new Date() : false;
    if (deadlinePassed) return 'CLOSED';
    const hasActiveTickets = event.ticketTypes.length > 0;
    const soldOut = hasActiveTickets && event.ticketTypes.every(t => t.available !== null && t.available <= 0);
    if (soldOut) return 'SOLD_OUT';
    if (event.registrationDeadline) {
        const hoursLeft = (new Date(event.registrationDeadline).getTime() - Date.now()) / (1000 * 60 * 60);
        if (hoursLeft <= 48) return 'CLOSING_SOON';
    }
    return 'OPEN';
}

function formatRupees(paise: number): string {
    return paise === 0 ? 'Free' : `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function formatDuration(startIso: string, endIso: string): string {
    const hours = (new Date(endIso).getTime() - new Date(startIso).getTime()) / 36e5;
    if (hours <= 0) return '—';
    if (hours < 24) {
        const rounded = Math.round(hours);
        return `${rounded} hour${rounded === 1 ? '' : 's'}`;
    }
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? '' : 's'}`;
}

function MetaRow({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}

export default function EventDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        api.getEvent(slug)
            .then(setEvent)
            .catch(e => setError(e instanceof Error ? e.message : 'Event not found'))
            .finally(() => setLoading(false));
    }, [slug]);

    useSEO({
        title: event ? event.title : 'Event',
        description: event ? (event.tagline || event.description.slice(0, 160)) : 'Browse hackathons, workshops, and meetups on Ignite Room.',
        path: slug ? `/events/${slug}` : undefined,
    });

    useStructuredData(event ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        description: event.tagline || event.description,
        startDate: event.startAt,
        endDate: event.endAt,
        eventAttendanceMode: event.mode === 'ONLINE'
            ? 'https://schema.org/OnlineEventAttendanceMode'
            : 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: event.mode === 'ONLINE'
            ? { '@type': 'VirtualLocation', url: `https://www.igniteroom.in/events/${event.slug}` }
            : { '@type': 'Place', name: event.venueName || 'Venue to be announced', address: event.venueAddress || undefined },
        image: event.coverImageUrl || undefined,
        organizer: { '@type': 'Organization', name: event.organizer.orgName },
        url: `https://www.igniteroom.in/events/${event.slug}`,
    } : null);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-40 pb-20 px-6 max-w-3xl mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-3">Event not found</h1>
                    <p className="text-muted-foreground mb-6">{error || 'This event does not exist or is no longer published.'}</p>
                    <Button asChild variant="outline"><Link to="/events">Back to Events</Link></Button>
                </main>
                <Footer />
            </div>
        );
    }

    const status = computeStatus(event);
    const registrationClosed = status === 'CLOSED' || status === 'SOLD_OUT';
    const startingPrice = event.ticketTypes.length > 0 ? Math.min(...event.ticketTypes.map(t => t.priceInPaise)) : null;
    const locationLabel = event.mode === 'ONLINE' ? 'Online' : (event.venueName || event.venueAddress || 'Location to be announced');
    const shareUrl = `https://igniteroom.in/events/${event.slug}`;

    const totalSold = event.ticketTypes.reduce((sum, t) => sum + t.quantitySold, 0);
    const spotsLeft = event.capacity !== null ? Math.max(event.capacity - totalSold, 0) : null;
    const percentFull = event.capacity ? Math.min(100, Math.round((totalSold / event.capacity) * 100)) : null;

    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied');
    };

    const CTA = (
        <div className="pt-1">
            {registrationClosed ? (
                <Button className="w-full rounded-full" disabled>{STATUS_META[status].label}</Button>
            ) : (
                <Button asChild className="w-full rounded-full" variant="hero">
                    <Link to={`/events/${event.slug}/register`}>Reserve my spot</Link>
                </Button>
            )}
            {!registrationClosed && startingPrice === 0 && (
                <p className="text-xs text-muted-foreground text-center mt-3">Free &middot; No payment required &middot; Confirmed instantly</p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-24 md:pb-0">
            <Navbar />

            <div className="relative h-64 md:h-[420px] w-full bg-secondary/40 overflow-hidden mt-16">
                {event.coverImageUrl ? (
                    <>
                        <div className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-40" style={{ backgroundImage: `url(${event.coverImageUrl})` }} aria-hidden="true" />
                        <img src={event.coverImageUrl} alt={event.title} className="relative w-full h-full object-contain" />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No cover image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>

            <main className="px-6 max-w-6xl mx-auto -mt-6 relative">
                <button onClick={() => navigate('/events')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Events
                </button>

                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-10">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap mb-4">
                                <Badge variant="secondary">{event.category.replace('_', ' ')}</Badge>
                                <Badge variant="outline">{event.mode}</Badge>
                                {event.isFeatured && <Badge className="bg-primary/20 text-primary border-primary/30">Featured</Badge>}
                                <Badge className={STATUS_META[status].className}>{STATUS_META[status].label}</Badge>
                            </div>
                            <h1 className="font-heading text-3xl md:text-5xl font-bold leading-tight">{event.title}</h1>
                            {event.tagline && <p className="text-lg text-muted-foreground mt-3">{event.tagline}</p>}
                        </div>

                        <div className="flex flex-wrap gap-x-10 gap-y-4 border-y border-border/60 py-5">
                            <MetaRow icon={Calendar} label="Starts" value={formatEventDateTime(event.startAt)} />
                            <MetaRow icon={Clock} label="Duration" value={formatDuration(event.startAt, event.endAt)} />
                            <MetaRow icon={MapPin} label="Location" value={locationLabel} />
                        </div>

                        <div>
                            <SectionEyebrow label="About the event" className="mb-4" />
                            <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
                                <ReactMarkdown>{event.description || 'No description provided.'}</ReactMarkdown>
                            </div>
                        </div>

                        {event.rounds && event.rounds.length > 0 && (
                            <div>
                                <SectionEyebrow label="Timeline" className="mb-4" />
                                <div className="space-y-4">
                                    {event.rounds.map((round, i) => (
                                        <div key={round.id} className="flex gap-4">
                                            <div className="flex flex-col items-center flex-shrink-0">
                                                <div className="w-3 h-3 rounded-full bg-primary" />
                                                {i < event.rounds!.length - 1 && <div className="w-px flex-1 bg-border/60 mt-1" />}
                                            </div>
                                            <div className="pb-6">
                                                <p className="font-medium text-sm">{round.name}</p>
                                                {round.submissionDeadline && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">{formatEventDateTime(round.submissionDeadline)}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {event.prizes && event.prizes.length > 0 && (
                            <div>
                                <SectionEyebrow label="Prizes" className="mb-4" />
                                <div className="info-section grid grid-cols-1 sm:grid-cols-2">
                                    {event.prizes.map((prize, i) => (
                                        <div key={i} className={`info-block p-5 flex items-start gap-3 ${i > 0 ? 'border-t sm:border-t-0' : ''} ${i % 2 === 1 ? 'sm:border-l' : ''} ${i >= 2 ? 'sm:border-t' : 'sm:border-t-0'} border-border/60`}>
                                            <Trophy className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-sm">{prize.position}</p>
                                                <p className="text-sm text-foreground">{prize.reward}</p>
                                                {prize.description && <p className="text-xs text-muted-foreground mt-1">{prize.description}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {event.faqs && event.faqs.length > 0 && (
                            <div>
                                <SectionEyebrow label="FAQs" className="mb-4" />
                                <Accordion type="single" collapsible>
                                    {event.faqs.map((faq, i) => (
                                        <AccordionItem key={i} value={String(i)}>
                                            <AccordionTrigger className="text-sm text-left">{faq.question}</AccordionTrigger>
                                            <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        )}

                        <div>
                            <SectionEyebrow label="Hosted by" className="mb-4" />
                            <div className="info-section p-5 flex items-center gap-4">
                                {event.organizer.logoUrl ? (
                                    <img src={event.organizer.logoUrl} alt={event.organizer.orgName} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-secondary flex-shrink-0" />
                                )}
                                <div className="min-w-0">
                                    <p className="font-medium">{event.organizer.orgName}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{event.organizer.orgType.toLowerCase().replace('_', ' ')}</p>
                                    {event.organizer.website && (
                                        <a href={event.organizer.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1">
                                            Visit website <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-28 space-y-5">
                            <div className="info-section p-6 space-y-5">
                                {spotsLeft !== null && percentFull !== null && (
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="font-medium inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary" /> {spotsLeft} spots left</span>
                                            <span className="text-muted-foreground">{percentFull}% full</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                                            <div className="h-full bg-primary rounded-full" style={{ width: `${percentFull}%` }} />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <MetaRow icon={Calendar} label="Starts" value={formatEventDateTime(event.startAt)} />
                                    <MetaRow icon={Clock} label="Ends" value={formatEventDateTime(event.endAt)} />
                                    <MetaRow icon={MapPin} label="Location" value={locationLabel} />
                                </div>

                                {startingPrice !== null && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Starting at</p>
                                        <p className="text-lg font-bold">{formatRupees(startingPrice)}</p>
                                    </div>
                                )}

                                {CTA}
                            </div>

                            <div className="info-section p-5">
                                <p className="font-body text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">Share this event</p>
                                <div className="flex items-center gap-4">
                                    <button onClick={copyLink} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                        <Copy className="w-3.5 h-3.5" /> Copy Link
                                    </button>
                                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                        <Twitter className="w-3.5 h-3.5" /> Share
                                    </a>
                                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                        <Linkedin className="w-3.5 h-3.5" /> Share
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-xl border-t border-border/50 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        {startingPrice !== null && <p className="text-sm font-bold">{formatRupees(startingPrice)}</p>}
                        <p className="text-xs text-muted-foreground truncate">{STATUS_META[status].label}</p>
                    </div>
                    <div className="w-40">
                        {registrationClosed ? (
                            <Button className="w-full rounded-full" disabled>{STATUS_META[status].label}</Button>
                        ) : (
                            <Button asChild className="w-full rounded-full" variant="hero">
                                <Link to={`/events/${event.slug}/register`}>Reserve spot</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="hidden lg:block">
                <Footer />
            </div>
        </div>
    );
}
