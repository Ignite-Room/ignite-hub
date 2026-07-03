import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResumeUpload } from '@/components/ResumeUpload';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

interface Role { slug: string; title: string; type: string; location: string; isOpen: boolean; deadline: string | null; }

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    college: z.string().min(2, 'College name is required'),
    yearOfStudy: z.string().min(1, 'Please select your year of study'),
    githubUrl: z.string().url('Enter a valid URL starting with https://'),
    portfolioUrl: z.string().url('Enter a valid URL starting with https://'),
    projectUrl: z.string().url('Enter a valid URL starting with https://'),
    coverLetter: z.string().min(30, 'Please write at least a few lines about yourself and your work'),
    followedSocials: z.literal(true, {
        errorMap: () => ({ message: 'Please follow us on Instagram and LinkedIn to proceed' }),
    }),
    agreedToTerms: z.literal(true, {
        errorMap: () => ({ message: 'Please read and agree to the terms to proceed' }),
    }),
});

type FormData = z.infer<typeof schema>;

// ─── Terms Modal ──────────────────────────────────────────────────────────────

function TermsModal({ onClose }: { onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="glass-card relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 flex items-center justify-between border-b border-border/50 bg-card/90 px-6 py-4 backdrop-blur-sm">
                    <h2 className="font-heading text-base font-semibold text-foreground">Application Terms &amp; Conditions</h2>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-5 px-6 py-5 text-sm leading-7 text-muted-foreground">
                    <p className="text-xs text-muted-foreground/60 uppercase tracking-wider">Last updated: July 2025</p>

                    <section>
                        <h3 className="mb-2 font-heading font-semibold text-foreground">1. What you're applying for</h3>
                        <p>
                            Submitting this form is your formal application to the role listed on this page. Ignite Room is a student-run
                            technology community. All internship positions are project-based and focused on real-world experience.
                            Unless explicitly stated in the offer letter, internships are unpaid. Completing an internship entitles
                            you to a certificate of completion and, where applicable, a letter of recommendation from the core team.
                        </p>
                    </section>

                    <section>
                        <h3 className="mb-2 font-heading font-semibold text-foreground">2. What we collect</h3>
                        <p>
                            By submitting this form, you consent to Ignite Room collecting and storing the information you provide —
                            including your name, email address, phone number, academic details, resume, project links, and any other
                            content you include in your application. This data is used solely to evaluate your suitability for the role.
                        </p>
                    </section>

                    <section>
                        <h3 className="mb-2 font-heading font-semibold text-foreground">3. How we use your data</h3>
                        <p>
                            Your application is reviewed only by Ignite Room's core recruitment team. We do not share, sell, or
                            disclose your personal information to third parties. Your resume and details will not be used for any
                            purpose outside of this recruitment process.
                        </p>
                    </section>

                    <section>
                        <h3 className="mb-2 font-heading font-semibold text-foreground">4. Selection process</h3>
                        <p>
                            We review applications in batches. Due to the volume of applications we receive, we will only contact
                            you if you are shortlisted. Submitting an application does not guarantee a response, an interview, or
                            an offer. Ignite Room reserves the right to close applications or cancel a role at any time.
                        </p>
                    </section>

                    <section>
                        <h3 className="mb-2 font-heading font-semibold text-foreground">5. Data retention</h3>
                        <p>
                            We retain application data for up to 12 months after submission. After that period, your data is
                            permanently deleted from our systems. You may request earlier deletion by emailing us at
                            <a href="mailto:admin@igniteroom.in" className="ml-1 text-primary hover:underline">admin@igniteroom.in</a>.
                        </p>
                    </section>

                    <section>
                        <h3 className="mb-2 font-heading font-semibold text-foreground">6. Conduct</h3>
                        <p>
                            If selected, you are expected to follow Ignite Room's Code of Conduct throughout the duration of
                            your engagement. Violations may result in immediate termination of the internship without a certificate.
                        </p>
                    </section>

                    <section>
                        <h3 className="mb-2 font-heading font-semibold text-foreground">7. No contract</h3>
                        <p>
                            These terms do not constitute a contract of employment or service. Ignite Room makes no guarantee of
                            payment, continued engagement, or employment arising from this application or any internship.
                        </p>
                    </section>

                    <div className="pt-2">
                        <Button className="w-full" onClick={onClose}>Got it, I agree</Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
    const [termsOpen, setTermsOpen] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            followedSocials: undefined,
            agreedToTerms: undefined,
        },
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
            const { followedSocials, agreedToTerms, ...rest } = data;
            void followedSocials; void agreedToTerms;
            Object.entries(rest).forEach(([k, v]) => formData.append(k, v ?? ''));
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

            <AnimatePresence>
                {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} />}
            </AnimatePresence>

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
                                    {/* Name + Email */}
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

                                    {/* Phone + College */}
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="phone" className="mb-1.5 block text-sm text-muted-foreground">Phone</Label>
                                            <Input id="phone" type="tel" placeholder="98765 43210" className="h-11 border-border/50 bg-secondary/50 focus:border-primary/50" {...register('phone')} />
                                            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="college" className="mb-1.5 block text-sm text-muted-foreground">College / University</Label>
                                            <Input id="college" placeholder="Your college" className="h-11 border-border/50 bg-secondary/50 focus:border-primary/50" {...register('college')} />
                                            {errors.college && <p className="mt-1 text-xs text-destructive">{errors.college.message}</p>}
                                        </div>
                                    </div>

                                    {/* Year + GitHub */}
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <Label className="mb-1.5 block text-sm text-muted-foreground">Year of Study</Label>
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
                                            {errors.yearOfStudy && <p className="mt-1 text-xs text-destructive">{errors.yearOfStudy.message}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="githubUrl" className="mb-1.5 block text-sm text-muted-foreground">GitHub Profile</Label>
                                            <Input id="githubUrl" placeholder="https://github.com/you" className="h-11 border-border/50 bg-secondary/50 focus:border-primary/50" {...register('githubUrl')} />
                                            {errors.githubUrl && <p className="mt-1 text-xs text-destructive">{errors.githubUrl.message}</p>}
                                        </div>
                                    </div>

                                    {/* Portfolio + Project */}
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="portfolioUrl" className="mb-1.5 block text-sm text-muted-foreground">Portfolio / LinkedIn</Label>
                                            <Input id="portfolioUrl" placeholder="https://linkedin.com/in/you" className="h-11 border-border/50 bg-secondary/50 focus:border-primary/50" {...register('portfolioUrl')} />
                                            {errors.portfolioUrl && <p className="mt-1 text-xs text-destructive">{errors.portfolioUrl.message}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="projectUrl" className="mb-1.5 block text-sm text-muted-foreground">Best Deployed Project</Label>
                                            <Input id="projectUrl" placeholder="https://yourproject.com" className="h-11 border-border/50 bg-secondary/50 focus:border-primary/50" {...register('projectUrl')} />
                                            {errors.projectUrl && <p className="mt-1 text-xs text-destructive">{errors.projectUrl.message}</p>}
                                        </div>
                                    </div>

                                    {/* Cover Letter */}
                                    <div>
                                        <Label htmlFor="coverLetter" className="mb-1.5 block text-sm text-muted-foreground">Tell us about yourself &amp; your work</Label>
                                        <Textarea
                                            id="coverLetter"
                                            rows={6}
                                            placeholder="What have you built? What are you proud of? Why this role? Links to repos or write-ups are welcome."
                                            className="resize-none border-border/50 bg-secondary/50 focus:border-primary/50"
                                            {...register('coverLetter')}
                                        />
                                        {errors.coverLetter && <p className="mt-1 text-xs text-destructive">{errors.coverLetter.message}</p>}
                                    </div>

                                    {/* Resume */}
                                    <div>
                                        <Label className="mb-1.5 block text-sm text-muted-foreground">Resume (PDF)</Label>
                                        <ResumeUpload
                                            onChange={(f) => { setResume(f); if (f) setResumeError(''); }}
                                            error={resumeError}
                                        />
                                    </div>

                                    {/* Checkboxes */}
                                    <div className="space-y-3 rounded-xl border border-border/40 bg-secondary/20 p-4">
                                        {/* Follow socials */}
                                        <Controller
                                            name="followedSocials"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <label className="flex cursor-pointer items-start gap-3">
                                                        <div className="relative mt-0.5 h-5 w-5 flex-shrink-0">
                                                            <input
                                                                type="checkbox"
                                                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0 z-10"
                                                                checked={!!field.value}
                                                                onChange={(e) => field.onChange(e.target.checked ? true : undefined)}
                                                            />
                                                            <div className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${field.value ? 'border-primary bg-primary' : 'border-border/60 bg-secondary/50'}`}>
                                                                {field.value && (
                                                                    <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                                                                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="text-sm leading-relaxed text-muted-foreground">
                                                            I follow Ignite Room on{' '}
                                                            <a href="https://www.instagram.com/igniteroom.india/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline" onClick={(e) => e.stopPropagation()}>Instagram</a>
                                                            {' '}and{' '}
                                                            <a href="https://www.linkedin.com/company/ignite-room/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline" onClick={(e) => e.stopPropagation()}>LinkedIn</a>
                                                        </span>
                                                    </label>
                                                    {errors.followedSocials && (
                                                        <p className="mt-1 pl-8 text-xs text-destructive">{errors.followedSocials.message}</p>
                                                    )}
                                                </div>
                                            )}
                                        />

                                        <div className="h-px bg-border/30" />

                                        {/* Terms */}
                                        <Controller
                                            name="agreedToTerms"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <label className="flex cursor-pointer items-start gap-3">
                                                        <div className="relative mt-0.5 h-5 w-5 flex-shrink-0">
                                                            <input
                                                                type="checkbox"
                                                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0 z-10"
                                                                checked={!!field.value}
                                                                onChange={(e) => field.onChange(e.target.checked ? true : undefined)}
                                                            />
                                                            <div className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${field.value ? 'border-primary bg-primary' : 'border-border/60 bg-secondary/50'}`}>
                                                                {field.value && (
                                                                    <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                                                                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="text-sm leading-relaxed text-muted-foreground">
                                                            I have read and agree to the{' '}
                                                            <button
                                                                type="button"
                                                                className="font-medium text-primary hover:underline relative z-20"
                                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTermsOpen(true); }}
                                                            >
                                                                Application Terms &amp; Conditions
                                                            </button>
                                                        </span>
                                                    </label>
                                                    {errors.agreedToTerms && (
                                                        <p className="mt-1 pl-8 text-xs text-destructive">{errors.agreedToTerms.message}</p>
                                                    )}
                                                </div>
                                            )}
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
