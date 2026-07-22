import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrganizerEvent } from '../organizerApi';

export const CATEGORIES = ['HACKATHON', 'WORKSHOP', 'TECH_TALK', 'WEBINAR', 'COMPETITION', 'CULTURAL', 'SPORTS', 'MEETUP', 'OTHER'];
export const MODES = ['ONLINE', 'OFFLINE', 'HYBRID'];

export const detailsSchema = z.object({
    title: z.string().min(3, 'Title is required'),
    tagline: z.string().optional(),
    description: z.string().min(10, 'Description should be at least 10 characters'),
    category: z.string().min(1, 'Select a category'),
    mode: z.string().min(1, 'Select a mode'),
    venueName: z.string().optional(),
    venueAddress: z.string().optional(),
    onlineUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
    startAt: z.string().min(1, 'Start date is required'),
    endAt: z.string().min(1, 'End date is required'),
    registrationDeadline: z.string().optional(),
    capacity: z.string().optional(),
}).superRefine((data, ctx) => {
    if ((data.mode === 'OFFLINE' || data.mode === 'HYBRID') && !data.venueName?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['venueName'], message: 'Required for in-person events' });
    }
    if ((data.mode === 'ONLINE' || data.mode === 'HYBRID') && !data.onlineUrl?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['onlineUrl'], message: 'Required for online events' });
    }
    if (data.startAt && data.endAt && new Date(data.endAt) < new Date(data.startAt)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endAt'], message: 'End must be after start' });
    }
});

export type DetailsFormData = z.infer<typeof detailsSchema>;

export function toLocalInput(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function detailsToPayload(data: DetailsFormData) {
    return {
        title: data.title,
        tagline: data.tagline || undefined,
        description: data.description,
        category: data.category,
        mode: data.mode,
        venueName: data.venueName || undefined,
        venueAddress: data.venueAddress || undefined,
        onlineUrl: data.onlineUrl || undefined,
        startAt: new Date(data.startAt).toISOString(),
        endAt: new Date(data.endAt).toISOString(),
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline).toISOString() : undefined,
        capacity: data.capacity ? parseInt(data.capacity, 10) : undefined,
    };
}

function eventToDefaults(event: OrganizerEvent | null): DetailsFormData {
    if (!event) {
        return { title: '', tagline: '', description: '', category: '', mode: '', venueName: '', venueAddress: '', onlineUrl: '', startAt: '', endAt: '', registrationDeadline: '', capacity: '' };
    }
    return {
        title: event.title,
        tagline: event.tagline || '',
        description: event.description,
        category: event.category,
        mode: event.mode,
        venueName: event.venueName || '',
        venueAddress: event.venueAddress || '',
        onlineUrl: event.onlineUrl || '',
        startAt: toLocalInput(event.startAt),
        endAt: toLocalInput(event.endAt),
        registrationDeadline: toLocalInput(event.registrationDeadline),
        capacity: event.capacity?.toString() || '',
    };
}

interface DetailsStepProps {
    event: OrganizerEvent | null;
    onCreate: (payload: ReturnType<typeof detailsToPayload>) => Promise<void>;
    onAutosave: (payload: ReturnType<typeof detailsToPayload>) => Promise<void>;
    onLiveChange: (data: DetailsFormData) => void;
    onContinue: () => void;
    saving: boolean;
}

