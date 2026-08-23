import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Loader2,
    Rocket,
    Smartphone,
    Sparkles,
    Users,
} from 'lucide-react';
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

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    college: z.string().min(2, 'College name is required'),
    yearOfStudy: z.string().min(1, 'Select your year of study'),
    techStack: z.string().min(2, 'Tell us what you build with'),
    githubUrl: z.string().url('Enter a valid URL (include https://)'),
    portfolioUrl: z.string().url('Enter a valid URL (include https://)').optional().or(z.literal('')),
    projects: z.string().min(30, 'Tell us a bit more, at least a few lines'),
});

type FormData = z.infer<typeof schema>;

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const highlights = [
    {
        icon: Smartphone,
        title: 'Ship a real product',
        description: 'Work on the official Ignite Room app from day one, not a practice project.',
    },
    {
        icon: Users,
        title: 'Mentorship & team',
        description: 'Build alongside the core team with code reviews and direct guidance.',
    },
    {
        icon: Rocket,
        title: 'Launch with us',
        description: 'Your work goes live to the whole community. Certificate & LoR included.',
    },
];

export default function InternApplication() {
    const [resume, setResume] = useState<File | null>(null);
    const [resumeError, setResumeError] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        if (!resume) {
            setResumeError('Please attach your resume (PDF).');
            return;
        }
        setError('');
        setLoading(true);
        try {
            if (USE_MOCK) {
                await new Promise((r) => setTimeout(r, 1200));
                setSubmitted(true);
                return;
            }

            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => formData.append(key, value ?? ''));
            formData.append('resume', resume);

            const res = await fetch(`${API_URL}/internships`, {
                method: 'POST',
                body: formData,
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || 'Submission failed');

            setSubmitted(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-background">
            <Navbar />

            {/* Ambient glows */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
                <div className="absolute bottom-1/4 right-0 h-96 w-96 rounded-full bg-accent/6 blur-3xl" />
            </div>

            <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-32 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-2xl text-center"
                >
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">We're hiring: App launch team</span>
                    </div>
                    <h1 className="font-heading text-4xl font-bold leading-tight md:text-6xl">
                        <span className="text-foreground">App Developer</span>{' '}
                        <span className="text-gradient">Intern</span>
                    </h1>
                    <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                        The Ignite Room app is launching soon, and we're looking for builders to
                        help us take it to the community. Show us what you've made.
                    </p>
                </motion.div>

                <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.5fr]">
                    {/* Left — role highlights */}
                    <motion.aside
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="space-y-4 lg:sticky lg:top-28 lg:self-start"
                    >
                        {highlights.map((item) => (
                            <div
                                key={item.title}
                                className="glass-card rounded-xl p-6 transition-colors hover:border-primary/30"
                            >
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <item.icon className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-heading text-base font-semibold text-foreground">{item.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                            </div>
                        ))}
                        <p className="px-1 text-xs leading-relaxed text-muted-foreground/70">
                            Remote-friendly · Flexible hours · Open to all colleges.
                            Questions? <Link to="/contact" className="text-primary hover:underline">Contact us</Link>.
                        </p>
                    </motion.aside>

                    {/* Right — application form */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                    >
                        <div className="glass-card rounded-md p-6 shadow-2xl md:p-8">
                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex flex-col items-center py-16 text-center"
                                >
                                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                        <CheckCircle2 className="h-8 w-8 text-primary" />
                                    </div>
                                    <h2 className="font-heading text-2xl font-bold text-foreground">Application received</h2>
                                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                                        Thanks for applying! We've sent a confirmation to your email.
                                        Our team reviews every application and will reach out to shortlisted candidates soon.
                                    </p>
                                    <Button asChild variant="outline" className="mt-8">
                                        <Link to="/">Back to home</Link>
                                    </Button>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="mb-6">
                                        <h2 className="font-heading text-xl font-bold text-foreground">Apply now</h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Takes about 3 minutes. We read every application.
                                        </p>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mb-5 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                                        >
                                            <AlertCircle className="h-4 w-4 shrink-0" />
                                            {error}
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
                                                <Label className="mb-1.5 block text-sm text-muted-foreground">Year of Study</Label>
                                                <Controller
                                                    name="yearOfStudy"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="h-11 border-border/50 bg-secondary/50 focus:border-primary/50">
                                                                <SelectValue placeholder="Select year" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="1st Year">1st Year</SelectItem>
                                                                <SelectItem value="2nd Year">2nd Year</SelectItem>
                                                                <SelectItem value="3rd Year">3rd Year</SelectItem>
                                                                <SelectItem value="4th Year">4th Year</SelectItem>
                                                                <SelectItem value="Recent Graduate">Recent Graduate</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.yearOfStudy && <p className="mt-1 text-xs text-destructive">{errors.yearOfStudy.message}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="techStack" className="mb-1.5 block text-sm text-muted-foreground">Tech Stack</Label>
                                                <Input id="techStack" placeholder="Flutter, React Native, Kotlin…" className="h-11 border-border/50 bg-secondary/50 focus:border-primary/50" {...register('techStack')} />
                                                {errors.techStack && <p className="mt-1 text-xs text-destructive">{errors.techStack.message}</p>}
                                            </div>
                                        </div>

                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div>
                                                <Label htmlFor="githubUrl" className="mb-1.5 block text-sm text-muted-foreground">GitHub</Label>
                                                <Input id="githubUrl" placeholder="https://github.com/username" className="h-11 border-border/50 bg-secondary/50 focus:border-primary/50" {...register('githubUrl')} />
                                                {errors.githubUrl && <p className="mt-1 text-xs text-destructive">{errors.githubUrl.message}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="portfolioUrl" className="mb-1.5 block text-sm text-muted-foreground">
                                                    Portfolio / LinkedIn <span className="text-muted-foreground/50">(optional)</span>
                                                </Label>
                                                <Input id="portfolioUrl" placeholder="https://…" className="h-11 border-border/50 bg-secondary/50 focus:border-primary/50" {...register('portfolioUrl')} />
                                                {errors.portfolioUrl && <p className="mt-1 text-xs text-destructive">{errors.portfolioUrl.message}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="projects" className="mb-1.5 block text-sm text-muted-foreground">Your Projects</Label>
                                            <Textarea
                                                id="projects"
                                                rows={5}
                                                placeholder="Tell us about your best work: what you built, the stack you used, and links if they're live or on GitHub."
                                                className="resize-none border-border/50 bg-secondary/50 focus:border-primary/50"
                                                {...register('projects')}
                                            />
                                            {errors.projects && <p className="mt-1 text-xs text-destructive">{errors.projects.message}</p>}
                                        </div>

                                        <div>
                                            <Label className="mb-1.5 block text-sm text-muted-foreground">Resume</Label>
                                            <ResumeUpload
                                                onChange={(file) => { setResume(file); if (file) setResumeError(''); }}
                                                error={resumeError}
                                            />
                                        </div>

                                        <Button type="submit" size="lg" disabled={loading} className="group w-full">
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Submitting…
                                                </>
                                            ) : (
                                                <>
                                                    Submit Application
                                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
