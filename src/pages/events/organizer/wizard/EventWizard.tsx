import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FileText, Image as ImageIcon, Ticket, ListChecks, Layers, Rocket, Eye, Check, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import EventPreviewCard, { EventPreviewData } from '@/components/events/EventPreviewCard';
import { organizerFetch, fetchOrganizerEvent, OrganizerEvent, CustomField } from '../organizerApi';
import WizardStepper, { WizardStep } from './WizardStepper';
import DetailsStep, { DetailsFormData, detailsToPayload } from './DetailsStep';
import CoverImageStep from './CoverImageStep';
import TicketsStep from './TicketsStep';
import QuestionsStep from './QuestionsStep';
import RoundsStep from './RoundsStep';
import ReviewStep from './ReviewStep';

const STEPS: WizardStep[] = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'cover', label: 'Cover Image', icon: ImageIcon },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'questions', label: 'Questions', icon: ListChecks },
    { id: 'rounds', label: 'Rounds', icon: Layers },
    { id: 'review', label: 'Review & Publish', icon: Rocket },
];

/** datetime-local inputs can hold a partially-typed, temporarily-invalid value mid-keystroke. */
function safeIso(value?: string | null): string | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function buildPreviewData(event: OrganizerEvent | null, liveDetails: DetailsFormData | null): EventPreviewData {
    if (liveDetails) {
        return {
            title: liveDetails.title,
            tagline: liveDetails.tagline,
            description: liveDetails.description,
            category: liveDetails.category,
            mode: liveDetails.mode,
            venueName: liveDetails.venueName,
            venueAddress: liveDetails.venueAddress,
            coverImageUrl: event?.coverImageUrl || null,
            startAt: safeIso(liveDetails.startAt),
            endAt: safeIso(liveDetails.endAt),
            isFeatured: event?.isFeatured,
        };
    }
    if (event) {
        return {
            title: event.title, tagline: event.tagline, description: event.description,
            category: event.category, mode: event.mode, venueName: event.venueName, venueAddress: event.venueAddress,
            coverImageUrl: event.coverImageUrl, startAt: event.startAt, endAt: event.endAt, isFeatured: event.isFeatured,
        };
    }
    return { title: '', description: '', category: '', mode: '' };
}

