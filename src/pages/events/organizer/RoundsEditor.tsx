import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Users, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { organizerFetch, EventRound } from './organizerApi';

const ROUND_TYPE_LABEL: Record<string, string> = {
    EVALUATION: 'Evaluation (scored)',
    SCREENING: 'Screening (pass/fail)',
};

function CriteriaEditor({ eventId, roundId, criteria, onChange }: {
    eventId: string; roundId: string; criteria: EventRound['criteria']; onChange: () => void;
}) {
    const [name, setName] = useState('');
    const [maxPoints, setMaxPoints] = useState('10');
    const [saving, setSaving] = useState(false);

    const addCriterion = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            await organizerFetch(`/${eventId}/rounds/${roundId}/criteria`, {
                method: 'POST',
                body: JSON.stringify({ name, maxPoints: parseInt(maxPoints, 10) || 10 }),
            });
            setName(''); setMaxPoints('10');
            onChange();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to add criterion');
        } finally {
            setSaving(false);
        }
    };

    const removeCriterion = async (criterionId: string) => {
        try {
            await organizerFetch(`/${eventId}/rounds/${roundId}/criteria/${criterionId}`, { method: 'DELETE' });
            onChange();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to remove criterion');
        }
    };

    return (
        <div className="mt-3 pl-3 border-l-2 border-border/40 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Scoring Criteria</p>
            {criteria.map(c => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                    <span>{c.name} <span className="text-muted-foreground">/ {c.maxPoints}</span></span>
                    <button onClick={() => removeCriterion(c.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            ))}
            <div className="flex gap-2">
                <Input placeholder="Criterion (e.g. Innovation)" value={name} onChange={e => setName(e.target.value)} className="bg-background/50 h-9 text-sm" />
                <Input placeholder="Max" type="number" min={1} value={maxPoints} onChange={e => setMaxPoints(e.target.value)} className="bg-background/50 h-9 w-20 text-sm" />
                <Button size="sm" variant="outline" onClick={addCriterion} disabled={saving || !name.trim()}>Add</Button>
            </div>
        </div>
    );
}

export default function RoundsEditor({ eventId, rounds, onChange }: { eventId: string; rounds: EventRound[]; onChange: () => void }) {
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [type, setType] = useState<'EVALUATION' | 'SCREENING'>('EVALUATION');
    const [allowFileUpload, setAllowFileUpload] = useState(false);
    const [allowLinks, setAllowLinks] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const handleAdd = async () => {
        setErr('');
        setSaving(true);
        try {
            await organizerFetch(`/${eventId}/rounds`, {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    description: description || undefined,
                    submissionDeadline: deadline ? new Date(deadline).toISOString() : undefined,
                    type,
                    allowFileUpload,
                    allowLinks,
                    order: rounds.length,
                }),
            });
            setName(''); setDescription(''); setDeadline(''); setType('EVALUATION'); setAllowFileUpload(false); setAllowLinks(true);
            setShowForm(false);
            onChange();
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Failed to add round');
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async (roundId: string) => {
        if (!confirm('Remove this round?')) return;
        try {
            await organizerFetch(`/${eventId}/rounds/${roundId}`, { method: 'DELETE' });
            onChange();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to remove round');
        }
    };

    return (
        <div className="space-y-4">
            {rounds.map(round => (
                <div key={round.id} className="p-4 rounded-lg bg-secondary/30 border border-border/40">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-medium">{round.name}</p>
                                <Badge variant="secondary" className="text-xs">{ROUND_TYPE_LABEL[round.type] ?? round.type}</Badge>
                            </div>
                            {round.submissionDeadline && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Deadline: {new Date(round.submissionDeadline).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {round.allowFileUpload ? 'File upload' : ''}{round.allowFileUpload && round.allowLinks ? ' + ' : ''}{round.allowLinks ? 'Links' : ''}
                                {round._count ? ` · ${round._count.submissions} submission(s)` : ''}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Button asChild size="sm" variant="outline">
                                <Link to={`/events/organizer/${eventId}/rounds/${round.id}`}>
                                    <Users className="w-3.5 h-3.5 mr-1" /> Submissions
                                </Link>
                            </Button>
                            {round.type === 'EVALUATION' && (
                                <Button asChild size="sm" variant="outline">
                                    <Link to={`/events/organizer/${eventId}/rounds/${round.id}/evaluators`}>
                                        <ClipboardCheck className="w-3.5 h-3.5 mr-1" /> Evaluators
                                    </Link>
                                </Button>
                            )}
                            {(!round._count || round._count.submissions === 0) && (
                                <button onClick={() => handleRemove(round.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    {round.type === 'EVALUATION' && (
                        <CriteriaEditor eventId={eventId} roundId={round.id} criteria={round.criteria} onChange={onChange} />
                    )}
                </div>
            ))}

            {showForm ? (
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/40 space-y-3">
                    {err && <p className="text-xs text-destructive">{err}</p>}
                    <Input placeholder="Round name (e.g. PPT Submission, Final Round)" value={name} onChange={e => setName(e.target.value)} className="bg-background/50 h-10" />
                    <Textarea placeholder="Instructions for participants (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="bg-background/50" />
                    <Input type="datetime-local" placeholder="Submission deadline" value={deadline} onChange={e => setDeadline(e.target.value)} className="bg-background/50 h-10" />
                    <Select value={type} onValueChange={(v) => setType(v as 'EVALUATION' | 'SCREENING')}>
                        <SelectTrigger className="bg-background/50 h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="EVALUATION">Evaluation - scored by criteria, supports evaluators</SelectItem>
                            <SelectItem value="SCREENING">Screening - pass/fail only, no scoring</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
                            <input type="checkbox" checked={allowLinks} onChange={e => setAllowLinks(e.target.checked)} /> Allow repo/live links
                        </label>
                        <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
                            <input type="checkbox" checked={allowFileUpload} onChange={e => setAllowFileUpload(e.target.checked)} /> Allow file upload
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleAdd} disabled={saving || !name.trim()}>{saving ? 'Saving...' : 'Save'}</Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                    </div>
                </div>
            ) : (
                <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(true)}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Round
                </Button>
            )}
        </div>
    );
}
