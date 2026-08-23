import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, ExternalLink, Github, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import igniteLogo from '@/assets/ignite-logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RoundData {
    id: string;
    name: string;
    description: string | null;
    submissionDeadline: string | null;
    allowFileUpload: boolean;
    allowLinks: boolean;
    deadlinePassed: boolean;
    submission: { status: string; submittedAt: string | null } | null;
}

export default function RoundSubmitPage() {
    const { token, roundId } = useParams<{ token: string; roundId: string }>();
    const [round, setRound] = useState<RoundData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [form, setForm] = useState({ repoUrl: '', liveUrl: '', notes: '' });
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/events/ticket/${token}/rounds`)
            .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
            .then((rounds: RoundData[]) => {
                const found = rounds.find(r => r.id === roundId);
                if (!found) throw new Error();
                setRound(found);
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [token, roundId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const formData = new FormData();
            if (form.repoUrl) formData.append('repoUrl', form.repoUrl);
            if (form.liveUrl) formData.append('liveUrl', form.liveUrl);
            if (form.notes) formData.append('notes', form.notes);
            if (file) formData.append('file', file);

            const r = await fetch(`${API_URL}/events/ticket/${token}/rounds/${roundId}/submit`, {
                method: 'POST',
                body: formData,
            });
            const body = await r.json();
            if (!r.ok) throw new Error(body.message);
            setSubmitted(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const deadlineStr = round?.submissionDeadline
        ? new Date(round.submissionDeadline).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long',
            year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
        }) + ' IST'
        : null;

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (notFound || !round) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
                <img src={igniteLogo} alt="Ignite Room" className="h-10 w-auto opacity-50" />
                <h1 className="text-xl font-semibold text-foreground">Round not found</h1>
                <p className="text-sm text-muted-foreground max-w-xs">This submission link is invalid. If you think this is a mistake, reach out to us at admin@igniteroom.in.</p>
            </div>
        );
    }

    const alreadySubmitted = (round.submission && round.submission.status !== 'PENDING') || submitted;

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-2xl items-center gap-3 px-6 py-4">
                    <img src={igniteLogo} alt="Ignite Room" className="h-8 w-auto" />
                    <span className="font-heading font-semibold text-foreground">Ignite Room</span>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-6 py-12">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <h1 className="mb-1 font-heading text-2xl font-bold text-foreground">{round.name}</h1>
                    {deadlineStr && (
                        <p className={`mb-8 flex items-center gap-1.5 text-sm font-medium ${round.deadlinePassed ? 'text-destructive' : 'text-orange-400'}`}>
                            <Clock className="h-4 w-4" />
                            {round.deadlinePassed ? 'Deadline passed: ' : 'Submit by '}{deadlineStr}
                        </p>
                    )}

                    {round.description && (
                        <div className="mb-8 rounded-md border border-border/50 bg-secondary/20 p-6">
                            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Instructions</h2>
                            {round.description.split('\n').map((line, i) => (
                                <p key={i} className="mb-3 last:mb-0 leading-7 text-sm text-muted-foreground">{line}</p>
                            ))}
                        </div>
                    )}

                    {alreadySubmitted ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-6 text-center"
                        >
                            <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
                            <h3 className="mb-1 font-semibold text-foreground">Submission received</h3>
                            <p className="text-sm text-muted-foreground">
                                We've got your submission. Check your ticket page for updates on the next steps.
                                {round.submission?.submittedAt && (
                                    <span className="block mt-1 text-xs text-muted-foreground/60">
                                        Submitted {new Date(round.submission.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })} IST
                                    </span>
                                )}
                            </p>
                        </motion.div>
                    ) : round.deadlinePassed ? (
                        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-6 text-center">
                            <p className="text-sm text-muted-foreground">The submission deadline for this round has passed.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Your Submission</h2>

                            {round.allowLinks && (
                                <>
                                    <div>
                                        <Label className="mb-1.5 block text-sm text-muted-foreground">
                                            GitHub / Repository URL <span className="text-muted-foreground/40">(optional)</span>
                                        </Label>
                                        <div className="relative">
                                            <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                                            <Input
                                                type="url"
                                                placeholder="https://github.com/you/project"
                                                value={form.repoUrl}
                                                onChange={(e) => setForm((p) => ({ ...p, repoUrl: e.target.value }))}
                                                className="pl-9 bg-secondary/50 border-border/50 focus:border-primary/50 h-10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="mb-1.5 block text-sm text-muted-foreground">
                                            Live / Demo / Deck URL <span className="text-muted-foreground/40">(optional)</span>
                                        </Label>
                                        <div className="relative">
                                            <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                                            <Input
                                                type="url"
                                                placeholder="https://your-demo.vercel.app or a slide deck link"
                                                value={form.liveUrl}
                                                onChange={(e) => setForm((p) => ({ ...p, liveUrl: e.target.value }))}
                                                className="pl-9 bg-secondary/50 border-border/50 focus:border-primary/50 h-10"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {round.allowFileUpload && (
                                <div>
                                    <Label className="mb-1.5 block text-sm text-muted-foreground">
                                        Upload File (PPT/PDF) <span className="text-muted-foreground/40">(optional)</span>
                                    </Label>
                                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border/60 bg-secondary/30 text-sm text-muted-foreground hover:border-primary/40 cursor-pointer transition-colors">
                                        <Upload className="w-4 h-4" />
                                        {file ? file.name : 'Choose a file (max 15 MB)'}
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </div>
                            )}

                            <div>
                                <Label className="mb-1.5 block text-sm text-muted-foreground">
                                    Notes <span className="text-muted-foreground/40">(optional)</span>
                                </Label>
                                <Textarea
                                    placeholder="Anything you'd like the judges to know..."
                                    value={form.notes}
                                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                                    rows={4}
                                    maxLength={1000}
                                    className="bg-secondary/50 border-border/50 focus:border-primary/50 resize-none"
                                />
                            </div>

                            {error && <p className="text-sm text-destructive">{error}</p>}

                            <Button type="submit" disabled={submitting} className="w-full">
                                {submitting ? 'Submitting…' : 'Submit'}
                            </Button>

                            <p className="text-center text-xs text-muted-foreground/40">
                                Once submitted, you won't be able to edit your submission.
                            </p>
                        </form>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
