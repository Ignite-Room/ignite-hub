import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowLeft, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, EventDetail } from '@/lib/api';

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
    }) + ' IST';
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

    const locationLabel = event.mode === 'ONLINE' ? 'Online' : (event.venueName || event.venueAddress || 'TBA');
    const registrationClosed = event.registrationDeadline ? new Date(event.registrationDeadline) < new Date() : false;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-28 pb-20 px-6 max-w-5xl mx-auto">
                <button onClick={() => navigate('/events')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Events
                </button>

                <div className="h-56 md:h-72 rounded-2xl bg-secondary/40 overflow-hidden mb-8">
                    {event.coverImageUrl ? (
                        <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">No cover image</div>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary">{event.category.replace('_', ' ')}</Badge>
                            <Badge variant="outline">{event.mode}</Badge>
                            {event.isFeatured && <Badge className="bg-primary/20 text-primary border-primary/30">Featured</Badge>}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
                        {event.tagline && <p className="text-lg text-muted-foreground">{event.tagline}</p>}

                        <div className="flex items-center gap-3 pt-2">
                            {event.organizer.logoUrl && (
                                <img src={event.organizer.logoUrl} alt={event.organizer.orgName} className="w-10 h-10 rounded-full object-cover border border-border/50" />
                            )}
                            <div>
                                <p className="text-sm font-medium">{event.organizer.orgName}</p>
                                <p className="text-xs text-muted-foreground">{event.organizer.orgType}</p>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none pt-4 whitespace-pre-wrap text-muted-foreground leading-relaxed">
                            {event.description}
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <div className="sticky top-28 rounded-2xl bg-gradient-card border border-border/60 p-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Starts</p>
                                    <p className="text-sm font-medium">{formatDateTime(event.startAt)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Ends</p>
                                    <p className="text-sm font-medium">{formatDateTime(event.endAt)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Location</p>
                                    <p className="text-sm font-medium">{locationLabel}</p>
                                </div>
                            </div>

                            {event.organizer.website && (
                                <a href={event.organizer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                                    Organizer website <ExternalLink className="w-3 h-3" />
                                </a>
                            )}

                            <div className="pt-2">
                                {registrationClosed ? (
                                    <Button className="w-full" disabled>Registration Closed</Button>
                                ) : (
                                    <Button asChild className="w-full" variant="hero">
                                        <Link to={`/events/${event.slug}/register`}>Register Now</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
