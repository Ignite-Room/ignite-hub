import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useSEO } from '@/hooks/use-seo';

const schema = z.object({
    orgName: z.string().min(2, 'Organization name is required'),
    orgType: z.enum(['club', 'community', 'external', 'individual']),
    bio: z.string().optional(),
    website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
    contactEmail: z.string().email('Enter a valid email'),
    contactPhone: z.string().min(6, 'Phone is required'),
});

type FormData = z.infer<typeof schema>;

export default function OrganizerApplyPage() {
    useSEO({
        title: 'Become an Organizer',
        description: 'Apply to host and run events on Ignite Room. Clubs, communities, and individuals can register as organizers to reach student builders nationwide.',
        path: '/events/organizers/apply',
    });

    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { contactEmail: user?.email || '' },
    });

    const onSubmit = async (data: FormData) => {
        setError('');
        setLoading(true);
        try {
            await api.applyOrganizer({
                orgName: data.orgName,
                orgType: data.orgType,
                bio: data.bio,
                website: data.website || undefined,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
            });
            setSubmitted(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Application failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-28 pb-20 px-6 max-w-xl mx-auto">
                <div className="glass-card rounded-md p-6 sm:p-8 border border-border/50">
                    <h1 className="text-2xl font-bold mb-1">Become an Organizer</h1>
                    <p className="text-muted-foreground text-sm mb-6">
                        Apply to host hackathons, workshops, or meetups on Ignite Room. Once approved, you can create and publish events freely.
                    </p>

                    {!isAuthenticated ? (
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-orange-300">
                            You need to be logged in to apply.{' '}
                            <Link to="/login" className="underline font-medium">Log in or sign up</Link> first.
                        </div>
                    ) : submitted ? (
                        <div className="p-5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-emerald-300 mb-1">Application submitted</p>
                                <p className="text-sm text-emerald-400/80">An admin will review it shortly. You'll be notified by email either way.</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-sm text-destructive">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                                </div>
                            )}
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Organization / Club Name</Label>
                                <Input className="bg-secondary/50 border-border/50 h-11" {...register('orgName')} />
                                {errors.orgName && <p className="mt-1 text-xs text-destructive">{errors.orgName.message}</p>}
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Organizer Type</Label>
                                <Select onValueChange={(v) => setValue('orgType', v as FormData['orgType'])}>
                                    <SelectTrigger className="bg-secondary/50 border-border/50 h-11"><SelectValue placeholder="Select type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="club">College Club</SelectItem>
                                        <SelectItem value="community">Community</SelectItem>
                                        <SelectItem value="external">External Organization</SelectItem>
                                        <SelectItem value="individual">Individual</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.orgType && <p className="mt-1 text-xs text-destructive">{errors.orgType.message}</p>}
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Bio (optional)</Label>
                                <Textarea className="bg-secondary/50 border-border/50" rows={3} {...register('bio')} />
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Website (optional)</Label>
                                <Input className="bg-secondary/50 border-border/50 h-11" placeholder="https://..." {...register('website')} />
                                {errors.website && <p className="mt-1 text-xs text-destructive">{errors.website.message}</p>}
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm text-muted-foreground mb-1.5 block">Contact Email</Label>
                                    <Input type="email" className="bg-secondary/50 border-border/50 h-11" {...register('contactEmail')} />
                                    {errors.contactEmail && <p className="mt-1 text-xs text-destructive">{errors.contactEmail.message}</p>}
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground mb-1.5 block">Contact Phone</Label>
                                    <Input type="tel" className="bg-secondary/50 border-border/50 h-11" {...register('contactPhone')} />
                                    {errors.contactPhone && <p className="mt-1 text-xs text-destructive">{errors.contactPhone.message}</p>}
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-11" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </form>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
