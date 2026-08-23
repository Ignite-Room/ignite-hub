import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Archive, ArchiveRestore, Trash2, AlertCircle, Loader2, GripVertical, X } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useSEO } from '@/hooks/use-seo';

type AdminTask = Awaited<ReturnType<typeof api.getAdminTasks>>[number];

const STATUS_STYLE: Record<AdminTask['status'], string> = {
    ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/30',
    ARCHIVED: 'bg-muted text-muted-foreground border-border/50',
    DRAFT: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

interface FormState {
    key: string;
    title: string;
    description: string;
    instructions: string;
    ctaUrl: string;
    ctaLabel: string;
    points: number;
    fields: { phone: boolean; email: boolean; github: boolean };
    status: AdminTask['status'];
}

const EMPTY_FORM: FormState = {
    key: '', title: '', description: '', instructions: '', ctaUrl: '', ctaLabel: '',
    points: 1, fields: { phone: false, email: false, github: false }, status: 'ACTIVE',
};

export default function TaskBoardAdmin() {
    useSEO({ title: 'Task Board', description: 'Manage ambassador tasks.', noindex: true });

    const [tasks, setTasks] = useState<AdminTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState<AdminTask | null | 'new'>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const load = () => {
        setLoading(true);
        api.getAdminTasks()
            .then(setTasks)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load tasks'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setSaveError('');
        setEditing('new');
    };

    const openEdit = (task: AdminTask) => {
        setForm({
            key: task.key, title: task.title, description: task.description,
            instructions: task.instructions || '', ctaUrl: task.ctaUrl || '', ctaLabel: task.ctaLabel || '',
            points: task.points, fields: { phone: !!task.fields.phone, email: !!task.fields.email, github: !!task.fields.github },
            status: task.status,
        });
        setSaveError('');
        setEditing(task);
    };

    const save = async () => {
        setSaving(true);
        setSaveError('');
        try {
            const payload = {
                title: form.title,
                description: form.description,
                instructions: form.instructions || undefined,
                ctaUrl: form.ctaUrl || undefined,
                ctaLabel: form.ctaLabel || undefined,
                points: form.points,
                fields: form.fields,
                status: form.status,
            };
            if (editing === 'new') {
                await api.createTask({ key: form.key, ...payload });
            } else if (editing) {
                await api.updateTask(editing.id, payload);
            }
            setEditing(null);
            load();
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const toggleArchive = async (task: AdminTask) => {
        await api.updateTask(task.id, { status: task.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED' });
        load();
    };

    const remove = async (task: AdminTask) => {
        if (!confirm(`Delete "${task.title}"? This only works if it has no submissions.`)) return;
        try {
            await api.deleteTask(task.id);
            load();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Delete failed');
        }
    };

    const move = async (task: AdminTask, direction: -1 | 1) => {
        const idx = tasks.findIndex((t) => t.id === task.id);
        const swapWith = tasks[idx + direction];
        if (!swapWith) return;
        await Promise.all([
            api.updateTask(task.id, { sortOrder: swapWith.sortOrder }),
            api.updateTask(swapWith.id, { sortOrder: task.sortOrder }),
        ]);
        load();
    };

    return (
        <AdminLayout
            title="Task Board"
            breadcrumb={['Admin', 'Ambassador Program']}
            actions={<Button onClick={openCreate} size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> New Task</Button>}
        >
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {loading && (
                    <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                )}
                {!loading && error && <p className="text-destructive text-center py-10">{error}</p>}

                {!loading && !error && tasks.length === 0 && (
                    <div className="glass-card rounded-md p-10 border border-border/50 text-center">
                        <p className="text-muted-foreground text-sm">No tasks yet. Create the first one.</p>
                    </div>
                )}

                {!loading && !error && tasks.map((task, i) => (
                    <div key={task.id} className="rounded-md border border-border/50 bg-card p-4 flex items-start gap-4">
                        <div className="flex flex-col gap-1 pt-1 flex-shrink-0">
                            <button onClick={() => move(task, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                                <GripVertical className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="font-medium text-foreground">{task.title}</p>
                                <span className={`text-sm px-2 py-0.5 rounded-full font-medium border ${STATUS_STYLE[task.status]}`}>{task.status}</span>
                                <span className="text-sm text-muted-foreground">{task.points} pt{task.points === 1 ? '' : 's'}</span>
                                <span className="text-sm text-muted-foreground">{task.submissionCount} submission{task.submissionCount === 1 ? '' : 's'}</span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                            <p className="text-sm text-muted-foreground/70 font-mono mt-0.5">{task.key}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(task)} className="gap-1.5"><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => toggleArchive(task)} className="gap-1.5">
                                {task.status === 'ARCHIVED' ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => remove(task)} className="gap-1.5 text-destructive hover:text-destructive">
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </motion.div>

            <AnimatePresence>
                {editing && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                        onClick={() => setEditing(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                            className="glass-card rounded-md border border-border/50 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-foreground">{editing === 'new' ? 'New Task' : 'Edit Task'}</h2>
                                <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                            </div>

                            {saveError && (
                                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-sm text-destructive">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {saveError}
                                </div>
                            )}

                            <div className="space-y-4">
                                {editing === 'new' && (
                                    <div>
                                        <Label className="text-sm text-muted-foreground mb-1.5 block">Key (slug, cannot be changed later)</Label>
                                        <Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="star-repo-2026" className="bg-secondary/50 border-border/50" />
                                    </div>
                                )}
                                <div>
                                    <Label className="text-sm text-muted-foreground mb-1.5 block">Title</Label>
                                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-secondary/50 border-border/50" />
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground mb-1.5 block">Description</Label>
                                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                                        className="w-full bg-secondary/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground mb-1.5 block">Instructions (optional, shown on the submission form)</Label>
                                    <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={2}
                                        className="w-full bg-secondary/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-sm text-muted-foreground mb-1.5 block">CTA URL</Label>
                                        <Input value={form.ctaUrl} onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })} placeholder="https://..." className="bg-secondary/50 border-border/50" />
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground mb-1.5 block">CTA Label</Label>
                                        <Input value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} placeholder="Open link" className="bg-secondary/50 border-border/50" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-sm text-muted-foreground mb-1.5 block">Points</Label>
                                        <Input type="number" min={1} value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) || 1 })} className="bg-secondary/50 border-border/50" />
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground mb-1.5 block">Status</Label>
                                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AdminTask['status'] })}
                                            className="w-full h-10 bg-secondary/50 border border-border/50 rounded-xl px-3 text-sm text-foreground focus:outline-none focus:border-primary/50">
                                            <option value="ACTIVE">Active</option>
                                            <option value="DRAFT">Draft</option>
                                            <option value="ARCHIVED">Archived</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground mb-2 block">Required fields from the submitter</Label>
                                    <div className="flex gap-4">
                                        {(['email', 'phone', 'github'] as const).map((f) => (
                                            <label key={f} className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={form.fields[f]}
                                                    onChange={(e) => setForm({ ...form, fields: { ...form.fields, [f]: e.target.checked } })}
                                                    className="rounded border-border/60"
                                                />
                                                {f === 'github' ? 'GitHub URL' : f.charAt(0).toUpperCase() + f.slice(1)}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <Button onClick={save} disabled={saving || !form.title || !form.description || (editing === 'new' && !form.key)} className="w-full gap-2 mt-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}
