import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, ExternalLink, Rocket, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrganizerEvent } from '../organizerApi';

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://igniteroom.in';

function ChecklistRow({ ok, label, warn }: { ok: boolean; label: string; warn?: boolean }) {
    return (
        <div className="flex items-center gap-2.5 text-sm">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                ok ? 'bg-emerald-500/20 text-emerald-400' : warn ? 'bg-amber-500/20 text-orange-400' : 'bg-secondary text-muted-foreground'
            }`}>
                {ok ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            </span>
            <span className={ok ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
        </div>
    );
}

export default function ReviewStep({ event, onPublish, publishing, publishError }: {
    event: OrganizerEvent;
    onPublish: () => Promise<void>;
    publishing: boolean;
    publishError: string;
}) {
    const [copied, setCopied] = useState(false);
    const publicUrl = `${SITE_URL}/events/${event.slug}`;
    const hasTicketType = event.ticketTypes.length > 0;
    const hasCover = !!event.coverImageUrl;

    const copyLink = async () => {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (event.status === 'PUBLISHED') {
        return (
            <div className="space-y-5">
                <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-sm font-semibold text-emerald-400 mb-1">This event is live</p>
                    <p className="text-xs text-muted-foreground">Anyone with the link can view it and register.</p>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Public link</p>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border/40">
                        <span className="text-sm flex-1 truncate">{publicUrl}</span>
                        <button onClick={copyLink} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <Button asChild variant="outline" className="gap-1.5">
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                        View public page <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-sm font-semibold mb-1">Ready to publish</h3>
                <p className="text-xs text-muted-foreground">Once published, your event is visible on the public events page and open for registration.</p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/20 border border-border/40 space-y-2.5">
                <ChecklistRow ok label="Title, description, and schedule set" />
                <ChecklistRow ok={hasTicketType} label={hasTicketType ? 'At least one ticket type added' : 'Add at least one ticket type to publish'} />
                <ChecklistRow ok={hasCover} warn={!hasCover} label={hasCover ? 'Cover image added' : 'No cover image yet (recommended, not required)'} />
            </div>

            {publishError && (
                <p className="text-xs text-destructive flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {publishError}</p>
            )}

            <div className="flex items-center gap-3">
                <Button onClick={onPublish} disabled={!hasTicketType || publishing} className="gap-1.5">
                    <Rocket className="w-4 h-4" /> {publishing ? 'Publishing...' : 'Publish Event'}
                </Button>
                <Button asChild variant="ghost" size="sm">
                    <Link to={`/events/${event.slug}`} target="_blank">Preview as attendee</Link>
                </Button>
            </div>
        </div>
    );
}
