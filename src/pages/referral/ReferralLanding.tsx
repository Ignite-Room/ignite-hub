import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Github, ListChecks, CheckCircle2, AlertCircle, Upload, X, Loader2, ExternalLink, Sparkles } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, type Task } from '@/lib/api';
import type { User } from '@/lib/auth-context';
import { useSEO } from '@/hooks/use-seo';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

/** Loads the reCAPTCHA v3 script once and resolves when ready */
function loadRecaptcha(siteKey: string): Promise<void> {
    return new Promise((resolve) => {
        if ((window as Window & { grecaptcha?: unknown }).grecaptcha) return resolve();
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        script.onload = () => resolve();
        document.head.appendChild(script);
    });
}

async function getRecaptchaToken(siteKey: string): Promise<string | undefined> {
    try {
        await loadRecaptcha(siteKey);
        return await new Promise<string>((resolve, reject) => {
            const gr = (window as Window & { grecaptcha?: { ready: (cb: () => void) => void; execute: (key: string, opts: { action: string }) => Promise<string> } }).grecaptcha;
            if (!gr) return reject(new Error('reCAPTCHA not available'));
            gr.ready(async () => {
                try {
                    const token = await gr.execute(siteKey, { action: 'submit' });
                    resolve(token);
                } catch (e) { reject(e); }
            });
        });
    } catch {
        return undefined; // non-blocking — backend will still validate
    }
}

// Every task requires name + email; phone/github are added per-task based on
// task.fields, mirroring what used to be a static per-key schema switch.
function buildSchema(task: Task) {
    return z.object({
        name: z.string().min(2, 'Full name is required'),
        email: z.string().email('Enter a valid email address'),
        phone: task.fields.phone
            ? z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
            : z.string().optional(),
        githubUrl: task.fields.github
            ? z.string().min(1, 'GitHub profile link is required').regex(/^https?:\/\/(www\.)?github\.com\/.+/i, 'Enter a valid GitHub profile URL')
            : z.string().optional(),
    });
}
type TaskForm = { name: string; email: string; phone?: string; githubUrl?: string };

