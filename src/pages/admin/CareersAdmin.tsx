import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Briefcase, CheckCircle2, ChevronDown, Download, ExternalLink,
    FileText, Loader2, MapPin, Pencil, Plus, Search, Trash2, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import igniteLogo from '@/assets/ignite-logo.png';

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

// ─── Types ────────────────────────────────────────────────────────────────────

type JobType = 'INTERNSHIP' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
type AppStatus = 'PENDING' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'HIRED' | 'REJECTED';

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

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<JobType, string> = {
    INTERNSHIP: 'Internship', FULL_TIME: 'Full-time', PART_TIME: 'Part-time', CONTRACT: 'Contract',
};

const STATUS_META: Record<AppStatus, { label: string; color: string }> = {
    PENDING:              { label: 'Pending',             color: 'bg-secondary text-muted-foreground' },
    UNDER_REVIEW:         { label: 'Under Review',        color: 'bg-sky-500/10 text-sky-400' },
    SHORTLISTED:          { label: 'Shortlisted',         color: 'bg-amber-500/10 text-amber-400' },
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
            className="fixed right-4 top-4 z-[60] flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-xl"
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
            ? { ...initial, skills: initial.skills.join(', '), deadline: initial.deadline ? initial.deadline.slice(0, 10) : '' }
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
                deadline: form.deadline ? new Date(form.deadline).toISOString() : '',
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
                className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl"
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
                            <Label className="mb-1.5 block text-sm text-muted-foreground">Application Deadline <span className="text-muted-foreground/50">(optional)</span></Label>
                            <Input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} className="bg-secondary/50 border-border/50 focus:border-primary/50 h-10" />
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

// Cloudinary raw uploads serve with Content-Disposition: attachment by default.
// Adding fl_attachment:false forces inline serving so the browser opens the PDF.
function toInlineUrl(url: string): string {
    return url.replace('/raw/upload/', '/raw/upload/fl_attachment:false/');
}

// ─── Application Review Panel ─────────────────────────────────────────────────

function ReviewPanel({ app, onClose, onUpdate }: { app: Application; onClose: () => void; onUpdate: (a: Application) => void }) {
    const [status, setStatus] = useState<AppStatus>(app.status);
    const [note, setNote] = useState(app.adminNote || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

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
                        <div className="space-y-2 rounded-xl border border-border/40 bg-secondary/20 overflow-hidden">
                            {[
                                { label: 'Email', value: app.email },
                                { label: 'Phone', value: app.phone },
                                { label: 'College', value: app.college },
                                { label: 'Year', value: app.yearOfStudy || '—' },
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
                        <div className="rounded-xl border border-border/40 bg-secondary/20 p-4 text-sm leading-7 text-muted-foreground whitespace-pre-wrap">
                            {app.coverLetter}
                        </div>
                    </section>

                    {/* Resume */}
                    <section>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Resume</h3>
                        {/* Embedded PDF viewer — fl_attachment:false forces inline serving */}
                        <div className="overflow-hidden rounded-xl border border-border/40 bg-secondary/10" style={{ height: '420px' }}>
                            <iframe
                                src={toInlineUrl(app.resumeUrl)}
                                title="Resume"
                                className="h-full w-full"
                                allow="fullscreen"
                            />
                        </div>
                        <div className="mt-3 flex gap-2">
                            <a
                                href={toInlineUrl(app.resumeUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border/50 bg-secondary/40 px-3 py-2 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                            >
                                <ExternalLink className="h-4 w-4 text-primary" /> Open in tab
                            </a>
                            <a
                                href={app.resumeUrl}
                                download
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border/50 bg-secondary/40 px-3 py-2 text-sm font-medium text-foreground hover:border-border hover:bg-secondary/60 transition-colors"
                            >
                                <Download className="h-4 w-4" /> Download
                            </a>
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
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'roles' | 'applications';

export default function CareersAdmin() {
    const { user, logout } = useAuth();
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

    const totalOpen = roles.filter((r) => r.isOpen).length;
    const totalApps = roles.reduce((s, r) => s + (r._count?.applications ?? 0), 0);

    return (
        <div className="min-h-screen bg-background">
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
                            className="glass-card w-full max-w-sm rounded-2xl p-6 shadow-2xl"
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
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <img src={igniteLogo} alt="Ignite Room" className="h-7 w-auto" />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link to="/ambassador/admin" className="hover:text-foreground transition-colors">Admin</Link>
                            <span>/</span>
                            <span className="font-medium text-foreground">Careers</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="hidden text-sm text-muted-foreground sm:block">{user?.name}</span>
                        <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">
                            Sign out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                {/* Stats row */}
                <div className="mb-8 grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Roles', value: roles.length },
                        { label: 'Open', value: totalOpen },
                        { label: 'Total Applications', value: totalApps },
                    ].map((s) => (
                        <div key={s.label} className="glass-card rounded-xl p-5 text-center">
                            <p className="font-heading text-2xl font-bold text-gradient">{s.value}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tab bar */}
                <div className="mb-6 flex gap-1 rounded-xl border border-border/40 bg-secondary/30 p-1">
                    {(['roles', 'applications'] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium capitalize transition-all ${
                                tab === t ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {t === 'roles' ? <Briefcase className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                            {t === 'roles' ? 'Roles' : 'Applications'}
                            {t === 'applications' && appTotal > 0 && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{appTotal}</span>
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
                            <div className="overflow-hidden rounded-xl border border-border/50">
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
                        <div className="mb-5 flex flex-wrap gap-3">
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
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                        ) : applications.length === 0 ? (
                            <div className="py-20 text-center text-sm text-muted-foreground">No applications found.</div>
                        ) : (
                            <>
                                <div className="overflow-hidden rounded-xl border border-border/50">
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
            </main>
        </div>
    );
}
