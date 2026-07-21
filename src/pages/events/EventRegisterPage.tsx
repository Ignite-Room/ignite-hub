import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api, EventDetail, TicketTypeWithAvailability } from '@/lib/api';
import { getRecaptchaToken, RECAPTCHA_SITE_KEY } from '@/lib/recaptcha';

const schema = z.object({
    ticketTypeId: z.string().min(1, 'Select a ticket type'),
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().min(6, 'Phone is required'),
    teamName: z.string().optional(),
    teamMembers: z.array(z.object({
        name: z.string().min(1, 'Name required'),
        email: z.string().email('Invalid email').optional().or(z.literal('')),
        phone: z.string().optional(),
    })),
});

type FormData = z.infer<typeof schema>;

export default function EventRegisterPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [answers, setAnswers] = useState<Record<string, string | boolean>>({});

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { teamMembers: [] },
    });
    const { fields, append, remove } = useFieldArray({ control, name: 'teamMembers' });
    const ticketTypeId = watch('ticketTypeId');

    useEffect(() => {
        if (!slug) return;
        api.getEvent(slug)
            .then(setEvent)
            .catch(e => setError(e instanceof Error ? e.message : 'Event not found'))
            .finally(() => setLoading(false));
    }, [slug]);

    const selectedTicket: TicketTypeWithAvailability | undefined = event?.ticketTypes.find(t => t.id === ticketTypeId);

    useEffect(() => {
        // Reset team members to the minimum required whenever the ticket type changes
        if (!selectedTicket) return;
        const needed = Math.max(0, selectedTicket.minTeamSize - 1);
        setValue('teamMembers', Array.from({ length: needed }, () => ({ name: '', email: '', phone: '' })));
    }, [selectedTicket, setValue]);

    const onSubmit = async (data: FormData) => {
        if (!slug || !event) return;
        setError('');

        for (const field of event.customFields || []) {
            if (field.required && !answers[field.id]) {
                setError(`"${field.label}" is required`);
                return;
            }
        }

        setSubmitting(true);
        try {
            let recaptchaToken: string | undefined;
            if (RECAPTCHA_SITE_KEY) {
                recaptchaToken = await getRecaptchaToken(RECAPTCHA_SITE_KEY, 'event_register');
            }

            const res = await api.registerForEvent(slug, {
                ticketTypeId: data.ticketTypeId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                teamName: data.teamName || undefined,
                teamMembers: data.teamMembers
                    .filter(m => m.name.trim())
                    .map(m => ({ name: m.name, email: m.email || undefined, phone: m.phone || undefined })),
                answers,
                recaptchaToken,
            });
            navigate(`/events/ticket/${res.token}`, { replace: true });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-40 pb-20 px-6 max-w-3xl mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-3">Event not found</h1>
                    <Button asChild variant="outline"><Link to="/events">Back to Events</Link></Button>
                </main>
                <Footer />
            </div>
        );
    }

    const showTeamFields = selectedTicket && selectedTicket.maxTeamSize > 1;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-28 pb-20 px-6 max-w-2xl mx-auto">
                <button onClick={() => navigate(`/events/${slug}`)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Event
                </button>

                <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border/50">
                    <h1 className="text-2xl font-bold mb-1">Register for {event.title}</h1>
                    <p className="text-muted-foreground text-sm mb-6">Fill in your details to reserve your spot.</p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label className="text-sm text-muted-foreground mb-1.5 block">Ticket Type</Label>
                            <Select onValueChange={(v) => setValue('ticketTypeId', v)}>
                                <SelectTrigger className="bg-secondary/50 border-border/50 h-11"><SelectValue placeholder="Select a ticket type" /></SelectTrigger>
                                <SelectContent>
                                    {event.ticketTypes.map(t => (
                                        <SelectItem key={t.id} value={t.id} disabled={!t.onSale || t.available === 0}>
                                            {t.name} {t.priceInPaise === 0 ? '(Free)' : `(₹${t.priceInPaise / 100})`}
                                            {t.available !== null ? ` — ${t.available} left` : ''}
                                            {t.maxTeamSize > 1 ? ` — Team of ${t.minTeamSize}-${t.maxTeamSize}` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.ticketTypeId && <p className="mt-1 text-xs text-destructive">{errors.ticketTypeId.message}</p>}
                        </div>

                        <div>
                            <Label className="text-sm text-muted-foreground mb-1.5 block">Your Name {showTeamFields && '(Team Lead)'}</Label>
                            <Input className="bg-secondary/50 border-border/50 h-11" {...register('name')} />
                            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Email</Label>
                                <Input type="email" className="bg-secondary/50 border-border/50 h-11" {...register('email')} />
                                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Phone</Label>
                                <Input type="tel" className="bg-secondary/50 border-border/50 h-11" {...register('phone')} />
                                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
                            </div>
                        </div>

                        {(event.customFields || []).map(field => (
                            <div key={field.id}>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">
                                    {field.label} {field.required && <span className="text-destructive">*</span>}
                                </Label>
                                {field.type === 'text' && (
                                    <Input
                                        className="bg-secondary/50 border-border/50 h-11"
                                        value={(answers[field.id] as string) || ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                                    />
                                )}
                                {field.type === 'textarea' && (
                                    <Textarea
                                        className="bg-secondary/50 border-border/50"
                                        rows={3}
                                        value={(answers[field.id] as string) || ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                                    />
                                )}
                                {field.type === 'select' && (
                                    <Select onValueChange={(v) => setAnswers(prev => ({ ...prev, [field.id]: v }))}>
                                        <SelectTrigger className="bg-secondary/50 border-border/50 h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {(field.options || []).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}
                                {field.type === 'checkbox' && (
                                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={(answers[field.id] as boolean) || false}
                                            onChange={(e) => setAnswers(prev => ({ ...prev, [field.id]: e.target.checked }))}
                                        />
                                        Yes
                                    </label>
                                )}
                            </div>
                        ))}

                        {showTeamFields && (
                            <>
                                <div>
                                    <Label className="text-sm text-muted-foreground mb-1.5 block">Team Name</Label>
                                    <Input className="bg-secondary/50 border-border/50 h-11" {...register('teamName')} />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm text-muted-foreground">
                                            Team Members ({fields.length + 1}/{selectedTicket!.maxTeamSize})
                                        </Label>
                                        {fields.length + 1 < selectedTicket!.maxTeamSize && (
                                            <Button
                                                type="button" size="sm" variant="outline"
                                                onClick={() => append({ name: '', email: '', phone: '' })}
                                            >
                                                <Plus className="w-3.5 h-3.5 mr-1" /> Add Member
                                            </Button>
                                        )}
                                    </div>
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2 items-start p-3 rounded-lg bg-secondary/30 border border-border/40">
                                            <div className="flex-1 grid sm:grid-cols-3 gap-2">
                                                <Input placeholder="Name" className="bg-background/50 border-border/50 h-10" {...register(`teamMembers.${index}.name`)} />
                                                <Input placeholder="Email (optional)" className="bg-background/50 border-border/50 h-10" {...register(`teamMembers.${index}.email`)} />
                                                <Input placeholder="Phone (optional)" className="bg-background/50 border-border/50 h-10" {...register(`teamMembers.${index}.phone`)} />
                                            </div>
                                            {index >= selectedTicket!.minTeamSize - 1 && (
                                                <button type="button" onClick={() => remove(index)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <Button type="submit" className="w-full h-11 mt-2" disabled={submitting}>
                            {submitting ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : 'Complete Registration'}
                        </Button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
