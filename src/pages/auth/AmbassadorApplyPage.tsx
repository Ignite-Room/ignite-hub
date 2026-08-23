import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';

const schema = z.object({
    college: z.string().min(2, 'College / Institution is required'),
    enrollmentId: z.string().min(2, 'Enrollment / Employee ID is required'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
});

type FormData = z.infer<typeof schema>;

export default function AmbassadorApplyPage() {
    const { isAuthenticated, user, applyAmbassador } = useAuth();
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { phone: user?.phone || '' },
    });

    const alreadyApproved = user?.role === 'AMBASSADOR' && user?.accountStatus === 'APPROVED';
    const alreadyPending = user?.role === 'AMBASSADOR' && user?.accountStatus === 'PENDING';

    const onSubmit = async (data: FormData) => {
        setError('');
        setLoading(true);
        try {
            await applyAmbassador(data);
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
                    <h1 className="text-2xl font-bold mb-1">Apply for the Campus Ambassador Program</h1>
                    <p className="text-muted-foreground text-sm mb-6">
                        Lead your campus community, run tasks, and unlock exclusive rewards. Your existing Ignite Room account gets upgraded once approved — no new account needed.
                    </p>

                    {!isAuthenticated ? (
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-amber-300">
                            You need an Ignite Room account to apply.{' '}
                            <Link to="/login" state={{ from: { pathname: '/ambassador/apply' } }} className="underline font-medium">Log in or sign up</Link> first, then come back here.
                        </div>
                    ) : alreadyApproved ? (
                        <div className="p-5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-emerald-300 mb-1">You're already an Ambassador</p>
                                <p className="text-sm text-emerald-400/80">
                                    Head to your <Link to="/ambassador/dashboard" className="underline">dashboard</Link> to track referrals and tasks.
                                </p>
                            </div>
                        </div>
                    ) : alreadyPending ? (
                        <div className="p-5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-amber-300 mb-1">Application already submitted</p>
                                <p className="text-sm text-amber-400/80">An admin will review it shortly. You'll be notified by email either way.</p>
                            </div>
                        </div>
                    ) : submitted ? (
                        <div className="p-5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-emerald-300 mb-1">Application submitted</p>
                                <p className="text-sm text-emerald-400/80">An admin will review it shortly. You'll be notified by email either way — your account stays fully usable in the meantime.</p>
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
                                <Label className="text-sm text-muted-foreground mb-1.5 block">College / Institution</Label>
                                <Input placeholder="IIIT Delhi" className="bg-secondary/50 border-border/50 h-11" {...register('college')} />
                                {errors.college && <p className="mt-1 text-xs text-destructive">{errors.college.message}</p>}
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Enrollment / Employee ID</Label>
                                <Input placeholder="MT23001 or EMP-0042" className="bg-secondary/50 border-border/50 h-11" {...register('enrollmentId')} />
                                {errors.enrollmentId && <p className="mt-1 text-xs text-destructive">{errors.enrollmentId.message}</p>}
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Phone Number</Label>
                                <Input type="tel" placeholder="9876543210" className="bg-secondary/50 border-border/50 h-11" {...register('phone')} />
                                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
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
