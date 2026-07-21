import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Plus, Trash2, Upload, ListChecks } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    organizerFetch, organizerUpload, OrganizerEvent, OrganizerTicketType,
    CustomField, EventRound,
} from './organizerApi';
import RoundsEditor from './RoundsEditor';

const CATEGORIES = ['HACKATHON', 'WORKSHOP', 'TECH_TALK', 'WEBINAR', 'COMPETITION', 'CULTURAL', 'SPORTS', 'MEETUP', 'OTHER'];
const MODES = ['ONLINE', 'OFFLINE', 'HYBRID'];

const schema = z.object({
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
});

type FormData = z.infer<typeof schema>;

function toLocalInput(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function TicketTypesEditor({ eventId, ticketTypes, onChange }: { eventId: string; ticketTypes: OrganizerTicketType[]; onChange: () => void }) {
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [minTeamSize, setMinTeamSize] = useState('1');
    const [maxTeamSize, setMaxTeamSize] = useState('1');
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const handleAdd = async () => {
        setErr('');
        setSaving(true);
        try {
            await organizerFetch(`/${eventId}/ticket-types`, {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    priceInPaise: 0,
                    quantity: quantity ? parseInt(quantity, 10) : undefined,
                    minTeamSize: parseInt(minTeamSize, 10) || 1,
                    maxTeamSize: parseInt(maxTeamSize, 10) || 1,
                }),
            });
            setName(''); setQuantity(''); setMinTeamSize('1'); setMaxTeamSize('1');
            setShowForm(false);
            onChange();
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Failed to add ticket type');
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async (ticketTypeId: string) => {
        if (!confirm('Remove this ticket type?')) return;
        try {
            await organizerFetch(`/${eventId}/ticket-types/${ticketTypeId}`, { method: 'DELETE' });
            onChange();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to remove ticket type');
        }
    };

    return (
        <div className="space-y-3">
            {ticketTypes.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/40">
                    <div>
                        <p className="text-sm font-medium">{t.name} {t.maxTeamSize > 1 ? `(Team ${t.minTeamSize}-${t.maxTeamSize})` : '(Individual)'}</p>
                        <p className="text-xs text-muted-foreground">
                            Free · {t.quantity !== null ? `${t.quantitySold}/${t.quantity} claimed` : `${t.quantitySold} registered · unlimited`}
                        </p>
                    </div>
                    {t.quantitySold === 0 && (
                        <button onClick={() => handleRemove(t.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}

            {showForm ? (
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/40 space-y-3">
                    {err && <p className="text-xs text-destructive">{err}</p>}
                    <Input placeholder="Ticket name (e.g. General, Team of 4)" value={name} onChange={e => setName(e.target.value)} className="bg-background/50 h-10" />
                    <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="Quantity (blank = unlimited)" value={quantity} onChange={e => setQuantity(e.target.value)} className="bg-background/50 h-10" />
                        <Input placeholder="Min team size" type="number" min={1} value={minTeamSize} onChange={e => setMinTeamSize(e.target.value)} className="bg-background/50 h-10" />
                        <Input placeholder="Max team size" type="number" min={1} value={maxTeamSize} onChange={e => setMaxTeamSize(e.target.value)} className="bg-background/50 h-10" />
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleAdd} disabled={saving || !name}>{saving ? 'Saving...' : 'Save'}</Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                    </div>
                </div>
            ) : (
                <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Ticket Type
                </Button>
            )}
        </div>
    );
}

function CoverImageUploader({ eventId, coverImageUrl, onChange }: { eventId: string; coverImageUrl: string | null; onChange: (url: string) => void }) {
    const [uploading, setUploading] = useState(false);
    const [err, setErr] = useState('');

    const handleFile = async (file: File) => {
        setErr('');
        setUploading(true);
        try {
            const form = new FormData();
            form.append('cover', file);
            const res = await organizerUpload<{ coverImageUrl: string }>(`/${eventId}/cover-image`, form);
            onChange(res.coverImageUrl);
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <Label className="text-sm text-muted-foreground mb-1.5 block">Event Banner</Label>
            {coverImageUrl && (
                <img src={coverImageUrl} alt="Event banner" className="w-full h-40 object-cover rounded-lg mb-2 border border-border/50" />
            )}
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border/60 bg-secondary/30 text-sm text-muted-foreground hover:border-primary/40 cursor-pointer transition-colors w-fit">
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : coverImageUrl ? 'Replace banner' : 'Upload banner image'}
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
                />
            </label>
            {err && <p className="mt-1 text-xs text-destructive">{err}</p>}
        </div>
    );
}

function CustomFieldsEditor({ fields, onChange }: { fields: CustomField[]; onChange: (fields: CustomField[]) => void }) {
    const addField = () => {
        onChange([...fields, { id: crypto.randomUUID(), label: '', type: 'text', required: false }]);
    };
    const updateField = (id: string, patch: Partial<CustomField>) => {
        onChange(fields.map(f => f.id === id ? { ...f, ...patch } : f));
    };
    const removeField = (id: string) => {
        onChange(fields.filter(f => f.id !== id));
    };

    return (
        <div className="space-y-3">
            {fields.map(field => (
                <div key={field.id} className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-2">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Question label (e.g. GitHub username)"
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            className="bg-background/50 h-10 flex-1"
                        />
                        <button onClick={() => removeField(field.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                        <Select value={field.type} onValueChange={(v) => updateField(field.id, { type: v as CustomField['type'] })}>
                            <SelectTrigger className="bg-background/50 h-9 w-40"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Short Text</SelectItem>
                                <SelectItem value="textarea">Long Text</SelectItem>
                                <SelectItem value="select">Dropdown</SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
                            </SelectContent>
                        </Select>
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                            <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.id, { required: e.target.checked })} />
                            Required
                        </label>
                    </div>
                    {field.type === 'select' && (
                        <Input
                            placeholder="Options, comma-separated (e.g. Beginner, Intermediate, Advanced)"
                            value={field.options?.join(', ') || ''}
                            onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })}
                            className="bg-background/50 h-9"
                        />
                    )}
                </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={addField}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Question
            </Button>
        </div>
    );
}

export default function OrganizerEventForm() {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();
    const [event, setEvent] = useState<OrganizerEvent | null>(null);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [customFields, setCustomFields] = useState<CustomField[]>([]);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });
    const mode = watch('mode');

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        organizerFetch<OrganizerEvent[]>('/')
            .then(events => {
                const found = events.find(e => e.id === id);
                if (!found) throw new Error('Event not found');
                setEvent(found);
                reset({
                    title: found.title,
                    tagline: found.tagline || '',
                    description: found.description,
                    category: found.category,
                    mode: found.mode,
                    venueName: found.venueName || '',
                    venueAddress: found.venueAddress || '',
                    onlineUrl: found.onlineUrl || '',
                    startAt: toLocalInput(found.startAt),
                    endAt: toLocalInput(found.endAt),
                    registrationDeadline: toLocalInput(found.registrationDeadline),
                    capacity: found.capacity?.toString() || '',
                });
                setCustomFields(found.customFields || []);
            })
            .catch(e => setError(e instanceof Error ? e.message : 'Failed to load event'))
            .finally(() => setLoading(false));
    }, [id, reset]);

    const onSubmit = async (data: FormData) => {
        setError('');
        setSaving(true);
        try {
            const payload = {
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
                customFields: customFields.filter(f => f.label.trim()),
            };

            if (isEdit && id) {
                await organizerFetch(`/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
                navigate('/events/organizer');
            } else {
                const created = await organizerFetch<OrganizerEvent>('/', { method: 'POST', body: JSON.stringify(payload) });
                navigate(`/events/organizer/${created.id}/edit`, { replace: true });
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to save event');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-28 pb-20 px-6 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-1">{isEdit ? 'Edit Event' : 'Create Event'}</h1>
                <p className="text-muted-foreground text-sm mb-6">
                    {isEdit ? 'Update your event details.' : 'Starts as a draft — add ticket types, then publish when ready.'}
                </p>

                <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border/50 space-y-6">
                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label className="text-sm text-muted-foreground mb-1.5 block">Title</Label>
                            <Input className="bg-secondary/50 border-border/50 h-11" {...register('title')} />
                            {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
                        </div>
                        <div>
                            <Label className="text-sm text-muted-foreground mb-1.5 block">Tagline (optional)</Label>
                            <Input className="bg-secondary/50 border-border/50 h-11" {...register('tagline')} />
                        </div>
                        <div>
                            <Label className="text-sm text-muted-foreground mb-1.5 block">Description</Label>
                            <Textarea className="bg-secondary/50 border-border/50" rows={5} {...register('description')} />
                            {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Category</Label>
                                <Select defaultValue={event?.category} onValueChange={(v) => setValue('category', v)}>
                                    <SelectTrigger className="bg-secondary/50 border-border/50 h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>)}</SelectContent>
                                </Select>
                                {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Mode</Label>
                                <Select defaultValue={event?.mode} onValueChange={(v) => setValue('mode', v)}>
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

                        {isEdit && event ? (
                            <CoverImageUploader
                                eventId={event.id}
                                coverImageUrl={event.coverImageUrl}
                                onChange={(url) => setEvent(prev => prev ? { ...prev, coverImageUrl: url } : prev)}
                            />
                        ) : (
                            <p className="text-xs text-muted-foreground">Save the draft first to upload a banner image.</p>
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
                                <Input type="number" min={1} className="bg-secondary/50 border-border/50 h-11" {...register('capacity')} />
                            </div>
                        </div>

                        <div className="pt-2 border-t border-border/40">
                            <Label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1.5">
                                <ListChecks className="w-3.5 h-3.5" /> Registration Questions (optional)
                            </Label>
                            <CustomFieldsEditor fields={customFields} onChange={setCustomFields} />
                        </div>

                        <Button type="submit" className="w-full h-11" disabled={saving}>
                            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Draft'}
                        </Button>
                    </form>

                    {isEdit && event && (
                        <>
                            <div className="pt-4 border-t border-border/40">
                                <h2 className="text-sm font-semibold mb-3">Ticket Types</h2>
                                <TicketTypesEditor eventId={event.id} ticketTypes={event.ticketTypes} onChange={() => {
                                    organizerFetch<OrganizerEvent[]>('/').then(events => {
                                        const found = events.find(e => e.id === event.id);
                                        if (found) setEvent(found);
                                    });
                                }} />
                            </div>

                            <div className="pt-4 border-t border-border/40">
                                <h2 className="text-sm font-semibold mb-3">Rounds</h2>
                                <p className="text-xs text-muted-foreground mb-3">
                                    Add stages beyond registration — e.g. a PPT submission round, then a final round during the live event.
                                </p>
                                <RoundsEditor eventId={event.id} rounds={event.rounds} onChange={() => {
                                    organizerFetch<OrganizerEvent[]>('/').then(events => {
                                        const found = events.find(e => e.id === event.id);
                                        if (found) setEvent(found);
                                    });
                                }} />
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-4 text-center">
                    <Link to="/events/organizer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to My Events</Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