export default function DetailsStep({ event, onCreate, onAutosave, onLiveChange, onContinue, saving }: DetailsStepProps) {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isDirty } } = useForm<DetailsFormData>({
        resolver: zodResolver(detailsSchema),
        defaultValues: eventToDefaults(event),
    });
    const mode = watch('mode');
    const watched = watch();
    const eventId = event?.id;
    const lastAutosaved = useRef<string>('');
    const [createError, setCreateError] = useState('');

    // Re-populate the form whenever a different event loads (e.g. switching between draft and freshly created).
    useEffect(() => {
        reset(eventToDefaults(event));
        lastAutosaved.current = '';
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event?.id]);

    // Push every keystroke up for the live preview pane — cheap, local only, no network.
    useEffect(() => {
        onLiveChange(watched);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(watched)]);

    // Debounced autosave once the draft already exists.
    useEffect(() => {
        if (!eventId || !isDirty) return;
        const parsed = detailsSchema.safeParse(watched);
        if (!parsed.success) return;
        const payload = detailsToPayload(parsed.data);
        const signature = JSON.stringify(payload);
        if (signature === lastAutosaved.current) return;
        const handle = setTimeout(() => {
            lastAutosaved.current = signature;
            onAutosave(payload);
        }, 900);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(watched), eventId, isDirty]);

    const onSubmit = async (data: DetailsFormData) => {
        if (eventId) {
            onContinue();
            return;
        }
        setCreateError('');
        try {
            await onCreate(detailsToPayload(data));
        } catch (e) {
            setCreateError(e instanceof Error ? e.message : 'Failed to create event');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">Title</Label>
                <Input className="bg-secondary/50 border-border/50 h-11" placeholder="e.g. Build Nights: Season 2" {...register('title')} />
                {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">Tagline (optional)</Label>
                <Input className="bg-secondary/50 border-border/50 h-11" placeholder="One line that sells the event" {...register('tagline')} />
            </div>
            <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">Description</Label>
                <Textarea className="bg-secondary/50 border-border/50" rows={6} placeholder="What should attendees expect?" {...register('description')} />
                {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <Label className="text-sm text-muted-foreground mb-1.5 block">Category</Label>
                    <Select value={watch('category') || undefined} onValueChange={(v) => setValue('category', v, { shouldDirty: true, shouldValidate: true })}>
                        <SelectTrigger className="bg-secondary/50 border-border/50 h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>)}</SelectContent>
                    </Select>
                    {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
                </div>
                <div>
                    <Label className="text-sm text-muted-foreground mb-1.5 block">Mode</Label>
                    <Select value={watch('mode') || undefined} onValueChange={(v) => setValue('mode', v, { shouldDirty: true, shouldValidate: true })}>
                        <SelectTrigger className="bg-secondary/50 border-border/50 h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                    {errors.mode && <p className="mt-1 text-xs text-destructive">{errors.mode.message}</p>}
                </div>
            </div>

            {(mode === 'OFFLINE' || mode === 'HYBRID') && (
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm text-muted-foreground mb-1.5 block">Venue Name</Label>
                        <Input className="bg-secondary/50 border-border/50 h-11" {...register('venueName')} />
                        {errors.venueName && <p className="mt-1 text-xs text-destructive">{errors.venueName.message}</p>}
                    </div>
                    <div>
                        <Label className="text-sm text-muted-foreground mb-1.5 block">Venue Address</Label>
                        <Input className="bg-secondary/50 border-border/50 h-11" {...register('venueAddress')} />
                    </div>
                </div>
            )}
            {(mode === 'ONLINE' || mode === 'HYBRID') && (
                <div>
                    <Label className="text-sm text-muted-foreground mb-1.5 block">Online Link (revealed to confirmed registrants only)</Label>
                    <Input className="bg-secondary/50 border-border/50 h-11" {...register('onlineUrl')} />
                    {errors.onlineUrl && <p className="mt-1 text-xs text-destructive">{errors.onlineUrl.message}</p>}
                </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <Label className="text-sm text-muted-foreground mb-1.5 block">Starts</Label>
                    <Input type="datetime-local" className="bg-secondary/50 border-border/50 h-11" {...register('startAt')} />
                    {errors.startAt && <p className="mt-1 text-xs text-destructive">{errors.startAt.message}</p>}
                </div>
                <div>
                    <Label className="text-sm text-muted-foreground mb-1.5 block">Ends</Label>
                    <Input type="datetime-local" className="bg-secondary/50 border-border/50 h-11" {...register('endAt')} />
                    {errors.endAt && <p className="mt-1 text-xs text-destructive">{errors.endAt.message}</p>}
                </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <Label className="text-sm text-muted-foreground mb-1.5 block">Registration Deadline (optional)</Label>
                    <Input type="datetime-local" className="bg-secondary/50 border-border/50 h-11" {...register('registrationDeadline')} />
                </div>
                <div>
                    <Label className="text-sm text-muted-foreground mb-1.5 block">Overall Capacity (optional)</Label>
                    <Input type="number" min={1} className="bg-secondary/50 border-border/50 h-11" placeholder="Unlimited" {...register('capacity')} />
                </div>
            </div>

            {createError && (
                <p className="text-xs text-destructive flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {createError}</p>
            )}

            <div className="pt-2 flex items-center justify-between">
                {!eventId && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Creates your draft. Everything else autosaves from here.
                    </p>
                )}
                <Button type="submit" className="ml-auto gap-1.5" disabled={saving}>
                    {saving ? 'Creating...' : (
                        <>Continue <ArrowRight className="w-4 h-4" /></>
                    )}
                </Button>
            </div>
        </form>
    );
}