export default function EventWizard() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<OrganizerEvent | null>(null);
    const [loading, setLoading] = useState(!!id);
    const [loadError, setLoadError] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [creating, setCreating] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [publishError, setPublishError] = useState('');
    const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
    const [liveDetails, setLiveDetails] = useState<DetailsFormData | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetchOrganizerEvent(id)
            .then(setEvent)
            .catch(e => setLoadError(e instanceof Error ? e.message : 'Failed to load event'))
            .finally(() => setLoading(false));
    }, [id]);

    const refreshEvent = useCallback(() => {
        if (!event?.id) return;
        fetchOrganizerEvent(event.id).then(setEvent).catch(() => {});
    }, [event?.id]);

    const handleCreate = async (payload: ReturnType<typeof detailsToPayload>) => {
        setCreating(true);
        try {
            const created = await organizerFetch<OrganizerEvent>('/', { method: 'POST', body: JSON.stringify(payload) });
            setEvent(created);
            navigate(`/events/organizer/${created.id}/edit`, { replace: true });
            setCurrentStep(1);
        } finally {
            setCreating(false);
        }
    };

    const handleAutosave = async (payload: ReturnType<typeof detailsToPayload>) => {
        if (!event) return;
        setSaveState('saving');
        try {
            await organizerFetch(`/${event.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
            setEvent(prev => prev ? { ...prev, ...payload } as OrganizerEvent : prev);
            setSaveState('saved');
        } catch {
            setSaveState('error');
        }
    };

    const handleCustomFieldsAutosave = async (fields: CustomField[]) => {
        if (!event) return;
        setSaveState('saving');
        try {
            await organizerFetch(`/${event.id}`, { method: 'PATCH', body: JSON.stringify({ customFields: fields }) });
            setEvent(prev => prev ? { ...prev, customFields: fields } : prev);
            setSaveState('saved');
        } catch {
            setSaveState('error');
        }
    };

    const handlePublish = async () => {
        if (!event) return;
        setPublishing(true);
        setPublishError('');
        try {
            await organizerFetch(`/${event.id}/publish`, { method: 'POST' });
            refreshEvent();
        } catch (e) {
            setPublishError(e instanceof Error ? e.message : 'Failed to publish');
        } finally {
            setPublishing(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
    }

    if (loadError) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-32 pb-20 px-6 max-w-2xl mx-auto text-center">
                    <p className="text-destructive mb-4">{loadError}</p>
                    <Button asChild variant="outline"><Link to="/events/organizer">Back to My Events</Link></Button>
                </main>
                <Footer />
            </div>
        );
    }

    const previewData = buildPreviewData(event, liveDetails);
    const unlocked = !!event;

    const renderStep = () => {
        switch (STEPS[currentStep].id) {
            case 'details':
                return (
                    <DetailsStep
                        event={event}
                        onCreate={handleCreate}
                        onAutosave={handleAutosave}
                        onLiveChange={setLiveDetails}
                        onContinue={() => setCurrentStep(1)}
                        saving={creating}
                    />
                );
            case 'cover':
                return event ? (
                    <CoverImageStep eventId={event.id} coverImageUrl={event.coverImageUrl} onChange={(url) => setEvent(prev => prev ? { ...prev, coverImageUrl: url } : prev)} />
                ) : null;
            case 'tickets':
                return event ? <TicketsStep eventId={event.id} ticketTypes={event.ticketTypes} onChange={refreshEvent} /> : null;
            case 'questions':
                return <QuestionsStep customFields={event?.customFields || []} onAutosave={handleCustomFieldsAutosave} />;
            case 'rounds':
                return event ? <RoundsStep eventId={event.id} rounds={event.rounds} onChange={refreshEvent} /> : null;
            case 'review':
                return event ? <ReviewStep event={event} onPublish={handlePublish} publishing={publishing} publishError={publishError} /> : null;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-28 pb-20 px-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold">{event ? event.title || 'Untitled event' : 'Create Event'}</h1>
                            {event && <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}>{event.status}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            {saveState === 'saving' && <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>}
                            {saveState === 'saved' && <><Check className="w-3 h-3 text-emerald-400" /> All changes saved</>}
                            {saveState === 'error' && <span className="text-destructive">Couldn't save. Check your connection.</span>}
                            {saveState === 'idle' && !event && 'Fill in the essentials to create your draft.'}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="lg:hidden gap-1.5" onClick={() => setMobilePreviewOpen(true)}>
                        <Eye className="w-3.5 h-3.5" /> Preview
                    </Button>
                </div>

                <div className="grid lg:grid-cols-[220px_1fr_1fr] gap-6 items-start">
                    <div className="lg:sticky lg:top-28">
                        <WizardStepper steps={STEPS} currentIndex={currentStep} unlocked={unlocked} onSelect={setCurrentStep} />
                    </div>

                    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border/50 lg:col-span-1">
                        {renderStep()}
                    </div>

                    <div className="hidden lg:block sticky top-28">
                        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Live preview</p>
                        <div className="rounded-2xl border border-border/50 p-6 bg-background/40 max-h-[calc(100vh-9rem)] overflow-y-auto">
                            <EventPreviewCard event={previewData} variant="live" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link to="/events/organizer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back to My Events</Link>
                </div>
            </main>
            <Footer />

            <Sheet open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
                <SheetContent side="bottom" className="h-[88vh] overflow-y-auto">
                    <SheetHeader className="mb-4">
                        <SheetTitle>Live preview</SheetTitle>
                    </SheetHeader>
                    <EventPreviewCard event={previewData} variant="live" />
                </SheetContent>
            </Sheet>
        </div>
    );
}