function TaskCard({ task, ambassadorCode }: { task: Task; ambassadorCode: string }) {
    const schema = buildSchema(task);
    const { register, handleSubmit, formState: { errors } } = useForm<TaskForm>({
        resolver: zodResolver(schema) as Resolver<TaskForm>,
    });
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) {
            setError('Only PNG, JPG, and JPEG files are accepted.');
            return;
        }
        setScreenshot(file);
        setScreenshotPreview(URL.createObjectURL(file));
        setError('');
    };

    const onSubmit = async (data: TaskForm) => {
        if (!screenshot) { setError('Please upload a screenshot of your completed task.'); return; }
        setError('');
        setLoading(true);
        try {
            let recaptchaToken: string | undefined;
            if (!USE_MOCK && RECAPTCHA_SITE_KEY) {
                recaptchaToken = await getRecaptchaToken(RECAPTCHA_SITE_KEY);
            }

            await api.submitTask({
                ambassadorCode,
                taskKey: task.id,
                name: data.name,
                email: data.email,
                phone: task.fields.phone ? data.phone : undefined,
                githubUsername: task.fields.github ? data.githubUrl : undefined,
                screenshotFile: screenshot,
                recaptchaToken,
            });
            setSuccess(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-md border border-green-500/20 p-6 sm:p-8 text-center"
            >
                <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1 flex items-center justify-center gap-2">
                    Submitted! <Sparkles className="w-4 h-4 text-orange-400" />
                </h3>
                <p className="text-sm text-muted-foreground">
                    {task.title} is pending review. You&apos;ll be notified once it&apos;s verified.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="glass-card rounded-md border border-border/50 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {task.fields.github ? <Github className="w-5 h-5 text-primary" /> : <ListChecks className="w-5 h-5 text-primary" />}
                </div>
                <h2 className="text-lg font-bold text-foreground">{task.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{task.instructions || task.description}</p>
            {task.ctaUrl && (
                <a
                    href={task.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-6 break-all"
                >
                    {task.ctaLabel || 'Open task link'} <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                </a>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <Label htmlFor={`${task.id}-name`}>Full Name</Label>
                    <Input id={`${task.id}-name`} placeholder="Your name" {...register('name')} className="mt-1.5" />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>

                <div>
                    <Label htmlFor={`${task.id}-email`}>Email</Label>
                    <Input id={`${task.id}-email`} type="email" placeholder="you@example.com" {...register('email')} className="mt-1.5" />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>

                {task.fields.phone && (
                    <div>
                        <Label htmlFor={`${task.id}-phone`}>Phone Number</Label>
                        <Input id={`${task.id}-phone`} type="tel" placeholder="9876543210" {...register('phone')} className="mt-1.5" />
                        {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
                    </div>
                )}

                {task.fields.github && (
                    <div>
                        <Label htmlFor={`${task.id}-github`}>GitHub Profile URL</Label>
                        <Input id={`${task.id}-github`} placeholder="https://github.com/yourusername" {...register('githubUrl')} className="mt-1.5" />
                        {errors.githubUrl && <p className="text-sm text-destructive mt-1">{errors.githubUrl.message}</p>}
                    </div>
                )}

                <div>
                    <Label>Screenshot Proof</Label>
                    {!screenshotPreview ? (
                        <label className="mt-1.5 flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border/60 hover:border-primary/40 transition-colors p-6 cursor-pointer text-center">
                            <Upload className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">PNG or JPG, up to 5MB</span>
                            <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleFileChange} />
                        </label>
                    ) : (
                        <div className="mt-1.5 relative rounded-xl overflow-hidden border border-border/60">
                            <img src={screenshotPreview} alt="Screenshot preview" className="w-full max-h-48 object-cover" />
                            <button
                                type="button"
                                onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Submit ${task.title}`}
                </Button>
            </form>
        </div>
    );
}

export default function ReferralLanding() {
    useSEO({
        title: 'Complete a Task',
        description: 'Complete an Ignite Room ambassador task to help the referring ambassador earn leaderboard points.',
        noindex: true,
    });

    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const [ambassador, setAmbassador] = useState<User | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [tasks, setTasks] = useState<Task[] | null>(null);
    const recaptchaReady = useRef(false);

    useEffect(() => {
        if (!USE_MOCK && RECAPTCHA_SITE_KEY) {
            loadRecaptcha(RECAPTCHA_SITE_KEY).then(() => { recaptchaReady.current = true; });
        }
    }, []);

    useEffect(() => {
        api.getTasks().then(setTasks).catch(() => setTasks([]));
    }, []);

    useEffect(() => {
        if (!code) { setNotFound(true); return; }
        api.getAmbassadorByCode(code).then(amb => {
            if (!amb) { setNotFound(true); return; }
            setAmbassador(amb);
            api.logReferralVisit(amb.id);
        });
    }, [code]);

    if (notFound) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Invalid Referral Link</h1>
                    <p className="text-muted-foreground mb-6">This referral link doesn't exist or has expired.</p>
                    <Button onClick={() => navigate('/')} variant="outline">Go to Home</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-accent/6 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-primary" />
                        <span className="font-bold text-gradient">Ignite Room</span>
                    </div>
                    {ambassador && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Referred by</span>
                            <span className="text-primary font-medium">{ambassador.name}</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-14 sm:py-20">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Complete a Task</h1>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        {tasks && tasks.length > 0
                            ? <>{tasks.length === 1 ? 'One task is' : `${tasks.length} tasks are`} open right now. Complete {tasks.length === 1 ? 'it' : 'any of them'} and submit proof below:{' '}
                                {ambassador ? <><span className="text-primary font-medium">{ambassador.name}</span> gets credit for referring you.</> : ' the ambassador who referred you gets credit.'}
                            </>
                            : 'Checking for open tasks...'}
                    </p>
                </motion.div>

                {tasks === null ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="glass-card rounded-md border border-border/50 p-8 text-center">
                        <p className="text-muted-foreground text-sm">No tasks are live right now. Check back soon.</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-5">
                        {tasks.map((task, i) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <TaskCard task={task} ambassadorCode={code || ''} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
