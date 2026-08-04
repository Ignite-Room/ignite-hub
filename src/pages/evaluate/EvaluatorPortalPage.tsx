import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle2, ExternalLink, Github, FileText, LogOut, PartyPopper } from 'lucide-react';
import igniteLogo from '@/assets/ignite-logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
    verifyEvaluator, getStoredEvaluatorToken, storeEvaluatorToken, clearEvaluatorToken,
    useEvaluatorSubmissions, useEvaluatorProgress, useSaveScores,
    VerifyResponse, EvaluatorAssignment,
} from './evaluatorPortalApi';

function LandingForm({ onVerified, error }: { onVerified: (v: VerifyResponse) => void; error: string }) {
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');

    const submit = async () => {
        if (!code.trim()) return;
        setSubmitting(true);
        setLocalError('');
        try {
            const v = await verifyEvaluator({ code: code.trim().toUpperCase() });
            storeEvaluatorToken(v.accessToken);
            onVerified(v);
        } catch (e) {
            setLocalError(e instanceof Error ? e.message : 'Invalid code');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
            <div className="w-full max-w-sm text-center">
                <img src={igniteLogo} alt="Ignite Room" className="h-10 w-auto mx-auto mb-6" />
                <h1 className="text-xl font-bold mb-1">Evaluator Portal</h1>
                <p className="text-sm text-muted-foreground mb-6">Enter the access code your organizer shared with you.</p>
                <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    placeholder="ABC123"
                    maxLength={6}
                    className="text-center text-lg tracking-[0.3em] h-14 font-mono"
                />
                {(localError || error) && <p className="text-sm text-destructive mt-3">{localError || error}</p>}
                <Button className="w-full mt-4 h-12" onClick={submit} disabled={submitting || !code.trim()}>
                    {submitting ? 'Verifying...' : 'Continue'}
                </Button>
            </div>
        </div>
    );
}

function SubmissionCard({ assignment, criteria, onSaved }: {
    assignment: EvaluatorAssignment;
    criteria: { id: string; name: string; maxPoints: number }[];
    onSaved: () => void;
}) {
    const token = getStoredEvaluatorToken();
    const saveScores = useSaveScores(token);
    const [drafts, setDrafts] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        assignment.submission.scores.forEach(s => { initial[s.criterionId] = String(s.points); });
        return initial;
    });

    const invalid = criteria.some(c => {
        const v = drafts[c.id];
        if (v === undefined || v === '') return true;
        const n = Number(v);
        return Number.isNaN(n) || n < 0 || n > c.maxPoints;
    });

    const save = async () => {
        try {
            await saveScores.mutateAsync({
                assignmentId: assignment.id,
                scores: criteria.map(c => ({ criterionId: c.id, points: Number(drafts[c.id] || 0) })),
            });
            toast.success('Score saved');
            onSaved();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to save score');
        }
    };

    const { registration, repoUrl, liveUrl, fileUrl, notes } = assignment.submission;

    return (
        <AccordionItem value={assignment.id} className="border border-border/60 rounded-xl mb-3 px-4 bg-card/60 backdrop-blur-xl">
            <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2 text-left">
                    {assignment.isComplete && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    <div>
                        <p className="font-medium">{registration.teamName || registration.name}</p>
                        <p className="text-xs text-muted-foreground">{registration.name} · {registration.email}</p>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                        {repoUrl && <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline"><Github className="w-4 h-4" /> Repository</a>}
                        {liveUrl && <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline"><ExternalLink className="w-4 h-4" /> Live Demo</a>}
                        {fileUrl && <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline"><FileText className="w-4 h-4" /> Attachment</a>}
                    </div>
                    {notes && <p className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-3">{notes}</p>}

                    <div className="space-y-3">
                        {criteria.map(c => (
                            <div key={c.id} className="flex items-center justify-between gap-3">
                                <label className="text-sm font-medium">{c.name} <span className="text-muted-foreground">(max {c.maxPoints})</span></label>
                                <Input
                                    type="number" min={0} max={c.maxPoints} inputMode="numeric"
                                    value={drafts[c.id] ?? ''}
                                    onChange={(e) => setDrafts(prev => ({ ...prev, [c.id]: e.target.value }))}
                                    className="w-20 h-10 text-center"
                                />
                            </div>
                        ))}
                    </div>
                    <Button className="w-full h-11" onClick={save} disabled={invalid || saveScores.isPending}>
                        {saveScores.isPending ? 'Saving...' : 'Save Score'}
                    </Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

export default function EvaluatorPortalPage() {
    const [searchParams] = useSearchParams();
    const urlToken = searchParams.get('token');
    const [verified, setVerified] = useState<VerifyResponse | null>(null);
    const [error, setError] = useState('');
    const [checkingUrl, setCheckingUrl] = useState(!!urlToken || !!getStoredEvaluatorToken());
    const [openId, setOpenId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const existing = urlToken || getStoredEvaluatorToken();
        if (!existing) { setCheckingUrl(false); return; }
        verifyEvaluator({ token: existing })
            .then(v => { storeEvaluatorToken(v.accessToken); setVerified(v); })
            .catch(e => { clearEvaluatorToken(); setError(e instanceof Error ? e.message : 'Invalid or expired access link'); })
            .finally(() => setCheckingUrl(false));
    }, [urlToken]);

    const token = getStoredEvaluatorToken();
    const { data: submissionsData, isLoading: loadingSubmissions } = useEvaluatorSubmissions(verified ? token : null);
    const { data: progress } = useEvaluatorProgress(verified ? token : null);

    const sortedAssignments = useMemo(() => {
        if (!submissionsData) return [];
        return [...submissionsData.assignments].sort((a, b) => Number(a.isComplete) - Number(b.isComplete));
    }, [submissionsData]);

    const handleSaved = (savedId: string) => {
        const next = sortedAssignments.find(a => a.id !== savedId && !a.isComplete);
        setOpenId(next?.id);
    };

    if (checkingUrl) {
        return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
    }

    if (!verified) {
        return <LandingForm onVerified={setVerified} error={error} />;
    }

    const allDone = progress ? progress.pending === 0 && progress.total > 0 : false;

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl border-b border-border/50 px-4 py-3">
                <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="font-semibold truncate">{verified.eventTitle}</p>
                        <p className="text-xs text-muted-foreground truncate">{verified.roundName} · {verified.name}</p>
                    </div>
                    <button
                        onClick={() => { clearEvaluatorToken(); setVerified(null); }}
                        className="p-2 text-muted-foreground hover:text-foreground flex-shrink-0"
                        title="Sign out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
                {progress && (
                    <div className="max-w-lg mx-auto mt-2 flex items-center gap-2">
                        <Progress value={progress.total > 0 ? (progress.completed / progress.total) * 100 : 0} className="h-1.5" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{progress.completed} of {progress.total}</span>
                    </div>
                )}
            </header>

            <main className="max-w-lg mx-auto px-4 py-6">
                {loadingSubmissions ? (
                    <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : allDone ? (
                    <div className="text-center py-16">
                        <PartyPopper className="w-10 h-10 text-primary mx-auto mb-4" />
                        <h2 className="text-lg font-bold mb-1">All Done</h2>
                        <p className="text-sm text-muted-foreground">You graded {progress?.total} submission(s). Thank you.</p>
                    </div>
                ) : sortedAssignments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-16">No submissions assigned to you yet.</p>
                ) : (
                    <Accordion type="single" collapsible value={openId} onValueChange={setOpenId}>
                        {sortedAssignments.map(a => (
                            <SubmissionCard
                                key={a.id}
                                assignment={a}
                                criteria={submissionsData!.criteria}
                                onSaved={() => handleSaved(a.id)}
                            />
                        ))}
                    </Accordion>
                )}
            </main>
        </div>
    );
}
