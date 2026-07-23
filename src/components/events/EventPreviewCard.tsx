import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function formatEventDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
    }) + ' IST';
}

export interface EventPreviewOrganizer {
    orgName: string;
    logoUrl?: string | null;
    orgType?: string;
    website?: string | null;
}

export interface EventPreviewData {
    title: string;
    tagline?: string | null;
    description: string;
    category: string;
    mode: string;
    venueName?: string | null;
    venueAddress?: string | null;
    coverImageUrl?: string | null;
    startAt?: string | null;
    endAt?: string | null;
    isFeatured?: boolean;
    organizer?: EventPreviewOrganizer | null;
}

interface EventPreviewCardProps {
    event: EventPreviewData;
    /** 'live' renders inside the organizer wizard — no working registration link. 'public' is the real attendee-facing page. */
    variant: 'live' | 'public';
    registerHref?: string;
    registrationClosed?: boolean;
}

/**
 * Single source of truth for how an event is rendered — used by the real public
 * event page and the organizer wizard's live preview, so the two never drift apart.
 */
export default function EventPreviewCard({ event, variant, registerHref, registrationClosed }: EventPreviewCardProps) {
    const locationLabel = event.mode === 'ONLINE'
        ? 'Online'
        : (event.venueName || event.venueAddress || 'Location to be announced');
    const live = variant === 'live';

    return (
        <div>
            <div className={`relative ${live ? 'h-36' : 'h-56 md:h-72'} rounded-2xl bg-secondary/40 overflow-hidden mb-6`}>
                {event.coverImageUrl ? (
                    <>
                        <div
                            className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-50"
                            style={{ backgroundImage: `url(${event.coverImageUrl})` }}
                            aria-hidden="true"
                        />
                        <img src={event.coverImageUrl} alt={event.title || 'Event cover'} className="relative w-full h-full object-contain" />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm text-center px-4">
                        No cover image yet
                    </div>
                )}
            </div>

            <div className={live ? 'space-y-6' : 'grid md:grid-cols-3 gap-10'}>
                <div className={live ? 'space-y-4' : 'md:col-span-2 space-y-6'}>
                    <div className="flex items-center gap-2 flex-wrap">
                        {event.category && <Badge variant="secondary">{event.category.replace('_', ' ')}</Badge>}
                        {event.mode && <Badge variant="outline">{event.mode}</Badge>}
                        {event.isFeatured && <Badge className="bg-primary/20 text-primary border-primary/30">Featured</Badge>}
                    </div>
                    <h1 className={live ? 'text-xl font-bold break-words' : 'text-3xl md:text-4xl font-bold'}>
                        {event.title || <span className="text-muted-foreground">Untitled event</span>}
                    </h1>
                    {event.tagline && <p className={live ? 'text-sm text-muted-foreground' : 'text-lg text-muted-foreground'}>{event.tagline}</p>}

                    {event.organizer && (
                        <div className="flex items-center gap-3 pt-2">
                            {event.organizer.logoUrl && (
                                <img src={event.organizer.logoUrl} alt={event.organizer.orgName} className="w-10 h-10 rounded-full object-cover border border-border/50" />
                            )}
                            <div>
                                <p className="text-sm font-medium">{event.organizer.orgName}</p>
                                {event.organizer.orgType && <p className="text-xs text-muted-foreground">{event.organizer.orgType}</p>}
                            </div>
                        </div>
                    )}

                    <div className={`prose prose-invert max-w-none whitespace-pre-wrap text-muted-foreground leading-relaxed ${live ? 'text-sm' : 'pt-4'}`}>
                        {event.description || <span className="italic">Add a description to see it here.</span>}
                    </div>
                </div>

                <div className={live ? '' : 'md:col-span-1'}>
                    <div className={`rounded-2xl bg-gradient-card border border-border/60 p-6 space-y-4 ${live ? '' : 'sticky top-28'}`}>
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">Starts</p>
                                <p className="text-sm font-medium">{event.startAt ? formatEventDateTime(event.startAt) : 'Not set'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">Ends</p>
                                <p className="text-sm font-medium">{event.endAt ? formatEventDateTime(event.endAt) : 'Not set'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">Location</p>
                                <p className="text-sm font-medium">{locationLabel}</p>
                            </div>
                        </div>

                        {event.organizer?.website && (
                            <a href={event.organizer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                                Organizer website <ExternalLink className="w-3 h-3" />
                            </a>
                        )}

                        <div className="pt-2">
                            {variant === 'live' ? (
                                <Button className="w-full" disabled>Preview only</Button>
                            ) : registrationClosed ? (
                                <Button className="w-full" disabled>Registration Closed</Button>
                            ) : (
                                <Button asChild className="w-full" variant="hero">
                                    <Link to={registerHref || '#'}>Register Now</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
