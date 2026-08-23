import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, Loader2, Mail, Plus, Send, Trash2, Users, X, XCircle,
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

// Authenticated JSON fetch — throws on non-2xx so callers never set state to an error object.
async function apiFetch(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.message || `HTTP ${res.status}`);
    return body;
}

type MailMode = 'simple' | 'personalized';

interface Recipient { email: string; name?: string }

interface Role { id: string; title: string }
interface Application {
    id: string; name: string; email: string; status: string;
    role: { title: string };
}

interface MailLogEntry {
    id: string; mode: string; toEmail: string; toName: string | null;
    subject: string; status: string; error: string | null; sentAt: string;
}

type Tab = 'simple' | 'personalized' | 'history';

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
    useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed right-4 top-4 z-[60] flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground shadow-xl max-w-md"
        >
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" /> {msg}
        </motion.div>
    );
}

// ─── Import from Applicants modal ──────────────────────────────────────────────

function ImportModal({ onClose, onImport }: { onClose: () => void; onImport: (rows: Recipient[]) => void }) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [roleId, setRoleId] = useState('');
    const [status, setStatus] = useState('SHORTLISTED');
    const [apps, setApps] = useState<Application[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        apiFetch('/admin/careers/roles')
            .then((data) => setRoles(Array.isArray(data) ? data : []))
            .catch(() => setRoles([]));
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (roleId) params.set('roleId', roleId);
            if (status) params.set('status', status);
            params.set('limit', '100');
            const data = await apiFetch(`/admin/careers/applications?${params}`);
            setApps(Array.isArray(data.applications) ? data.applications : []);
        } catch { setApps([]); }
        finally { setLoading(false); }
    }, [roleId, status]);

    useEffect(() => { load(); }, [load]);

    const toggle = (id: string) => setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    const handleImport = () => {
        const rows = apps.filter((a) => selected.has(a.id)).map((a) => ({ email: a.email, name: a.name }));
        onImport(rows);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                className="glass-card w-full max-w-lg rounded-md p-6 shadow-2xl flex flex-col" style={{ maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold text-foreground">Import from Applicants</h2>
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
                            <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                            <SelectItem value="INTERVIEW_SCHEDULED">Interview Scheduled</SelectItem>
                            <SelectItem value="OFFERED">Offered</SelectItem>
                            <SelectItem value="HIRED">Hired</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
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
                                <label key={a.id} className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-secondary/20">
                                    <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} className="h-4 w-4 accent-primary" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-foreground">{a.name}</p>
                                        <p className="truncate text-xs text-muted-foreground">{a.email} &bull; {a.role.title}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{selected.size} selected</p>
                    <Button size="sm" disabled={selected.size === 0} onClick={handleImport}>
                        <Plus className="h-3.5 w-3.5" /> Add {selected.size || ''}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MailCenter() {
    const [tab, setTab] = useState<Tab>('personalized');
    const [toast, setToast] = useState('');
    const showToast = (msg: string) => setToast(msg);

    // Simple mode
    const [simpleEmails, setSimpleEmails] = useState('');
    const [simpleSubject, setSimpleSubject] = useState('');
    const [simpleBody, setSimpleBody] = useState('');
    const [simpleSending, setSimpleSending] = useState(false);
    const [simpleResult, setSimpleResult] = useState<{ sent: number; total: number; errors: string[] } | null>(null);

    // Personalized mode
    const [recipients, setRecipients] = useState<Recipient[]>([{ email: '', name: '' }]);
    const [pSubject, setPSubject] = useState('');
    const [pBody, setPBody] = useState('Dear <name>,\n\n');
    const [pSending, setPSending] = useState(false);
    const [pResult, setPResult] = useState<{ sent: number; total: number; errors: string[] } | null>(null);
    const [importOpen, setImportOpen] = useState(false);
    const [pasteMode, setPasteMode] = useState(false);
    const [pasteText, setPasteText] = useState('');

    // History
    const [logs, setLogs] = useState<MailLogEntry[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const loadLogs = useCallback(async () => {
        setLogsLoading(true);
        try {
            const data = await apiFetch('/admin/mail/log?limit=100');
            setLogs(Array.isArray(data) ? data : []);
        } catch { setLogs([]); }
        finally { setLogsLoading(false); }
    }, []);

    useEffect(() => { if (tab === 'history') loadLogs(); }, [tab, loadLogs]);

    const handleSimpleSend = async () => {
        const emails = simpleEmails.split(/[\n,]/).map((e) => e.trim()).filter(Boolean);
        if (emails.length === 0 || !simpleSubject || !simpleBody) return;
        setSimpleSending(true);
        setSimpleResult(null);
        try {
            const res = await apiFetch('/admin/mail/send', {
                method: 'POST',
                body: JSON.stringify({ mode: 'simple', recipients: emails.map((email) => ({ email })), subject: simpleSubject, body: simpleBody }),
            });
            const result = { sent: res.sent ?? 0, total: res.total ?? emails.length, errors: Array.isArray(res.errors) ? res.errors : [] };
            setSimpleResult(result);
            showToast(`Sent to ${result.sent}/${result.total} recipient${result.total !== 1 ? 's' : ''}`);
        } catch (e) {
            showToast(e instanceof Error ? e.message : 'Failed to send');
        } finally {
            setSimpleSending(false);
        }
    };

    const addRow = () => setRecipients((prev) => [...prev, { email: '', name: '' }]);
    const removeRow = (i: number) => setRecipients((prev) => prev.filter((_, idx) => idx !== i));
    const updateRow = (i: number, field: 'email' | 'name', value: string) =>
        setRecipients((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

    const handlePasteImport = () => {
        const rows = pasteText.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
            const parts = line.split(',').map((p) => p.trim());
            if (parts.length >= 2) return { name: parts[0], email: parts[1] };
            return { email: parts[0] };
        }).filter((r) => r.email.includes('@'));
        if (rows.length === 0) return;
        setRecipients((prev) => {
            const cleaned = prev.filter((r) => r.email);
            return [...cleaned, ...rows];
        });
        setPasteText('');
        setPasteMode(false);
        showToast(`Added ${rows.length} recipient${rows.length !== 1 ? 's' : ''}`);
    };

    const handleImportFromApplicants = (rows: Recipient[]) => {
        setRecipients((prev) => {
            const cleaned = prev.filter((r) => r.email);
            const existingEmails = new Set(cleaned.map((r) => r.email.toLowerCase()));
            const fresh = rows.filter((r) => !existingEmails.has(r.email.toLowerCase()));
            return [...cleaned, ...fresh];
        });
        showToast(`Imported ${rows.length} candidate${rows.length !== 1 ? 's' : ''}`);
    };

    const handlePersonalizedSend = async () => {
        const valid = recipients.filter((r) => r.email && r.email.includes('@'));
        if (valid.length === 0 || !pSubject || !pBody) return;
        setPSending(true);
        setPResult(null);
        try {
            const res = await apiFetch('/admin/mail/send', {
                method: 'POST',
                body: JSON.stringify({ mode: 'personalized', recipients: valid, subject: pSubject, body: pBody }),
            });
            const result = { sent: res.sent ?? 0, total: res.total ?? valid.length, errors: Array.isArray(res.errors) ? res.errors : [] };
            setPResult(result);
            showToast(`Sent to ${result.sent}/${result.total} recipient${result.total !== 1 ? 's' : ''}`);
        } catch (e) {
            showToast(e instanceof Error ? e.message : 'Failed to send');
        } finally {
            setPSending(false);
        }
    };

    const validRecipients = recipients.filter((r) => r.email && r.email.includes('@'));
    const previewName = validRecipients[0]?.name?.split(' ')[0] || 'there';

    return (
        <>
            <AnimatePresence>{toast && <Toast msg={toast} onDone={() => setToast('')} />}</AnimatePresence>
            <AnimatePresence>{importOpen && <ImportModal onClose={() => setImportOpen(false)} onImport={handleImportFromApplicants} />}</AnimatePresence>

            <AdminLayout title="Mail Center" breadcrumb={['Admin', 'Communications']}>
                {/* Tab bar */}
                <div className="mb-6 flex gap-1 rounded-md border border-border/40 bg-secondary/30 p-1">
                    {([
                        { id: 'simple' as Tab, label: 'Quick Send', icon: Send },
                        { id: 'personalized' as Tab, label: 'Personalized', icon: Users },
                        { id: 'history' as Tab, label: 'History', icon: Mail },
                    ]).map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setTab(id)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                                tab === id ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'
                            }`}>
                            <Icon className="h-4 w-4" /> {label}
                        </button>
                    ))}
                </div>

                {/* Quick Send */}
                {tab === 'simple' && (
                    <div className="glass-card rounded-md p-6 space-y-5">
                        <div>
                            <Label className="mb-1.5 block text-sm text-muted-foreground">To <span className="text-muted-foreground/40">(comma or newline separated)</span></Label>
                            <Textarea value={simpleEmails} onChange={(e) => setSimpleEmails(e.target.value)} rows={3}
                                placeholder="jane@example.com, john@example.com"
                                className="bg-secondary/50 border-border/50 resize-none font-mono text-sm" />
                            <p className="mt-1 text-xs text-muted-foreground/50">
                                {simpleEmails.split(/[\n,]/).map((e) => e.trim()).filter(Boolean).length} recipient(s)
                            </p>
                        </div>
                        <div>
                            <Label className="mb-1.5 block text-sm text-muted-foreground">Subject</Label>
                            <Input value={simpleSubject} onChange={(e) => setSimpleSubject(e.target.value)} className="bg-secondary/50 border-border/50 h-10" placeholder="Subject line" />
                        </div>
                        <div>
                            <Label className="mb-1.5 block text-sm text-muted-foreground">Body</Label>
                            <Textarea value={simpleBody} onChange={(e) => setSimpleBody(e.target.value)} rows={10}
                                className="bg-secondary/50 border-border/50 resize-none" placeholder="Write your message…" />
                        </div>
                        {simpleResult && (
                            <div className={`rounded-lg px-4 py-3 text-sm ${simpleResult.errors.length ? 'bg-amber-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                Sent to {simpleResult.sent}/{simpleResult.total} recipient(s).
                                {simpleResult.errors.length > 0 && <span className="block mt-1 text-xs opacity-80">{simpleResult.errors.length} failed. Check email addresses and try again.</span>}
                            </div>
                        )}
                        <Button onClick={handleSimpleSend} disabled={simpleSending || !simpleEmails || !simpleSubject || !simpleBody} className="w-full">
                            {simpleSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Send
                        </Button>
                    </div>
                )}

                {/* Personalized */}
                {tab === 'personalized' && (
                    <div className="space-y-5">
                        <div className="glass-card rounded-md p-6">
                            <div className="mb-3 flex items-center justify-between">
                                <Label className="text-sm text-muted-foreground">Recipients</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setPasteMode((p) => !p)}>Paste List</Button>
                                    <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}><Users className="h-3.5 w-3.5" /> Import Candidates</Button>
                                </div>
                            </div>

                            {pasteMode && (
                                <div className="mb-4 rounded-lg border border-border/40 bg-secondary/20 p-3">
                                    <Textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={4}
                                        placeholder={'One per line: Name, email@example.com'}
                                        className="bg-secondary/50 border-border/50 resize-none font-mono text-xs mb-2" />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handlePasteImport}>Add to list</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setPasteMode(false)}>Cancel</Button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {recipients.map((r, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input value={r.name || ''} onChange={(e) => updateRow(i, 'name', e.target.value)}
                                            placeholder="Name" className="bg-secondary/50 border-border/50 h-9 w-2/5" />
                                        <Input value={r.email} onChange={(e) => updateRow(i, 'email', e.target.value)}
                                            placeholder="email@example.com" className="bg-secondary/50 border-border/50 h-9 flex-1" />
                                        <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeRow(i)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" className="mt-3" onClick={addRow}>
                                <Plus className="h-3.5 w-3.5" /> Add row
                            </Button>
                            <p className="mt-3 text-xs text-muted-foreground/50">{validRecipients.length} valid recipient(s)</p>
                        </div>

                        <div className="glass-card rounded-md p-6 space-y-5">
                            <div>
                                <Label className="mb-1.5 block text-sm text-muted-foreground">Subject <span className="text-muted-foreground/40">(you can use &lt;name&gt;)</span></Label>
                                <Input value={pSubject} onChange={(e) => setPSubject(e.target.value)} className="bg-secondary/50 border-border/50 h-10" placeholder="e.g. Interview invitation for <name>" />
                            </div>
                            <div>
                                <Label className="mb-1.5 block text-sm text-muted-foreground">Body <span className="text-muted-foreground/40">Use &lt;name&gt; anywhere you want the candidate's first name inserted</span></Label>
                                <Textarea value={pBody} onChange={(e) => setPBody(e.target.value)} rows={10}
                                    className="bg-secondary/50 border-border/50 resize-none" placeholder={'Dear <name>,\n\n...'} />
                            </div>
                            {validRecipients.length > 0 && (pSubject || pBody) && (
                                <div className="rounded-lg border border-border/40 bg-secondary/10 p-4">
                                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/50">Preview for {previewName}</p>
                                    <p className="mb-1 text-sm font-medium text-foreground">{pSubject.replace(/<name>/gi, previewName)}</p>
                                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{pBody.replace(/<name>/gi, previewName)}</p>
                                </div>
                            )}
                            {pResult && (
                                <div className={`rounded-lg px-4 py-3 text-sm ${pResult.errors.length ? 'bg-amber-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                    Sent to {pResult.sent}/{pResult.total} recipient(s).
                                    {pResult.errors.length > 0 && <span className="block mt-1 text-xs opacity-80">{pResult.errors.length} failed.</span>}
                                </div>
                            )}
                            <Button onClick={handlePersonalizedSend} disabled={pSending || validRecipients.length === 0 || !pSubject || !pBody} className="w-full">
                                {pSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Send to {validRecipients.length || ''} recipient{validRecipients.length !== 1 ? 's' : ''}
                            </Button>
                        </div>
                    </div>
                )}

                {/* History */}
                {tab === 'history' && (
                    <div className="glass-card rounded-md overflow-hidden">
                        {logsLoading ? (
                            <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                        ) : logs.length === 0 ? (
                            <p className="py-16 text-center text-sm text-muted-foreground">No emails sent yet.</p>
                        ) : (
                            <div className="divide-y divide-border/30">
                                {logs.map((l) => (
                                    <div key={l.id} className="flex items-center gap-3 px-5 py-3">
                                        {l.status === 'SENT' ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" /> : <XCircle className="h-4 w-4 flex-shrink-0 text-red-400" />}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm text-foreground">{l.subject}</p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {l.toName ? `${l.toName} · ` : ''}{l.toEmail} &bull; {l.mode === 'simple' ? 'Quick Send' : 'Personalized'}
                                            </p>
                                        </div>
                                        <p className="flex-shrink-0 text-xs text-muted-foreground/50">
                                            {new Date(l.sentAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </AdminLayout>
        </>
    );
}
