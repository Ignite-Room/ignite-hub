import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Copy, Shuffle, UserX, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useEvaluators, useAddEvaluators, useRemoveEvaluator, useAutoAssign, useEvaluatorProgress, evaluatorPortalUrl } from './evaluatorApi';
import { useNormalizeScores, useApplyNormalization, NormalizationResult } from './normalizationApi';

const addEvaluatorsSchema = z.object({
    evaluators: z.array(z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Enter a valid email'),
    })).min(1),
});
type AddEvaluatorsForm = z.infer<typeof addEvaluatorsSchema>;

function AddEvaluatorsDialog({ eventId, roundId }: { eventId: string; roundId: string }) {
    const [open, setOpen] = useState(false);
    const addEvaluators = useAddEvaluators(eventId, roundId);
    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<AddEvaluatorsForm>({
        resolver: zodResolver(addEvaluatorsSchema),
        defaultValues: { evaluators: [{ name: '', email: '' }] },
    });
    const { fields, append, remove } = useFieldArray({ control, name: 'evaluators' });

    const onSubmit = handleSubmit(async (data) => {
        try {
            await addEvaluators.mutateAsync(data.evaluators);
            toast.success(`Added ${data.evaluators.length} evaluator(s)`);
            reset({ evaluators: [{ name: '', email: '' }] });
            setOpen(false);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to add evaluators');
        }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1.5" /> Add Evaluators</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Evaluators</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-3">
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {fields.map((field, i) => (
                            <div key={field.id} className="flex items-start gap-2">
                                <div className="flex-1 space-y-1">
                                    <Input placeholder="Name" {...register(`evaluators.${i}.name`)} />
                                    {errors.evaluators?.[i]?.name && (
                                        <p className="text-xs text-destructive">{errors.evaluators[i]?.name?.message}</p>
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <Input placeholder="Email" type="email" {...register(`evaluators.${i}.email`)} />
                                    {errors.evaluators?.[i]?.email && (
                                        <p className="text-xs text-destructive">{errors.evaluators[i]?.email?.message}</p>
                                    )}
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="mt-0.5"
                                    disabled={fields.length === 1} onClick={() => remove(i)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', email: '' })}>
                        <Plus className="w-4 h-4 mr-1.5" /> Add another
                    </Button>
                    <DialogFooter>
                        <Button type="submit" disabled={addEvaluators.isPending}>
                            {addEvaluators.isPending ? 'Adding...' : 'Add Evaluators'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function NormalizeScoresDialog({ eventId, roundId }: { eventId: string; roundId: string }) {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState<NormalizationResult | null>(null);
    const [cutoff, setCutoff] = useState('70');
    const [action, setAction] = useState<'shortlist_above' | 'reject_below'>('shortlist_above');
    const normalize = useNormalizeScores(eventId, roundId);
    const apply = useApplyNormalization(eventId, roundId);

    const runNormalize = async () => {
        try {
            const res = await normalize.mutateAsync();
            setResult(res);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Normalization failed');
        }
    };

    const runApply = async () => {
        try {
            const res = await apply.mutateAsync({ cutoffScore: Number(cutoff), action });
            toast.success(`${action === 'shortlist_above' ? 'Shortlisted' : 'Rejected'} ${res.affected}/${res.total} submission(s)`);
            setOpen(false);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to apply');
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setResult(null); }}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Sparkles className="w-4 h-4 mr-1.5" /> Normalize Scores</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Normalize Scores</DialogTitle>
                </DialogHeader>

                {!result ? (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Runs an LLM-based z-score normalization across evaluators to correct for individual scoring
                            bias (harsh, lenient, or narrow-range graders), producing a single comparable 0-100 score
                            per submission.
                        </p>
                        <Button onClick={runNormalize} disabled={normalize.isPending}>
                            {normalize.isPending ? 'Normalizing...' : 'Run Normalization'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {result.overallBiasNote && (
                            <p className="text-sm text-muted-foreground p-3 rounded-lg bg-secondary/30 border border-border/40">{result.overallBiasNote}</p>
                        )}
                        <div className="rounded-xl border border-border/60 overflow-hidden overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Submission</TableHead>
                                        <TableHead>Raw %</TableHead>
                                        <TableHead>Normalized</TableHead>
                                        <TableHead>Note</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {result.review.map(r => (
                                        <TableRow key={r.submissionId}>
                                            <TableCell className="text-sm">{r.teamName || r.name}</TableCell>
                                            <TableCell className="text-sm">{r.rawPercent}%</TableCell>
                                            <TableCell className="text-sm font-medium">{r.normalizedScore ?? '-'}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground max-w-[200px]">{r.note}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex items-end gap-3 flex-wrap pt-2 border-t border-border/40">
                            <div className="space-y-1.5">
                                <Label>Action</Label>
                                <Select value={action} onValueChange={(v) => setAction(v as typeof action)}>
                                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="shortlist_above">Shortlist above cutoff</SelectItem>
                                        <SelectItem value="reject_below">Reject below cutoff</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Cutoff score</Label>
                                <Input type="number" min={0} max={100} value={cutoff} onChange={(e) => setCutoff(e.target.value)} className="w-24" />
                            </div>
                            <Button onClick={runApply} disabled={apply.isPending}>
                                {apply.isPending ? 'Applying...' : 'Apply & Shortlist'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default function EvaluatorsPage() {
    const { id: eventId, roundId } = useParams<{ id: string; roundId: string }>();
    const { data: evaluators, isLoading } = useEvaluators(eventId!, roundId!);
    const { data: progress } = useEvaluatorProgress(eventId!, roundId!);
    const removeEvaluator = useRemoveEvaluator(eventId!, roundId!);
    const autoAssign = useAutoAssign(eventId!, roundId!);

    const copyLink = (accessToken: string, accessCode: string) => {
        navigator.clipboard.writeText(evaluatorPortalUrl(accessToken));
        toast.success(`Link copied. Access code: ${accessCode}`);
    };

    const handleRemove = async (evaluatorId: string) => {
        try {
            await removeEvaluator.mutateAsync(evaluatorId);
            toast.success('Evaluator removed and their unscored work redistributed');
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to remove evaluator');
        }
    };

    const handleAutoAssign = async () => {
        try {
            const res = await autoAssign.mutateAsync();
            toast.success(`Assigned ${res.assigned} submission(s) across ${res.totalEvaluators} evaluator(s)`);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Auto-assign failed');
        }
    };

    if (!eventId || !roundId) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-28 pb-20 px-6 max-w-6xl mx-auto">
                <Link to={`/events/organizer/${eventId}/rounds/${roundId}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Round
                </Link>

                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Evaluators</h1>
                        <p className="text-sm text-muted-foreground">
                            {progress ? `${progress.totalScored} of ${progress.totalAssigned} submissions scored` : 'External mentors who grade this round'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" disabled={!evaluators || evaluators.length === 0}>
                                    <Shuffle className="w-4 h-4 mr-1.5" /> Auto-Assign
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Distribute submissions evenly?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This assigns every submitted (not-yet-assigned) submission in this round across
                                        your {evaluators?.length ?? 0} active evaluator(s), balanced by current workload.
                                        Already-assigned submissions are left untouched.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleAutoAssign}>Assign</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <NormalizeScoresDialog eventId={eventId} roundId={roundId} />
                        <AddEvaluatorsDialog eventId={eventId} roundId={roundId} />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : !evaluators || evaluators.length === 0 ? (
                    <p className="text-muted-foreground text-center py-10">No evaluators added yet.</p>
                ) : (
                    <div className="rounded-2xl border border-border/60 overflow-hidden overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Access Code</TableHead>
                                    <TableHead>Assigned</TableHead>
                                    <TableHead>Scored</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {evaluators.map(ev => (
                                    <TableRow key={ev.id}>
                                        <TableCell className="font-medium">{ev.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{ev.email}</TableCell>
                                        <TableCell><code className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded">{ev.accessCode}</code></TableCell>
                                        <TableCell>{ev.assignedCount}</TableCell>
                                        <TableCell>{ev.scoredCount}</TableCell>
                                        <TableCell className="w-32">
                                            <div className="flex items-center gap-2">
                                                <Progress value={ev.completionPercent} className="h-1.5 w-20" />
                                                <span className="text-xs text-muted-foreground w-8">{ev.completionPercent}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={ev.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-secondary text-muted-foreground'}>
                                                {ev.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <button onClick={() => copyLink(ev.accessToken, ev.accessCode)} className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors" title="Copy portal link">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleRemove(ev.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors" title="Remove evaluator">
                                                    <UserX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
