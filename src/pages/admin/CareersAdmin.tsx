import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Bell, Briefcase, CalendarClock, CheckCircle2, ChevronDown, Clock, Download, ExternalLink,
    FileText, Loader2, Mail, MapPin, Pencil, Plus, Search, Send, Trash2, UserCheck, UserX, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function authHeader() {
    const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function adminFetch(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_URL}/admin/careers/${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
    }
    return res.json();
}

// Generic authenticated JSON fetch for /api/admin/* endpoints outside careers/.
// Throws on non-2xx so callers never set state to an error object.
async function apiFetch(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.message || `HTTP ${res.status}`);
    return body;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type JobType = 'INTERNSHIP' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
type AppStatus = 'PENDING' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'HIRED' | 'REJECTED';
type InviteStatus = 'INVITED' | 'SUBMITTED' | 'PASSED' | 'FAILED';

interface Role {
    id: string; slug: string; title: string; type: JobType; location: string;
    description: string; requirements: string; skills: string[];
    isOpen: boolean; deadline: string | null; createdAt: string;
    _count?: { applications: number };
}

interface Application {
    id: string; roleId: string; name: string; email: string; phone: string;
    college: string; yearOfStudy: string | null; githubUrl: string | null;
    portfolioUrl: string | null; projectUrl: string | null; coverLetter: string;
    resumeUrl: string; status: AppStatus; adminNote: string | null;
    reviewedAt: string | null; createdAt: string;
    role: { title: string; slug: string; type: JobType };
}

interface Challenge {
    id: string; roleId: string | null; title: string; description: string;
    deadline: string | null; createdAt: string;
    role: { title: string; slug: string } | null;
    _count: { invites: number };
    inviteStats: { INVITED: number; SUBMITTED: number; PASSED: number; FAILED: number };
}

interface ChallengeInvite {
    id: string; token: string; status: InviteStatus;
    sentAt: string; submittedAt: string | null;
    repoUrl: string | null; liveUrl: string | null; notes: string | null;
    adminNote: string | null; reviewedAt: string | null;
    application: { id: string; name: string; email: string; phone: string; college: string; yearOfStudy: string | null };
}

type InterviewInviteStatus = 'INVITED' | 'SCHEDULED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';

interface InterviewSlot { id: string; startTime: string; capacity: number }

interface Interview {
    id: string; roleId: string | null; title: string; description: string | null;
    location: string | null; durationMinutes: number; createdAt: string;
    role: { title: string; slug: string } | null;
    slots?: InterviewSlot[];
    _count: { invites: number; slots: number };
    inviteStats: { INVITED: number; SCHEDULED: number; COMPLETED: number; NO_SHOW: number; CANCELLED: number };
}

interface InterviewInvite {
    id: string; token: string; status: InterviewInviteStatus;
    sentAt: string; scheduledAt: string | null; cancelledAt: string | null;
    slot: InterviewSlot | null;
    application: { id: string; name: string; email: string; phone: string; college: string; yearOfStudy: string | null };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<JobType, string> = {
    INTERNSHIP: 'Internship', FULL_TIME: 'Full-time', PART_TIME: 'Part-time', CONTRACT: 'Contract',
};

const STATUS_META: Record<AppStatus, { label: string; color: string }> = {
    PENDING:              { label: 'Pending',             color: 'bg-secondary text-muted-foreground' },
    UNDER_REVIEW:         { label: 'Under Review',        color: 'bg-sky-500/10 text-sky-400' },
    SHORTLISTED:          { label: 'Shortlisted',         color: 'bg-amber-500/10 text-orange-400' },
    INTERVIEW_SCHEDULED:  { label: 'Interview Scheduled', color: 'bg-violet-500/10 text-violet-400' },
    OFFERED:              { label: 'Offered',             color: 'bg-emerald-500/10 text-emerald-400' },
    HIRED:                { label: 'Hired',               color: 'bg-emerald-600/10 text-emerald-300' },
    REJECTED:             { label: 'Rejected',            color: 'bg-destructive/10 text-destructive' },
};

const BLANK_ROLE_FORM = {
    title: '', type: 'INTERNSHIP' as JobType, location: '',
    description: '', requirements: '', skills: '',
    isOpen: true, deadline: '',
};

// Convert UTC ISO to "YYYY-MM-DDTHH:MM" in IST for datetime-local input
function toISTLocal(iso: string): string {
    const ist = new Date(new Date(iso).getTime() + 330 * 60 * 1000);
    return ist.toISOString().slice(0, 16);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AppStatus }) {
    const { label, color } = STATUS_META[status];
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>{label}</span>;
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
    useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed right-4 top-4 z-[60] flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground shadow-xl"
        >
            <CheckCircle2 className="h-4 w-4 text-primary" /> {msg}
        </motion.div>
    );
}

// ─── Role Modal ───────────────────────────────────────────────────────────────

