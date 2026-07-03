import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ResumeUpload } from '@/components/ResumeUpload';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

interface Role { slug: string; title: string; type: string; location: string; isOpen: boolean; deadline: string | null; }

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    college: z.string().min(2, 'College name is required'),
    yearOfStudy: z.string().optional(),
    githubUrl: z.string().url('Enter a valid URL (include https://)').optional().or(z.literal('')),
    portfolioUrl: z.string().url('Enter a valid URL (include https://)').optional().or(z.literal('')),
    coverLetter: z.string().min(30, 'Please write at least a few lines about yourself and your work'),
});

type FormData = z.infer<typeof schema>;

export default function ApplyPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [role, setRole] = useState<Role | null>(null);
    const [roleLoading, setRoleLoading] = useState(true);
    const [resume, setResume] = useState<File | null>(null);
    const [resumeError, setResumeError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (!slug) return;
        fetch(`${API_URL}/careers/${slug}`)
            .then(async (r) => {
                if (!r.ok) { navigate('/careers', { replace: true }); return; }
                const data = await r.json();
                if (!data.isOpen || (data.deadline && new Date(data.deadline) < new Date())) {
                    navigate(`/careers/${slug}`, { replace: true });
                    return;
                }
                setRole(data);
            })
            .catch(() => navigate('/careers', { replace: true }))
            .finally(() => setRoleLoading(false));
    }, [slug, navigate]);

    const onSubmit = async (data: FormData) => {
        if (!resume) { setResumeError('Please attach your resume (PDF).'); return; }
        setSubmitError('');
        setLoading(true);
        try {
            if (USE_MOCK) {
                await new Promise((r) => setTimeout(r, 1200));
                setSubmitted(true);
                return;
            }
            const formData = new FormData();
            Object.entries(data).forEach(([k, v]) => formData.append(k, v ?? ''));
            formData.append('resume', resume);
            const res = await fetch(`${API_URL}/careers/${slug}/apply`, { method: 'POST', body: formData });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || 'Submission failed');
            setSubmitted(true);
        } catch (e) {
            setSubmitError(e instanceof Error ? e.message : 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (roleLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-background">
            <Navbar />
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-[100px]" />
            </div>

            <main className="relative z-10 mx-auto max-w-2xl px-6 pb-24 pt-32 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Link
                        to={`/careers/${slug}`}
                        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to role
                    </Link>

                    {role && (
                        <div className="mb-8">
                            <p className="text-xs font-medium uppercase tracking-widest text-primary mb-1">Application</p>
                            <h1 className="font-heading text-2xl font-bold text-foreground">{role.title}</h1>
                            <p className="mt-1 text-sm text-muted-foreground">{role.location}</p>
                        </div>
                    )}

                    <div className="glass-card rounded-2xl p-6 shadow-2xl md:p-8">
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center py-14 text-center"
                            >
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                    <CheckCircle2 className="h-7 w-7 text-primary" />
                                </div>
                                <h2 className="font-heading text-xl font-bold text-foreground">Application submitted</h2>
                                <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                                    Check your inbox — we've sent a confirmation. We'll reach out directly if you're shortlisted.
                                </p>
                                <Button asChild variant="outline" className="mt-7">
                                    <Link to="/careers">Browse other roles</Link>
                                </Button>
                            </motion.div>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <h2 className="font-heading text-lg font-semibold text-foreground">Your details</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">Takes about 3 minutes. We read every application.</p>
                                </div>

                                {submitError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mb-5 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                                    >
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        {submitError}
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="name" className="mb-1.5 block text-sm text-muted-foreground">Full Name</Label>
                                            <Input id="name" placeholder="Your name" className="h-11 border-border/50 bg-secondary/50 focus:border-primary/50" {...register('name')} />
                                            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="email" className="mb-1.5 block text-sm text-muted-foreground">Email</Label>
                                            <Input id="email" type="email" placeholder="you@example.com" className="h-11 border-border/50 bg-secondary/50 focus:border-primary/50" {...register('email')} />
                                            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="phone" className="mb-1.5 block text-sm text-muted-foreground">Phone</Label>
                                            <Input id="phone" type="tel" placeholder="98765 43210" className="h-11 border-border/50 bg-secondary/50 focus:border-primary/50" {...register('phone')} />
                                            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="college" className="mb-1.5 block text-sm text-muted-foreground">College</Label>
                                            <Input id="college" placeholder="Your college / university" className="h-11 border-border/50 bg-secondary/50 focus:border-primary/50" {...register('college')} />
                                            {errors.college && <p className="mt-1 text-xs text-destructive">{errors.college.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <Label className="mb-1.5 block text-sm text-muted-foreground">Year of Study <span className="text-muted-foreground/50">(optional)</span></Label>
                                            <Controller
                                                name="yearOfStudy"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="h-11 border-border/50 bg-secondary/50">
                                                            <SelectValue placeholder="Select year" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Recent Graduate'].map((y) => (
                                                                <SelectItem key={y} value={y}>{y}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="githubUrl" className="mb-1.5 block text-sm text-muted-foreground">GitHub <span className="text-muted-foreground/50">(optional)</span></Label>
                                            <Input id="githubUrl" placeholder="https://github.com/you" className="h-11 border-border/50 bg-secondary/50 focus:border-primary/50" {...register('githubUrl')} />
                                            {errors.githubUrl && <p className="mt-1 text-xs text-destructive">{errors.githubUrl.message}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="portfolioUrl" className="mb-1.5 block text-sm text-muted-foreground">Portfolio / LinkedIn <span className="text-muted-foreground/50">(optional)</span></Label>
                                        <Input id="portfolioUrl" placeholder="https://..." className="h-11 border-border/50 bg-secondary/50 focus:border-primary/50" {...register('portfolioUrl')} />
                                        {errors.portfolioUrl && <p className="mt-1 text-xs text-destructive">{errors.portfolioUrl.message}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="coverLetter" className="mb-1.5 block text-sm text-muted-foreground">Tell us about yourself & your work</Label>
                                        <Textarea
                                            id="coverLetter"
                                            rows={6}
                                            placeholder="What have you built? What are you proud of? Why this role? Links to projects or repos are welcome."
                                            className="resize-none border-border/50 bg-secondary/50 focus:border-primary/50"
                                            {...register('coverLetter')}
                                        />
                                        {errors.coverLetter && <p className="mt-1 text-xs text-destructive">{errors.coverLetter.message}</p>}
                                    </div>

                                    <div>
                                        <Label className="mb-1.5 block text-sm text-muted-foreground">Resume</Label>
                                        <ResumeUpload
                                            onChange={(f) => { setResume(f); if (f) setResumeError(''); }}
                                            error={resumeError}
                                        />
                                    </div>

                                    <Button type="submit" size="lg" disabled={loading} className="group w-full">
                                        {loading ? (
                                            <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                        ) : (
                                            <>Submit Application <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                                        )}
                                    </Button>
                                </form>
                            </>
                        )}
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
