import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Upload, ExternalLink, Github, FileText, CheckCircle2, XCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    organizerFetch, organizerRoundExportUrl, OrganizerEvent, EventRound, RoundSubmission,
} from './organizerApi';

const STATUS_COLOR: Record<string, string> = {
    PENDING: 'bg-secondary text-muted-foreground',
    SUBMITTED: 'bg-sky-500/20 text-sky-400',
    SHORTLISTED: 'bg-emerald-500/20 text-emerald-400',
    REJECTED: 'bg-destructive/20 text-destructive',
};

function parseCsv(text: string): string[][] {
    return text
        .split(/\r?\n/)
        .filter(line => line.trim().length > 0)
        .map(line => line.split(',').map(cell => cell.trim()));
}

export default function OrganizerRoundSubmissionsPage() {
    const { id: eventId, roundId } = useParams<{ id: string; roundId: string }>();
    const [round, setRound] = useState<EventRound | null>(null);
    const [submissions, setSubmissions] = useState<RoundSubmission[]>([]);
    const [scoreDrafts, setScoreDrafts] = useState<Record<string, Record<string, string>>>({});
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [importSummary, setImportSummary] = useState('');

    const load = async () => {
        if (!eventId || !roundId) return;
        setLoading(true);
        setError('');
        try {
            const events = await organizerFetch<OrganizerEvent[]>('/');
            const event = events.find(e => e.id === eventId);
            const foundRound = event?.rounds.find(r => r.id === roundId);
            if (!foundRound) throw new Error('Round not found');
            setRound(foundRound);

            const subs = await organizerFetch<RoundSubmission[]>(`/${eventId}/rounds/${roundId}/submissions`);
            setSubmissions(subs);

            const drafts: Record<string, Record<string, string>> = {};
            subs.forEach(s => {
                drafts[s.id] = {};
                s.scores.forEach(sc => { drafts[s.id][sc.criterionId] = String(sc.points); });
            });
            setScoreDrafts(drafts);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [eventId, roundId]);

    const totalFor = (submissionId: string) => {
        const draft = scoreDrafts[submissionId] || {};
        return Object.values(draft).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0);
    };

    const saveScores = async (submissionId: string) => {
        if (!eventId || !roundId || !round) return;
        const draft = scoreDrafts[submissionId] || {};
        const scores = round.criteria.map(c => ({ criterionId: c.id, points: parseInt(draft[c.id], 10) || 0 }));
        try {
            await organizerFetch(`/${eventId}/rounds/${roundId}/submissions/${submissionId}/scores`, {
                method: 'PUT',
                body: JSON.stringify({ scores }),
            });
            load();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to save scores');
        }
    };

    const shortlist = async (submissionId: string) => {
        if (!eventId || !roundId) return;
        try {
            await organizerFetch(`/${eventId}/rounds/${roundId}/submissions/${submissionId}/shortlist`, { method: 'POST' });
            load();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to shortlist');
        }
    };

    const reject = async (submissionId: string) => {
        if (!eventId || !roundId) return;
        try {
            await organizerFetch(`/${eventId}/rounds/${roundId}/submissions/${submissionId}/reject`, { method: 'POST' });
            load();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to reject');
        }
    };

    const bulkShortlist = async () => {
        if (!eventId || !roundId || selected.size === 0) return;
        try {
            const res = await organizerFetch<{ shortlisted: number; total: number }>(`/${eventId}/rounds/${roundId}/shortlist-bulk`, {
                method: 'POST',
                body: JSON.stringify({ submissionIds: Array.from(selected) }),
            });
            setSelected(new Set());
            load();
            alert(`Shortlisted ${res.shortlisted}/${res.total}`);
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Bulk shortlist failed');
        }
    };

    const handleCsvImport = async (file: File) => {
        if (!eventId || !roundId || !round) return;
        setImportSummary('');
        try {
            const text = await file.text();
            const [header, ...dataRows] = parseCsv(text);
            const emailIdx = header.findIndex(h => h.toLowerCase() === 'email');
            if (emailIdx === -1) throw new Error('CSV must have an "email" column');

            const criterionCols = round.criteria.map(c => ({
                id: c.id,
                colIdx: header.findIndex(h => h.trim().toLowerCase() === c.name.trim().toLowerCase()),
            }));

            const rows = dataRows.map(row => ({
                email: row[emailIdx],
                scores: criterionCols.reduce<Record<string, number>>((acc, c) => {
                    if (c.colIdx !== -1 && row[c.colIdx]) acc[c.id] = parseInt(row[c.colIdx], 10) || 0;
                    return acc;
                }, {}),
            })).filter(r => r.email);

            const res = await organizerFetch<{ imported: number; failed: number; results: { email: string; ok: boolean; message?: string }[] }>(
                `/${eventId}/rounds/${roundId}/scores/bulk-import`,
                { method: 'POST', body: JSON.stringify({ rows }) },
            );
            const failedEmails = res.results.filter(r => !r.ok).map(r => `${r.email} (${r.message})`);
            setImportSummary(`Imported ${res.imported}/${rows.length}.${failedEmails.length ? ` Failed: ${failedEmails.join(', ')}` : ''}`);
            load();
        } catch (e) {
            setImportSummary(e instanceof Error ? e.message : 'CSV import failed');
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-28 pb-20 px-6 max-w-6xl mx-auto">
                <Link to={`/events/organizer/${eventId}/edit`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Event
                </Link>

                {error && <p className="text-destructive text-center py-10">{error}</p>}

                {round && (
                    <>
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">{round.name}: Submissions</h1>
                                <p className="text-sm text-muted-foreground">{submissions.length} submission(s)</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <label className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-border/50 bg-secondary/40 text-sm cursor-pointer hover:border-primary/40 transition-colors">
                                    <Upload className="w-4 h-4" /> Import Scores CSV
                                    <input type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvImport(f); e.target.value = ''; }} />
                                </label>
                                {eventId && roundId && (
                                    <a href={organizerRoundExportUrl(eventId, roundId)} target="_blank" rel="noopener noreferrer">
                                        <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-1.5" /> Export CSV</Button>
                                    </a>
                                )}
                                {selected.size > 0 && (
                                    <Button size="sm" onClick={bulkShortlist}>Shortlist Selected ({selected.size})</Button>
                                )}
                            </div>
                        </div>

                        {importSummary && (
                            <p className="text-xs text-muted-foreground mb-4 p-3 rounded-lg bg-secondary/30 border border-border/40">{importSummary}</p>
                        )}
                        <p className="text-xs text-muted-foreground mb-4">
                            CSV format: a header row with an <code>email</code> column plus one column per criterion name ({round.criteria.map(c => c.name).join(', ') || 'no criteria defined yet'}).
                        </p>

                        {submissions.length === 0 ? (
                            <p className="text-muted-foreground text-center py-10">No submissions yet.</p>
                        ) : (
                            <div className="rounded-2xl border border-border/60 overflow-hidden overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-8"></TableHead>
                                            <TableHead>Registrant</TableHead>
                                            <TableHead>Links / File</TableHead>
                                            {round.criteria.map(c => <TableHead key={c.id}>{c.name} (/{c.maxPoints})</TableHead>)}
                                            <TableHead>Total</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {submissions.map(s => (
                                            <TableRow key={s.id}>
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.has(s.id)}
                                                        onChange={(e) => {
                                                            const next = new Set(selected);
                                                            if (e.target.checked) next.add(s.id); else next.delete(s.id);
                                                            setSelected(next);
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <p className="font-medium">{s.registration.name}</p>
                                                    <p className="text-xs text-muted-foreground">{s.registration.email}{s.registration.teamName ? ` · ${s.registration.teamName}` : ''}</p>
                                                </TableCell>
                                                <TableCell className="space-y-1">
                                                    {s.repoUrl && <a href={s.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline"><Github className="w-3 h-3" /> Repo</a>}
                                                    {s.liveUrl && <a href={s.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline"><ExternalLink className="w-3 h-3" /> Live</a>}
                                                    {s.fileUrl && <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline"><FileText className="w-3 h-3" /> File</a>}
                                                </TableCell>
                                                {round.criteria.map(c => (
                                                    <TableCell key={c.id}>
                                                        <Input
                                                            type="number" min={0} max={c.maxPoints}
                                                            value={scoreDrafts[s.id]?.[c.id] ?? ''}
                                                            onChange={(e) => setScoreDrafts(prev => ({ ...prev, [s.id]: { ...prev[s.id], [c.id]: e.target.value } }))}
                                                            onBlur={() => saveScores(s.id)}
                                                            className="w-16 h-8 bg-background/50"
                                                        />
                                                    </TableCell>
                                                ))}
                                                <TableCell className="font-medium">{totalFor(s.id)}</TableCell>
                                                <TableCell><Badge className={STATUS_COLOR[s.status]}>{s.status}</Badge></TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {s.status !== 'SHORTLISTED' && (
                                                            <button onClick={() => shortlist(s.id)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors" title="Shortlist">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {s.status !== 'REJECTED' && (
                                                            <button onClick={() => reject(s.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors" title="Reject">
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