function RoleModal({
    initial,
    onClose,
    onSave,
}: {
    initial?: Role;
    onClose: () => void;
    onSave: (role: Role) => void;
}) {
    const [form, setForm] = useState(
        initial
            ? { ...initial, skills: initial.skills.join(', '), deadline: initial.deadline ? toISTLocal(initial.deadline) : '' }
            : BLANK_ROLE_FORM
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const payload = {
                ...form,
                deadline: form.deadline ? `${form.deadline}:00+05:30` : '',
            };
            let saved: Role;
            if (initial) {
                saved = await adminFetch(`roles/${initial.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
            } else {
                saved = await adminFetch('roles', { method: 'POST', body: JSON.stringify(payload) });
            }
            onSave(saved);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-md p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold text-foreground">
                        {initial ? 'Edit Role' : 'Create New Role'}
                    </h2>
                    <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Label className="mb-1.5 block text-sm text-muted-foreground">Role Title</Label>
                            <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. App Developer Intern" required className="bg-secondary/50 border-border/50 focus:border-primary/50 h-10" />
                        </div>
                        <div>
                            <Label className="mb-1.5 block text-sm text-muted-foreground">Type</Label>
                            <Select value={form.type} onValueChange={(v) => set('type', v)}>
                                <SelectTrigger className="h-10 bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="mb-1.5 block text-sm text-muted-foreground">Location</Label>
                            <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Remote / Mumbai / Hybrid" required className="bg-secondary/50 border-border/50 focus:border-primary/50 h-10" />
                        </div>
                        <div>
                            <Label className="mb-1.5 block text-sm text-muted-foreground">Application Deadline <span className="text-muted-foreground/50">(IST, optional)</span></Label>
                            <Input type="datetime-local" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} className="bg-secondary/50 border-border/50 focus:border-primary/50 h-10" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Label className="text-sm text-muted-foreground">Open for Applications</Label>
                            <button
                                type="button"
                                onClick={() => set('isOpen', !form.isOpen)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isOpen ? 'bg-primary' : 'bg-secondary'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div>
                            <Label className="mb-1.5 block text-sm text-muted-foreground">Skills <span className="text-muted-foreground/50">(comma-separated)</span></Label>
                            <Input value={form.skills} onChange={(e) => set('skills', e.target.value)} placeholder="Flutter, React Native, iOS" className="bg-secondary/50 border-border/50 focus:border-primary/50 h-10" />
                        </div>
                        <div className="sm:col-span-2">
                            <Label className="mb-1.5 block text-sm text-muted-foreground">Description</Label>
                            <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={5} placeholder="What will this person do? What's the context?" required className="resize-none bg-secondary/50 border-border/50 focus:border-primary/50" />
                        </div>
                        <div className="sm:col-span-2">
                            <Label className="mb-1.5 block text-sm text-muted-foreground">Requirements</Label>
                            <Textarea value={form.requirements} onChange={(e) => set('requirements', e.target.value)} rows={5} placeholder="What experience / skills are needed?" required className="resize-none bg-secondary/50 border-border/50 focus:border-primary/50" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (initial ? 'Save Changes' : 'Create Role')}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}


// ─── Application Review Panel ─────────────────────────────────────────────────

function ReviewPanel({ app, onClose, onUpdate, onDelete }: {
    app: Application; onClose: () => void;
    onUpdate: (a: Application) => void;
    onDelete: (id: string) => void;
}) {
    const [status, setStatus] = useState<AppStatus>(app.status);
    const [note, setNote] = useState(app.adminNote || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [emailSending, setEmailSending] = useState<'shortlist' | 'rejection' | null>(null);
    const [emailSent, setEmailSent] = useState<'shortlist' | 'rejection' | null>(null);
    const [emailError, setEmailError] = useState('');
    const [deleteConfirmLocal, setDeleteConfirmLocal] = useState(false);
    const handleDownload = async () => {
        try {
            const r = await fetch(app.resumeUrl);
            const blob = await r.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${app.name.replace(/\s+/g, '_')}_resume.pdf`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch {
            window.open(app.resumeUrl, '_blank');
        }
    };

    const handleSendEmail = async (type: 'shortlist' | 'rejection') => {
        setEmailSending(type);
        setEmailError('');
        try {
            await adminFetch(`applications/${app.id}/send-email`, {
                method: 'POST',
                body: JSON.stringify({ type }),
            });
            setEmailSent(type);
        } catch (e) {
            setEmailError(e instanceof Error ? e.message : 'Failed to send email');
        } finally {
            setEmailSending(null);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const updated = await adminFetch(`applications/${app.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status, adminNote: note }),
            });
            onUpdate(updated);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60" onClick={onClose}>
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                className="glass-card h-full w-full max-w-md overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-card/80 px-5 py-4 backdrop-blur-sm">
                    <div>
                        <p className="font-heading font-semibold text-foreground">{app.name}</p>
                        <p className="text-xs text-muted-foreground">{app.role.title}</p>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-6 p-5">
                    {/* Contact */}
                    <section>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Applicant</h3>
                        <div className="space-y-2 rounded-md border border-border/40 bg-secondary/20 overflow-hidden">
                            {[
                                { label: 'Email', value: app.email },
                                { label: 'Phone', value: app.phone },
                                { label: 'College', value: app.college },
                                { label: 'Year', value: app.yearOfStudy || '-' },
                                { label: 'Applied', value: new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                            ].map((r) => (
                                <div key={r.label} className="flex items-center justify-between border-b border-border/20 px-4 py-2.5 last:border-0">
                                    <span className="text-xs text-muted-foreground">{r.label}</span>
                                    <span className="text-sm text-foreground">{r.value}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Links */}
                    {(app.githubUrl || app.portfolioUrl || app.projectUrl) && (
                        <section>
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Links</h3>
                            <div className="flex flex-wrap gap-2">
                                {app.githubUrl && (
                                    <a href={app.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                        GitHub <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                                {app.portfolioUrl && (
                                    <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                        Portfolio <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                                {app.projectUrl && (
                                    <a href={app.projectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20 transition-colors">
                                        Best Project <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Cover letter */}
                    <section>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Their words</h3>
                        <div className="rounded-md border border-border/40 bg-secondary/20 p-4 text-sm leading-7 text-muted-foreground whitespace-pre-wrap">
                            {app.coverLetter}
                        </div>
                    </section>

                    {/* Resume */}
                    <section>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Resume</h3>
                        <div className="overflow-hidden rounded-md border border-border/40 bg-secondary/10" style={{ height: '420px' }}>
                            <iframe src={app.resumeUrl} title="Resume" className="h-full w-full" />
                        </div>
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => window.open(app.resumeUrl, '_blank')}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border/50 bg-secondary/40 px-3 py-2 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                            >
                                <ExternalLink className="h-4 w-4 text-primary" /> Open in tab
                            </button>
                            <button
                                onClick={handleDownload}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border/50 bg-secondary/40 px-3 py-2 text-sm font-medium text-foreground hover:border-border hover:bg-secondary/60 transition-colors"
                            >
                                <Download className="h-4 w-4" /> Download
                            </button>
                        </div>
                    </section>

                    <div className="h-px bg-border/40" />

                    {/* Status update */}
                    <section>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Decision</h3>
                        <div className="space-y-3">
                            <div>
                                <Label className="mb-1.5 block text-sm text-muted-foreground">Status</Label>
                                <Select value={status} onValueChange={(v) => setStatus(v as AppStatus)}>
                                    <SelectTrigger className="h-10 bg-secondary/50 border-border/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(STATUS_META).map(([k, { label }]) => (
                                            <SelectItem key={k} value={k}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="mb-1.5 block text-sm text-muted-foreground">Internal note <span className="text-muted-foreground/50">(not shared)</span></Label>
                                <Textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={3}
                                    placeholder="Notes for the team..."
                                    className="resize-none bg-secondary/50 border-border/50 focus:border-primary/50 text-sm"
                                />
                            </div>
                            {error && <p className="text-xs text-destructive">{error}</p>}
                            <Button onClick={handleSave} disabled={saving} className="w-full">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                            </Button>
                        </div>
                    </section>

                    <div className="h-px bg-border/40" />

                    {/* Notify Candidate */}
                    <section>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Notify Candidate</h3>
                        {emailSent ? (
                            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                {emailSent === 'shortlist' ? 'Shortlist email sent to candidate.' : 'Rejection email sent to candidate.'}
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSendEmail('shortlist')}
                                    disabled={!!emailSending}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {emailSending === 'shortlist' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                                    Shortlist
                                </button>
                                <button
                                    onClick={() => handleSendEmail('rejection')}
                                    disabled={!!emailSending}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {emailSending === 'rejection' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
                                    Reject
                                </button>
                            </div>
                        )}
                        {emailError && <p className="mt-2 text-xs text-destructive">{emailError}</p>}
                        <p className="mt-2 text-xs text-muted-foreground/40">Sends an email directly to {app.email}</p>
                    </section>

                    <div className="h-px bg-border/40" />

                    {/* Delete */}
                    <section className="pb-2">
                        {!deleteConfirmLocal ? (
                            <button
                                onClick={() => setDeleteConfirmLocal(true)}
                                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/40 hover:text-destructive transition-colors"
                            >
                                <Trash2 className="h-3.5 w-3.5" /> Delete this application
                            </button>
                        ) : (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                                <p className="mb-3 text-sm text-muted-foreground">This will permanently delete the application. Cannot be undone.</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onDelete(app.id)}
                                        className="flex-1 rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-white hover:bg-destructive/90 transition-colors"
                                    >
                                        Yes, delete
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirmLocal(false)}
                                        className="flex-1 rounded-md border border-border/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'roles' | 'applications' | 'challenges' | 'interviews';

export default function CareersAdmin() {
    const [tab, setTab] = useState<Tab>('roles');
    const [roles, setRoles] = useState<Role[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [appTotal, setAppTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');
    const [roleModal, setRoleModal] = useState<{ open: boolean; role?: Role }>({ open: false });
    const [reviewApp, setReviewApp] = useState<Application | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [filter, setFilter] = useState({ roleId: '', status: '', search: '' });
    const [appPage, setAppPage] = useState(1);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [challengeModal, setChallengeModal] = useState<{ open: boolean; challenge?: Challenge }>({ open: false });
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [challengeInvites, setChallengeInvites] = useState<ChallengeInvite[]>([]);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [sendingChallenge, setSendingChallenge] = useState(false);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [interviewModal, setInterviewModal] = useState<{ open: boolean; interview?: Interview }>({ open: false });
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [interviewInvites, setInterviewInvites] = useState<InterviewInvite[]>([]);
    const [interviewInviteLoading, setInterviewInviteLoading] = useState(false);
    const [addCandidatesOpen, setAddCandidatesOpen] = useState(false);
    const [sendingReminder, setSendingReminder] = useState(false);

    const showToast = (msg: string) => { setToast(msg); };

    const loadRoles = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminFetch('roles');
            setRoles(data);
        } catch (e) {
            showToast('Failed to load roles');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadApplications = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter.roleId) params.set('roleId', filter.roleId);
            if (filter.status) params.set('status', filter.status);
            if (filter.search) params.set('search', filter.search);
            params.set('page', String(appPage));
            const data = await adminFetch(`applications?${params}`);
            setApplications(data.applications);
            setAppTotal(data.total);
        } catch {
            showToast('Failed to load applications');
        } finally {
            setLoading(false);
        }
    }, [filter, appPage]);

    useEffect(() => { if (tab === 'roles') loadRoles(); }, [tab, loadRoles]);
    useEffect(() => { if (tab === 'applications') loadApplications(); }, [tab, loadApplications]);

    const handleToggleOpen = async (role: Role) => {
        try {
            const updated = await adminFetch(`roles/${role.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ isOpen: !role.isOpen }),
            });
            setRoles((prev) => prev.map((r) => (r.id === role.id ? { ...r, ...updated } : r)));
            showToast(updated.isOpen ? 'Role opened' : 'Role closed');
        } catch {
            showToast('Failed to update role');
        }
    };

    const handleDeleteRole = async (id: string) => {
        try {
            await adminFetch(`roles/${id}`, { method: 'DELETE' });
            setRoles((prev) => prev.filter((r) => r.id !== id));
            setDeleteConfirm(null);
            showToast('Role deleted');
        } catch {
            showToast('Failed to delete role');
        }
    };

    const handleRoleSaved = (saved: Role) => {
        if (roleModal.role) {
            setRoles((prev) => prev.map((r) => (r.id === saved.id ? { ...saved, _count: r._count } : r)));
            showToast('Role updated');
        } else {
            setRoles((prev) => [{ ...saved, _count: { applications: 0 } }, ...prev]);
            showToast('Role created');
        }
        setRoleModal({ open: false });
    };

    const handleAppUpdate = (updated: Application) => {
        setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        if (reviewApp?.id === updated.id) setReviewApp(updated);
        showToast('Application updated');
    };

    const handleDeleteApp = async (id: string) => {
        try {
            await adminFetch(`applications/${id}`, { method: 'DELETE' });
            setApplications((prev) => prev.filter((a) => a.id !== id));
            setAppTotal((t) => t - 1);
            setReviewApp(null);
            showToast('Application deleted');
        } catch {
            showToast('Failed to delete application');
        }
    };

    const handleExportCSV = async () => {
        try {
            const params = new URLSearchParams();
            if (filter.roleId) params.set('roleId', filter.roleId);
            if (filter.status) params.set('status', filter.status);
            const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
            const r = await fetch(`${API_URL}/admin/careers/applications/export-csv?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!r.ok) throw new Error('Export failed');
            const blob = await r.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `applications_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            showToast('Failed to export CSV');
        }
    };

    const loadChallenges = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/admin/challenges');
            setChallenges(Array.isArray(data) ? data : []);
        } catch { showToast('Failed to load challenges'); }
        finally { setLoading(false); }
    }, []);

    const loadChallengeInvites = async (challengeId: string) => {
        setInviteLoading(true);
        try {
            const data = await apiFetch(`/admin/challenges/${challengeId}/invites`);
            setChallengeInvites(Array.isArray(data) ? data : []);
        } catch { showToast('Failed to load submissions'); setChallengeInvites([]); }
        finally { setInviteLoading(false); }
    };

    const handleSelectChallenge = (c: Challenge) => {
        setSelectedChallenge(c);
        loadChallengeInvites(c.id);
    };

    const handleSendChallenge = async (challengeId: string) => {
        setSendingChallenge(true);
        try {
            const res = await apiFetch(`/admin/challenges/${challengeId}/send`, { method: 'POST' });
            if (res.sent === 0) { showToast(res.message || 'No new candidates to send to'); }
            else { showToast(`Challenge sent to ${res.sent} candidate${res.sent !== 1 ? 's' : ''}`); }
            loadChallenges();
            if (selectedChallenge?.id === challengeId) loadChallengeInvites(challengeId);
        } catch (e) { showToast(e instanceof Error ? e.message : 'Failed to send challenge'); }
        finally { setSendingChallenge(false); }
    };

    const handleReviewInvite = async (challengeId: string, inviteId: string, status: 'PASSED' | 'FAILED', adminNote: string) => {
        try {
            const updated = await apiFetch(`/admin/challenges/${challengeId}/invites/${inviteId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status, adminNote }),
            });
            setChallengeInvites((prev) => prev.map((i) => (i.id === inviteId ? updated : i)));
            showToast(status === 'PASSED' ? 'Marked as passed' : 'Marked as failed');
        } catch (e) { showToast(e instanceof Error ? e.message : 'Failed to update'); }
    };

    const handleDeleteChallenge = async (id: string) => {
        try {
            await fetch(`${API_URL}/admin/challenges/${id}`, { method: 'DELETE', headers: { ...authHeader() } });
            setChallenges((prev) => prev.filter((c) => c.id !== id));
            if (selectedChallenge?.id === id) setSelectedChallenge(null);
            showToast('Challenge deleted');
        } catch { showToast('Failed to delete challenge'); }
    };

    useEffect(() => { if (tab === 'challenges') loadChallenges(); }, [tab, loadChallenges]);

    const loadInterviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/admin/interviews');
            setInterviews(Array.isArray(data) ? data : []);
        } catch { showToast('Failed to load interviews'); }
        finally { setLoading(false); }
    }, []);

    const loadInterviewInvites = async (interviewId: string) => {
        setInterviewInviteLoading(true);
        try {
            const data = await apiFetch(`/admin/interviews/${interviewId}/invites`);
            setInterviewInvites(Array.isArray(data) ? data : []);
        } catch { showToast('Failed to load candidates'); setInterviewInvites([]); }
        finally { setInterviewInviteLoading(false); }
    };

    const handleSelectInterview = async (iv: Interview) => {
        try {
            const full = await apiFetch(`/admin/interviews/${iv.id}`);
            setSelectedInterview({ ...iv, slots: Array.isArray(full.slots) ? full.slots : [] });
        } catch {
            showToast('Failed to load interview details');
            setSelectedInterview({ ...iv, slots: [] });
        }
        loadInterviewInvites(iv.id);
    };

    const handleDeleteInterview = async (id: string) => {
        try {
            await apiFetch(`/admin/interviews/${id}`, { method: 'DELETE' });
            setInterviews((prev) => prev.filter((i) => i.id !== id));
            if (selectedInterview?.id === id) setSelectedInterview(null);
            showToast('Interview deleted');
        } catch (e) { showToast(e instanceof Error ? e.message : 'Failed to delete interview'); }
    };

    const handleAddCandidates = async (applicationIds: string[]) => {
        if (!selectedInterview) return;
        try {
            const res = await apiFetch(`/admin/interviews/${selectedInterview.id}/invites`, {
                method: 'POST',
                body: JSON.stringify({ applicationIds }),
            });
            if (res.sent === 0 && res.total === 0) showToast(res.message || 'No new candidates added');
            else showToast(`Invited ${res.sent}/${res.total} candidate${res.total !== 1 ? 's' : ''}`);
            loadInterviewInvites(selectedInterview.id);
            loadInterviews();
        } catch (e) { showToast(e instanceof Error ? e.message : 'Failed to add candidates'); }
    };

    const handleRemindInterview = async (interviewId: string) => {
        setSendingReminder(true);
        try {
            const res = await apiFetch(`/admin/interviews/${interviewId}/remind`, { method: 'POST' });
            if (res.sent === 0 && res.total === 0) showToast(res.message || 'No one left to remind');
            else showToast(`Reminder sent to ${res.sent}/${res.total} candidate${res.total !== 1 ? 's' : ''}`);
        } catch (e) { showToast(e instanceof Error ? e.message : 'Failed to send reminders'); }
        finally { setSendingReminder(false); }
    };

    const handleReviewInterviewInvite = async (interviewId: string, inviteId: string, status: 'COMPLETED' | 'NO_SHOW' | 'CANCELLED') => {
        try {
            const updated = await apiFetch(`/admin/interviews/${interviewId}/invites/${inviteId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
            setInterviewInvites((prev) => prev.map((i) => (i.id === inviteId ? updated : i)));
            showToast('Updated');
        } catch (e) { showToast(e instanceof Error ? e.message : 'Failed to update'); }
    };

    useEffect(() => { if (tab === 'interviews') loadInterviews(); }, [tab, loadInterviews]);

    const totalOpen = roles.filter((r) => r.isOpen).length;
    const totalApps = roles.reduce((s, r) => s + (r._count?.applications ?? 0), 0);
    const pendingInviteCount = interviewInvites.filter((i) => i.status === 'INVITED').length;

    return (
        <>
            {/* Toast */}
            <AnimatePresence>
                {toast && <Toast msg={toast} onDone={() => setToast('')} />}
            </AnimatePresence>

            {/* Role modal */}
            <AnimatePresence>
                {roleModal.open && (
                    <RoleModal
                        initial={roleModal.role}
                        onClose={() => setRoleModal({ open: false })}
                        onSave={handleRoleSaved}
                    />
                )}
            </AnimatePresence>

            {/* Delete confirm */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setDeleteConfirm(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="glass-card w-full max-w-sm rounded-md p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="font-heading text-base font-semibold text-foreground mb-2">Delete this role?</h3>
                            <p className="text-sm text-muted-foreground mb-5">This will permanently delete the role and all its applications. This cannot be undone.</p>
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                                <Button variant="destructive" className="flex-1" onClick={() => handleDeleteRole(deleteConfirm)}>Delete</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Review panel */}
            <AnimatePresence>
                {reviewApp && (
                    <ReviewPanel
                        app={reviewApp}
                        onClose={() => setReviewApp(null)}
                        onUpdate={handleAppUpdate}
                        onDelete={handleDeleteApp}
                    />
                )}
            </AnimatePresence>

            <AdminLayout title="Careers" breadcrumb={['Admin', 'Careers']}>
                {/* Stats row */}
                <div className="info-section mb-8 grid grid-cols-3 divide-x divide-border/60">
                    {[
                        { label: 'Total Roles', value: roles.length },
                        { label: 'Open', value: totalOpen },
                        { label: 'Total Applications', value: totalApps },
                    ].map((s) => (
                        <div key={s.label} className="info-block p-5 text-center">
                            <p className="font-heading text-2xl font-bold text-gradient">{s.value}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tab bar */}
                <div className="mb-6 flex gap-1 rounded-md border border-border/40 bg-secondary/30 p-1">
                    {(['roles', 'applications', 'challenges', 'interviews'] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium capitalize transition-all ${
                                tab === t ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {t === 'roles' ? <Briefcase className="h-4 w-4" /> : t === 'applications' ? <FileText className="h-4 w-4" /> : t === 'challenges' ? <Mail className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
                            {t === 'roles' ? 'Roles' : t === 'applications' ? 'Applications' : t === 'challenges' ? 'Challenges' : 'Interviews'}
                            {t === 'applications' && appTotal > 0 && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{appTotal}</span>
                            )}
                            {t === 'challenges' && challenges.length > 0 && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{challenges.length}</span>
                            )}
                            {t === 'interviews' && interviews.length > 0 && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{interviews.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Roles tab ─────────────────────────────────────────────── */}
                {tab === 'roles' && (
                    <div>
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="font-heading text-base font-semibold text-foreground">All Roles</h2>
                            <Button size="sm" onClick={() => setRoleModal({ open: true })}>
                                <Plus className="h-4 w-4" /> New Role
                            </Button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                        ) : roles.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-20 text-center">
                                <Briefcase className="h-10 w-10 text-muted-foreground/30" />
                                <p className="text-sm text-muted-foreground">No roles yet. Create one to get started.</p>
                                <Button size="sm" variant="outline" onClick={() => setRoleModal({ open: true })}>
                                    <Plus className="h-4 w-4" /> Create Role
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-md border border-border/50">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border/50 bg-secondary/30">
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                                            <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Type</th>
                                            <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Location</th>
                                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Apps</th>
                                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.map((role) => (
                                            <tr key={role.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/20 transition-colors">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-foreground">{role.title}</p>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">/careers/{role.slug}</p>
                                                </td>
                                                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{TYPE_LABEL[role.type]}</td>
                                                <td className="hidden px-4 py-3 md:table-cell">
                                                    <span className="flex items-center gap-1 text-muted-foreground">
                                                        <MapPin className="h-3 w-3" /> {role.location}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center text-muted-foreground">
                                                    {role._count?.applications ?? 0}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => handleToggleOpen(role)}
                                                        className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${
                                                            role.isOpen
                                                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                                                : 'bg-secondary text-muted-foreground hover:bg-secondary/70'
                                                        }`}
                                                    >
                                                        {role.isOpen ? 'Open' : 'Closed'}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            onClick={() => setRoleModal({ open: true, role })}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() => setDeleteConfirm(role.id)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <a
                                                            href={`/careers/${role.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Applications tab ──────────────────────────────────────── */}
                {tab === 'applications' && (
                    <div>
                        {/* Filters */}
                        <div className="mb-5 flex flex-wrap items-center gap-3">
                            <div className="relative flex-1 min-w-[180px]">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, college…"
                                    className="h-10 pl-9 bg-secondary/50 border-border/50"
                                    value={filter.search}
                                    onChange={(e) => setFilter((p) => ({ ...p, search: e.target.value }))}
                                />
                            </div>
                            <Select value={filter.roleId || 'all'} onValueChange={(v) => setFilter((p) => ({ ...p, roleId: v === 'all' ? '' : v }))}>
                                <SelectTrigger className="h-10 w-44 bg-secondary/50 border-border/50">
                                    <SelectValue placeholder="All roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All roles</SelectItem>
                                    {roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={filter.status || 'all'} onValueChange={(v) => setFilter((p) => ({ ...p, status: v === 'all' ? '' : v }))}>
                                <SelectTrigger className="h-10 w-44 bg-secondary/50 border-border/50">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    {Object.entries(STATUS_META).map(([k, { label }]) => (
                                        <SelectItem key={k} value={k}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <button
                                onClick={handleExportCSV}
                                className="ml-auto inline-flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/40 px-3 py-2 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground transition-colors"
                            >
                                <Download className="h-4 w-4" /> Export CSV
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                        ) : applications.length === 0 ? (
                            <div className="py-20 text-center text-sm text-muted-foreground">No applications found.</div>
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-md border border-border/50">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/50 bg-secondary/30">
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Applicant</th>
                                                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Role</th>
                                                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Applied</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Review</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applications.map((app) => (
                                                <tr
                                                    key={app.id}
                                                    className="border-b border-border/30 last:border-0 hover:bg-secondary/20 transition-colors cursor-pointer"
                                                    onClick={() => setReviewApp(app)}
                                                >
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-foreground">{app.name}</p>
                                                        <p className="mt-0.5 text-xs text-muted-foreground">{app.email}</p>
                                                    </td>
                                                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{app.role.title}</td>
                                                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                                        {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setReviewApp(app); }}>
                                                            Review <ChevronDown className="h-3.5 w-3.5 rotate-[-90deg]" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {appTotal > 30 && (
                                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                                        <span>Showing {Math.min((appPage - 1) * 30 + 1, appTotal)}–{Math.min(appPage * 30, appTotal)} of {appTotal}</span>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" disabled={appPage <= 1} onClick={() => setAppPage((p) => p - 1)}>Prev</Button>
                                            <Button variant="outline" size="sm" disabled={appPage * 30 >= appTotal} onClick={() => setAppPage((p) => p + 1)}>Next</Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ── Challenges tab ────────────────────────────────────────── */}
                {tab === 'challenges' && (
                    <div className="flex gap-6">
                        {/* Left: challenge list */}
                        <div className={`${selectedChallenge ? 'hidden lg:block lg:w-80 lg:flex-shrink-0' : 'w-full'}`}>
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="font-heading text-base font-semibold text-foreground">Challenges</h2>
                                <Button size="sm" onClick={() => setChallengeModal({ open: true })}>
                                    <Plus className="h-4 w-4" /> New Challenge
                                </Button>
                            </div>
                            {loading ? (
                                <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                            ) : challenges.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 py-20 text-center">
                                    <Mail className="h-10 w-10 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">No challenges yet.</p>
                                    <Button size="sm" variant="outline" onClick={() => setChallengeModal({ open: true })}>
                                        <Plus className="h-4 w-4" /> Create Challenge
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {challenges.map((c) => (
                                        <div
                                            key={c.id}
                                            onClick={() => handleSelectChallenge(c)}
                                            className={`cursor-pointer rounded-md border p-4 transition-colors hover:border-primary/40 hover:bg-primary/5 ${
                                                selectedChallenge?.id === c.id ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-secondary/20'
                                            }`}
                                        >
                                            <div className="mb-2 flex items-start justify-between gap-2">
                                                <p className="font-medium text-foreground text-sm">{c.title}</p>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-destructive"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteChallenge(c.id); }}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                            {c.role && <p className="mb-3 text-xs text-muted-foreground">{c.role.title}</p>}
                                            <div className="flex gap-3 text-xs text-muted-foreground">
                                                <span>{c.inviteStats.INVITED + c.inviteStats.SUBMITTED + c.inviteStats.PASSED + c.inviteStats.FAILED} invited</span>
                                                <span className="text-orange-400">{c.inviteStats.SUBMITTED} submitted</span>
                                                <span className="text-emerald-400">{c.inviteStats.PASSED} passed</span>
                                            </div>
                                            {c.deadline && (
                                                <p className={`mt-2 text-xs ${new Date(c.deadline) < new Date() ? 'text-muted-foreground/40' : 'text-orange-400/80'}`}>
                                                    Deadline: {new Date(c.deadline).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' })}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: challenge detail */}
                        {selectedChallenge && (
                            <div className="flex-1 min-w-0">
                                <div className="mb-5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setSelectedChallenge(null)} className="lg:hidden text-muted-foreground hover:text-foreground">
                                            <ArrowLeft className="h-4 w-4" />
                                        </button>
                                        <div>
                                            <h2 className="font-heading text-base font-semibold text-foreground">{selectedChallenge.title}</h2>
                                            {selectedChallenge.role && <p className="text-xs text-muted-foreground">{selectedChallenge.role.title}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setChallengeModal({ open: true, challenge: selectedChallenge })}>
                                            <Pencil className="h-3.5 w-3.5" /> Edit
                                        </Button>
                                        <Button size="sm" disabled={sendingChallenge || !selectedChallenge.roleId}
                                            onClick={() => handleSendChallenge(selectedChallenge.id)}>
                                            {sendingChallenge ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                                            Send to Shortlisted
                                        </Button>
                                    </div>
                                </div>

                                {!selectedChallenge.roleId && (
                                    <div className="mb-4 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-orange-400">
                                        Link this challenge to a role (edit) to enable sending.
                                    </div>
                                )}

                                {/* Invites list */}
                                {inviteLoading ? (
                                    <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                                ) : challengeInvites.length === 0 ? (
                                    <div className="py-16 text-center text-sm text-muted-foreground">
                                        No invites sent yet. Click "Send to Shortlisted" to send the challenge to all shortlisted candidates.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {challengeInvites.map((invite) => (
                                            <ChallengeInviteCard
                                                key={invite.id}
                                                invite={invite}
                                                challengeId={selectedChallenge.id}
                                                onReview={handleReviewInvite}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Challenge modal */}
                <AnimatePresence>
                    {challengeModal.open && (
                        <ChallengeModal
                            initial={challengeModal.challenge}
                            roles={roles}
                            onClose={() => setChallengeModal({ open: false })}
                            onSave={(saved) => {
                                if (challengeModal.challenge) {
                                    setChallenges((prev) => prev.map((c) => (c.id === saved.id ? { ...saved, _count: c._count, inviteStats: c.inviteStats } : c)));
                                    if (selectedChallenge?.id === saved.id) setSelectedChallenge({ ...saved, _count: selectedChallenge._count, inviteStats: selectedChallenge.inviteStats });
                                    showToast('Challenge updated');
                                } else {
                                    setChallenges((prev) => [saved, ...prev]);
                                    showToast('Challenge created');
                                }
                                setChallengeModal({ open: false });
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* ── Interviews tab ───────────────────────────────────────── */}
                {tab === 'interviews' && (
                    <div className="flex gap-6">
                        <div className={`${selectedInterview ? 'hidden lg:block lg:w-80 lg:flex-shrink-0' : 'w-full'}`}>
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="font-heading text-base font-semibold text-foreground">Interviews</h2>
                                <Button size="sm" onClick={() => setInterviewModal({ open: true })}>
                                    <Plus className="h-4 w-4" /> New Interview
                                </Button>
                            </div>
                            {loading ? (
                                <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                            ) : interviews.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 py-20 text-center">
                                    <CalendarClock className="h-10 w-10 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">No interviews yet.</p>
                                    <Button size="sm" variant="outline" onClick={() => setInterviewModal({ open: true })}>
                                        <Plus className="h-4 w-4" /> Create Interview
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {interviews.map((iv) => (
                                        <div
                                            key={iv.id}
                                            onClick={() => handleSelectInterview(iv)}
                                            className={`cursor-pointer rounded-md border p-4 transition-colors hover:border-primary/40 hover:bg-primary/5 ${
                                                selectedInterview?.id === iv.id ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-secondary/20'
                                            }`}
                                        >
                                            <div className="mb-2 flex items-start justify-between gap-2">
                                                <p className="font-medium text-foreground text-sm">{iv.title}</p>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-destructive"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteInterview(iv.id); }}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                            {iv.role && <p className="mb-3 text-xs text-muted-foreground">{iv.role.title}</p>}
                                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                <span>{iv._count.slots} slot{iv._count.slots !== 1 ? 's' : ''}</span>
                                                <span className="text-orange-400">{iv.inviteStats.SCHEDULED} scheduled</span>
                                                <span className="text-emerald-400">{iv.inviteStats.COMPLETED} done</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedInterview && (
                            <div className="flex-1 min-w-0">
                                <div className="mb-5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setSelectedInterview(null)} className="lg:hidden text-muted-foreground hover:text-foreground">
                                            <ArrowLeft className="h-4 w-4" />
                                        </button>
                                        <div>
                                            <h2 className="font-heading text-base font-semibold text-foreground">{selectedInterview.title}</h2>
                                            {selectedInterview.role && <p className="text-xs text-muted-foreground">{selectedInterview.role.title}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setInterviewModal({ open: true, interview: selectedInterview })}>
                                            <Pencil className="h-3.5 w-3.5" /> Edit
                                        </Button>
                                        {pendingInviteCount > 0 && (
                                            <Button
                                                variant="outline" size="sm" disabled={sendingReminder}
                                                onClick={() => handleRemindInterview(selectedInterview.id)}
                                                title="Email everyone who hasn't picked a time yet"
                                            >
                                                {sendingReminder ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
                                                Remind ({pendingInviteCount})
                                            </Button>
                                        )}
                                        <Button size="sm" onClick={() => setAddCandidatesOpen(true)}>
                                            <Plus className="h-3.5 w-3.5" /> Add Candidates
                                        </Button>
                                    </div>
                                </div>

                                {/* Slots overview */}
                                {selectedInterview.slots && selectedInterview.slots.length > 0 && (
                                    <div className="mb-5 flex flex-wrap gap-2">
                                        {selectedInterview.slots.map((s) => (
                                            <span key={s.id} className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {new Date(s.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {interviewInviteLoading ? (
                                    <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                                ) : interviewInvites.length === 0 ? (
                                    <div className="py-16 text-center text-sm text-muted-foreground">
                                        No candidates invited yet. Click "Add Candidates" to invite candidates to book a time.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {interviewInvites.map((invite) => (
                                            <InterviewInviteCard
                                                key={invite.id}
                                                invite={invite}
                                                interviewId={selectedInterview.id}
                                                onReview={handleReviewInterviewInvite}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Interview modal */}
                <AnimatePresence>
                    {interviewModal.open && (
                        <InterviewModal
                            initial={interviewModal.interview}
                            roles={roles}
                            onClose={() => setInterviewModal({ open: false })}
                            onSave={(saved) => {
                                if (interviewModal.interview) {
                                    setInterviews((prev) => prev.map((i) => (i.id === saved.id ? { ...saved, inviteStats: i.inviteStats } : i)));
                                    if (selectedInterview?.id === saved.id) setSelectedInterview({ ...saved, inviteStats: selectedInterview.inviteStats });
                                    showToast('Interview updated');
                                } else {
                                    setInterviews((prev) => [saved, ...prev]);
                                    showToast('Interview created');
                                }
                                setInterviewModal({ open: false });
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Add candidates modal */}
                <AnimatePresence>
                    {addCandidatesOpen && selectedInterview && (
                        <AddCandidatesModal
                            roles={roles}
                            existingApplicationIds={interviewInvites.map((i) => i.application.id)}
                            onClose={() => setAddCandidatesOpen(false)}
                            onAdd={(ids) => { handleAddCandidates(ids); setAddCandidatesOpen(false); }}
                        />
                    )}
                </AnimatePresence>
            </AdminLayout>
        </>
    );
}

// ─── Challenge Modal ───────────────────────────────────────────────────────────

function ChallengeModal({ initial, roles, onClose, onSave }: {
    initial?: Challenge; roles: Role[];
    onClose: () => void; onSave: (c: Challenge) => void;
}) {
    const [form, setForm] = useState({
        title: initial?.title || '',
        description: initial?.description || '',
        roleId: initial?.roleId || '',
        deadline: initial?.deadline ? toISTLocal(initial.deadline) : '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            const payload = { ...form, deadline: form.deadline ? `${form.deadline}:00+05:30` : '' };
            const url = initial ? `${API_URL}/admin/challenges/${initial.id}` : `${API_URL}/admin/challenges`;
            const r = await fetch(url, {
                method: initial ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader() },
                body: JSON.stringify(payload),
            });
            const body = await r.json();
            if (!r.ok) throw new Error(body.message);
            onSave(body);
        } catch (e) { setError(e instanceof Error ? e.message : 'Save failed'); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card w-full max-w-lg rounded-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold text-foreground">{initial ? 'Edit Challenge' : 'New Challenge'}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <Label className="mb-1.5 block text-sm text-muted-foreground">Title</Label>
                        <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="bg-secondary/50 border-border/50 h-10" placeholder="e.g. Build a To-Do App with React" />
                    </div>
                    <div>
                        <Label className="mb-1.5 block text-sm text-muted-foreground">Brief / Description</Label>
                        <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                            rows={6} className="bg-secondary/50 border-border/50 resize-none"
                            placeholder="Describe the challenge, requirements, what you're evaluating, and any constraints…" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-1.5 block text-sm text-muted-foreground">Linked Role <span className="text-muted-foreground/40">(optional)</span></Label>
                            <Select value={form.roleId || 'none'} onValueChange={(v) => setForm((p) => ({ ...p, roleId: v === 'none' ? '' : v }))}>
                                <SelectTrigger className="h-10 bg-secondary/50 border-border/50"><SelectValue placeholder="None" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="mb-1.5 block text-sm text-muted-foreground">Deadline <span className="text-muted-foreground/40">(IST)</span></Label>
                            <Input type="datetime-local" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} className="bg-secondary/50 border-border/50 h-10" />
                        </div>
                    </div>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                    <Button onClick={handleSave} disabled={saving || !form.title || !form.description} className="w-full">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : initial ? 'Save Changes' : 'Create Challenge'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Challenge Invite Card ─────────────────────────────────────────────────────

const INVITE_STATUS: Record<InviteStatus, { label: string; color: string }> = {
    INVITED:   { label: 'Invited',   color: 'bg-secondary text-muted-foreground' },
    SUBMITTED: { label: 'Submitted', color: 'bg-amber-500/10 text-orange-400' },
    PASSED:    { label: 'Passed',    color: 'bg-emerald-500/10 text-emerald-400' },
    FAILED:    { label: 'Failed',    color: 'bg-red-500/10 text-red-400' },
};

function ChallengeInviteCard({ invite, challengeId, onReview }: {
    invite: ChallengeInvite; challengeId: string;
    onReview: (challengeId: string, inviteId: string, status: 'PASSED' | 'FAILED', note: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [note, setNote] = useState(invite.adminNote || '');
    const [reviewing, setReviewing] = useState(false);
    const meta = INVITE_STATUS[invite.status];

    const review = async (status: 'PASSED' | 'FAILED') => {
        setReviewing(true);
        await onReview(challengeId, invite.id, status, note);
        setReviewing(false);
    };

    return (
        <div className="rounded-md border border-border/50 bg-secondary/10 overflow-hidden">
            <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/20 transition-colors" onClick={() => setExpanded((p) => !p)}>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{invite.application.name}</p>
                    <p className="text-xs text-muted-foreground">{invite.application.email} &bull; {invite.application.college}</p>
                </div>
                <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}>{meta.label}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </div>

            {expanded && (
                <div className="border-t border-border/40 p-4 space-y-4">
                    {invite.status === 'INVITED' ? (
                        <p className="text-sm text-muted-foreground/60 text-center py-4">Waiting for submission…</p>
                    ) : (
                        <>
                            <div className="flex flex-wrap gap-2">
                                {invite.repoUrl && (
                                    <a href={invite.repoUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/40 px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40 transition-colors">
                                        <ExternalLink className="h-3.5 w-3.5 text-primary" /> Repository
                                    </a>
                                )}
                                {invite.liveUrl && (
                                    <a href={invite.liveUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/40 px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40 transition-colors">
                                        <ExternalLink className="h-3.5 w-3.5 text-primary" /> Live Demo
                                    </a>
                                )}
                            </div>
                            {invite.notes && (
                                <div className="rounded-lg bg-secondary/30 border border-border/30 p-3">
                                    <p className="mb-1 text-xs text-muted-foreground/60">Notes from candidate</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{invite.notes}</p>
                                </div>
                            )}
                            {(invite.status === 'SUBMITTED' || invite.status === 'PASSED' || invite.status === 'FAILED') && (
                                <div className="space-y-3">
                                    <div>
                                        <Label className="mb-1.5 block text-xs text-muted-foreground/60">Internal note</Label>
                                        <Textarea value={note} onChange={(e) => setNote(e.target.value)}
                                            rows={2} placeholder="Optional note for your own records…"
                                            className="bg-secondary/50 border-border/50 resize-none text-sm" />
                                    </div>
                                    {invite.status === 'SUBMITTED' && (
                                        <div className="flex gap-2">
                                            <Button size="sm" disabled={reviewing}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                onClick={() => review('PASSED')}>
                                                {reviewing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                                                Pass
                                            </Button>
                                            <Button size="sm" variant="outline" disabled={reviewing}
                                                className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                onClick={() => review('FAILED')}>
                                                {reviewing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserX className="h-3.5 w-3.5" />}
                                                Fail
                                            </Button>
                                        </div>
                                    )}
                                    {(invite.status === 'PASSED' || invite.status === 'FAILED') && (
                                        <Button size="sm" variant="outline" className="w-full text-xs text-muted-foreground"
                                            onClick={() => review(invite.status === 'PASSED' ? 'FAILED' : 'PASSED')}>
                                            Change to {invite.status === 'PASSED' ? 'Failed' : 'Passed'}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Interview Modal ────────────────────────────────────────────────────────────

function InterviewModal({ initial, roles, onClose, onSave }: {
    initial?: Interview; roles: Role[];
    onClose: () => void; onSave: (iv: Interview) => void;
}) {
    const [form, setForm] = useState({
        title: initial?.title || '',
        description: initial?.description || '',
        location: initial?.location || '',
        durationMinutes: initial?.durationMinutes ?? 30,
        roleId: initial?.roleId || '',
    });
    const [pendingSlots, setPendingSlots] = useState<string[]>([]);
    const [newSlot, setNewSlot] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const addSlot = () => {
        if (!newSlot) return;
        setPendingSlots((prev) => [...prev, newSlot].sort());
        setNewSlot('');
    };
    const removeSlot = (s: string) => setPendingSlots((prev) => prev.filter((x) => x !== s));

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            const payload = {
                ...form,
                slots: initial ? undefined : pendingSlots.map((s) => `${s}:00+05:30`),
            };
            const url = initial ? `${API_URL}/admin/interviews/${initial.id}` : `${API_URL}/admin/interviews`;
            const r = await fetch(url, {
                method: initial ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader() },
                body: JSON.stringify(payload),
            });
            const body = await r.json();
            if (!r.ok) throw new Error(body.message);

            // If editing and there are new pending slots, add them one by one
            if (initial && pendingSlots.length > 0) {
                for (const s of pendingSlots) {
                    const slotRes = await fetch(`${API_URL}/admin/interviews/${initial.id}/slots`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...authHeader() },
                        body: JSON.stringify({ startTime: `${s}:00+05:30`, capacity: 1 }),
                    });
                    if (!slotRes.ok) {
                        const slotBody = await slotRes.json().catch(() => ({}));
                        throw new Error(slotBody.message || 'Failed to add a time slot');
                    }
                }
                const refreshRes = await fetch(`${API_URL}/admin/interviews/${initial.id}`, { headers: { ...authHeader() } });
                const refreshed = await refreshRes.json().catch(() => ({}));
                const slots = refreshRes.ok && Array.isArray(refreshed.slots) ? refreshed.slots : (initial.slots || []);
                onSave({ ...body, slots, _count: { ...body._count, slots: slots.length } });
            } else {
                onSave(body);
            }
        } catch (e) { setError(e instanceof Error ? e.message : 'Save failed'); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card w-full max-w-lg rounded-md p-6 shadow-2xl overflow-y-auto" style={{ maxHeight: '88vh' }} onClick={(e) => e.stopPropagation()}>
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold text-foreground">{initial ? 'Edit Interview' : 'New Interview'}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <Label className="mb-1.5 block text-sm text-muted-foreground">Title</Label>
                        <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="bg-secondary/50 border-border/50 h-10" placeholder="e.g. Technical Interview, Round 1" />
                    </div>
                    <div>
                        <Label className="mb-1.5 block text-sm text-muted-foreground">Description for candidate <span className="text-muted-foreground/40">(optional)</span></Label>
                        <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                            rows={3} className="bg-secondary/50 border-border/50 resize-none"
                            placeholder="What to expect, what to bring, meeting link, etc." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-1.5 block text-sm text-muted-foreground">Location</Label>
                            <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="bg-secondary/50 border-border/50 h-10" placeholder="Google Meet link / address" />
                        </div>
                        <div>
                            <Label className="mb-1.5 block text-sm text-muted-foreground">Duration (minutes)</Label>
                            <Input type="number" min={5} max={480} value={form.durationMinutes}
                                onChange={(e) => setForm((p) => ({ ...p, durationMinutes: parseInt(e.target.value) || 30 }))}
                                className="bg-secondary/50 border-border/50 h-10" />
                        </div>
                    </div>
                    <div>
                        <Label className="mb-1.5 block text-sm text-muted-foreground">Linked Role <span className="text-muted-foreground/40">(optional)</span></Label>
                        <Select value={form.roleId || 'none'} onValueChange={(v) => setForm((p) => ({ ...p, roleId: v === 'none' ? '' : v }))}>
                            <SelectTrigger className="h-10 bg-secondary/50 border-border/50"><SelectValue placeholder="None" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="h-px bg-border/40" />

                    <div>
                        <Label className="mb-1.5 block text-sm text-muted-foreground">
                            {initial ? 'Add more time slots (IST)' : 'Time slots (IST)'}
                        </Label>
                        <div className="flex gap-2 mb-3">
                            <Input type="datetime-local" value={newSlot} onChange={(e) => setNewSlot(e.target.value)} className="bg-secondary/50 border-border/50 h-9 flex-1" />
                            <Button type="button" variant="outline" size="sm" onClick={addSlot}>Add</Button>
                        </div>
                        {initial?.slots && initial.slots.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-1.5">
                                {initial.slots.map((s) => (
                                    <span key={s.id} className="rounded-md bg-secondary/40 border border-border/30 px-2 py-1 text-xs text-muted-foreground">
                                        {new Date(s.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </span>
                                ))}
                            </div>
                        )}
                        {pendingSlots.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {pendingSlots.map((s) => (
                                    <span key={s} className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2 py-1 text-xs text-primary">
                                        {new Date(`${s}:00+05:30`).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
                                        <button onClick={() => removeSlot(s)}><X className="h-3 w-3" /></button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <p className="text-xs text-destructive">{error}</p>}
                    <Button onClick={handleSave} disabled={saving || !form.title} className="w-full">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : initial ? 'Save Changes' : 'Create Interview'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Add Candidates Modal ───────────────────────────────────────────────────────

function AddCandidatesModal({ roles, existingApplicationIds, onClose, onAdd }: {
    roles: Role[]; existingApplicationIds: string[];
    onClose: () => void; onAdd: (ids: string[]) => void;
}) {
    const [roleId, setRoleId] = useState('');
    const [status, setStatus] = useState('SHORTLISTED');
    const [apps, setApps] = useState<Application[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (roleId) params.set('roleId', roleId);
            if (status) params.set('status', status);
            params.set('limit', '100');
            const data = await adminFetch(`applications?${params}`);
            setApps(data.applications || []);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [roleId, status]);

    useEffect(() => { load(); }, [load]);

    const existing = new Set(existingApplicationIds);
    const toggle = (id: string) => setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                className="glass-card w-full max-w-lg rounded-md p-6 shadow-2xl flex flex-col" style={{ maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold text-foreground">Add Candidates</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-3">
                    <Select value={roleId || 'all'} onValueChange={(v) => setRoleId(v === 'all' ? '' : v)}>
                        <SelectTrigger className="h-9 bg-secondary/50 border-border/50"><SelectValue placeholder="All roles" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All roles</SelectItem>
                            {roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
                        <SelectTrigger className="h-9 bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any status</SelectItem>
                            {Object.entries(STATUS_META).map(([k, { label }]) => (
                                <SelectItem key={k} value={k}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 overflow-y-auto rounded-lg border border-border/40">
                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                    ) : apps.length === 0 ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">No matching applicants.</p>
                    ) : (
                        <div className="divide-y divide-border/30">
                            {apps.map((a) => (
                                <label key={a.id} className={`flex items-center gap-3 px-4 py-2.5 ${existing.has(a.id) ? 'opacity-40' : 'cursor-pointer hover:bg-secondary/20'}`}>
                                    <input type="checkbox" disabled={existing.has(a.id)} checked={selected.has(a.id)} onChange={() => toggle(a.id)} className="h-4 w-4 accent-primary" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-foreground">{a.name}</p>
                                        <p className="truncate text-xs text-muted-foreground">{a.email} &bull; {a.role.title}{existing.has(a.id) ? ' · already invited' : ''}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{selected.size} selected</p>
                    <Button size="sm" disabled={selected.size === 0} onClick={() => onAdd(Array.from(selected))}>
                        <Send className="h-3.5 w-3.5" /> Invite {selected.size || ''}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Interview Invite Card ──────────────────────────────────────────────────────

const INTERVIEW_STATUS: Record<InterviewInviteStatus, { label: string; color: string }> = {
    INVITED:   { label: 'Invited',   color: 'bg-secondary text-muted-foreground' },
    SCHEDULED: { label: 'Scheduled', color: 'bg-amber-500/10 text-orange-400' },
    COMPLETED: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400' },
    NO_SHOW:   { label: 'No-show',   color: 'bg-red-500/10 text-red-400' },
    CANCELLED: { label: 'Cancelled', color: 'bg-secondary text-muted-foreground/60' },
};

function InterviewInviteCard({ invite, interviewId, onReview }: {
    invite: InterviewInvite; interviewId: string;
    onReview: (interviewId: string, inviteId: string, status: 'COMPLETED' | 'NO_SHOW' | 'CANCELLED') => void;
}) {
    const [reviewing, setReviewing] = useState(false);
    const meta = INTERVIEW_STATUS[invite.status];

    const review = async (status: 'COMPLETED' | 'NO_SHOW' | 'CANCELLED') => {
        setReviewing(true);
        await onReview(interviewId, invite.id, status);
        setReviewing(false);
    };

    return (
        <div className="rounded-md border border-border/50 bg-secondary/10 p-4">
            <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{invite.application.name}</p>
                    <p className="text-xs text-muted-foreground">{invite.application.email} &bull; {invite.application.college}</p>
                    {invite.slot && (
                        <p className="mt-1 text-xs text-primary">
                            {new Date(invite.slot.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })} IST
                        </p>
                    )}
                </div>
                <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}>{meta.label}</span>
            </div>

            {(invite.status === 'SCHEDULED' || invite.status === 'COMPLETED' || invite.status === 'NO_SHOW') && (
                <div className="mt-3 flex gap-2">
                    {invite.status === 'SCHEDULED' && (
                        <>
                            <Button size="sm" variant="outline" disabled={reviewing} className="text-xs" onClick={() => review('COMPLETED')}>
                                {reviewing ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-3 w-3" />} Mark Completed
                            </Button>
                            <Button size="sm" variant="outline" disabled={reviewing} className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => review('NO_SHOW')}>
                                No-show
                            </Button>
                            <Button size="sm" variant="ghost" disabled={reviewing} className="text-xs text-muted-foreground" onClick={() => review('CANCELLED')}>
                                Cancel
                            </Button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
