import { Link } from 'react-router-dom';
import { ArrowUpRight, Calendar, MapPin, Users } from 'lucide-react';
import { EventSummary } from '@/lib/api';

export function formatEventDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatRupees(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function PriceBadge({ startingPriceInPaise }: { startingPriceInPaise: number | null }) {
    if (startingPriceInPaise === null) return <span className="text-sm text-muted-foreground">No tickets yet</span>;
    if (startingPriceInPaise === 0) return <span className="text-sm text-emerald-500 font-medium">Free</span>;
    return <span className="text-sm text-muted-foreground">From {formatRupees(startingPriceInPaise)}</span>;
}

export default function EventCard({ event, past }: { event: EventSummary; past?: boolean }) {
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
                    <Calendar className="w-3.5 h-3.5" />{formatEventDate(event.startAt)}
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
