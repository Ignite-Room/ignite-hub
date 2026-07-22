import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, FileCheck, Trophy, LogOut, CheckCircle2, XCircle,
    Eye, Download, RefreshCw, Plus, Building2, IdCard, ChevronRight, BarChart2, Trash2,
    Mail, Send, FileText, CalendarDays, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import ExportModal from '@/components/admin/ExportModal';
import igniteLogo from '@/assets/ignite-logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

type Tab = 'applications' | 'submissions' | 'ambassadors' | 'leaderboard' | 'mailing';

interface Application {
    id: string; name: string; email: string; phone: string;
    college: string | null; enrollmentId: string | null; createdAt: string; accountStatus: string;
}
interface Submission {
    id: string; name: string; phone: string; githubUsername: string;
    screenshotUrl: string; status: string; createdAt: string;
    ambassador: { id: string; name: string; email: string; college: string | null };
}
interface Ambassador {
    id: string; name: string; email: string; phone: string;
    college: string | null; enrollmentId: string | null; referralCode: string; createdAt: string;
    leaderboardStats: { verifiedTasks: number; externalReferrals: number; totalScore: number } | null;
    _referralVisits?: number;
}
interface LeaderboardEntry {
    rank: number; ambassadorId: string; ambassadorName: string; college: string;
    verifiedTasks: number; externalReferrals: number; totalScore: number;
}

function authHeader() {
    const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function adminFetch(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_URL}/admin/${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...authHeader(), ...options.headers },
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Request failed');
    return res.json();
}

const MOCK_APPS: Application[] = [
    { id: '1', name: 'Priya Sharma', email: 'priya@example.com', phone: '9876543210', college: 'IIT Delhi', enrollmentId: 'MT23001', createdAt: new Date().toISOString(), accountStatus: 'PENDING' },
    { id: '2', name: 'Rahul Verma', email: 'rahul@example.com', phone: '8765432109', college: 'NIT Trichy', enrollmentId: 'B20CS042', createdAt: new Date().toISOString(), accountStatus: 'PENDING' },
];
const MOCK_SUBS: Submission[] = [
    { id: 's1', name: 'Priya Sharma', phone: '9876543210', githubUsername: 'priyasharma', screenshotUrl: 'https://placehold.co/400x200', status: 'PENDING', createdAt: new Date().toISOString(), ambassador: { id: '1', name: 'Priya Sharma', email: 'priya@ex.com', college: 'IIT Delhi' } },
];
const MOCK_AMBS: Ambassador[] = [
    { id: '1', name: 'Approved User', email: 'approved@ex.com', phone: '9988776655', college: 'IIT Delhi', enrollmentId: 'MT23001', referralCode: 'approved123', createdAt: new Date().toISOString(), leaderboardStats: { verifiedTasks: 2, externalReferrals: 5, totalScore: 7 } },
];
const MOCK_LB: LeaderboardEntry[] = [
    { rank: 1, ambassadorId: '1', ambassadorName: 'Approved User', college: 'IIT Delhi', verifiedTasks: 2, externalReferrals: 5, totalScore: 7 },
];


export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [tab, setTab] = useState<Tab>('applications');
    const [applications, setApplications] = useState<Application[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [subFilter, setSubFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
    const [screenshotModal, setScreenshotModal] = useState<string | null>(null);
    const [extRefModal, setExtRefModal] = useState<{ ambassadorId: string; name: string } | null>(null);
    const [extRefCount, setExtRefCount] = useState('');
    const [toast, setToast] = useState('');
    const [manageModal, setManageModal] = useState<Ambassador | null>(null);
    const [removeConfirm, setRemoveConfirm] = useState(false);
    
    // Mailing state
    const [mailSubject, setMailSubject] = useState('');
    const [mailContent, setMailContent] = useState('');
    
    // Export state
    const [exportModal, setExportModal] = useState<{ type: 'ambassadors' | 'submissions' } | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const loadTab = useCallback(async (t: Tab) => {
        setLoading(true);
        try {
            if (USE_MOCK) {
                if (t === 'applications') setApplications(MOCK_APPS);
                if (t === 'submissions') setSubmissions(MOCK_SUBS);
                if (t === 'ambassadors') setAmbassadors(MOCK_AMBS);
                if (t === 'leaderboard') setLeaderboard(MOCK_LB);
                return;
            }
            if (t === 'applications') setApplications(await adminFetch('applications'));
            if (t === 'submissions') setSubmissions(await adminFetch(`submissions?status=${subFilter === 'ALL' ? '' : subFilter}`));
            if (t === 'ambassadors') setAmbassadors(await adminFetch('ambassadors'));
            if (t === 'leaderboard') setLeaderboard(await fetch(`${API_URL}/leaderboard`).then(r => r.json()));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [subFilter]);

    useEffect(() => { loadTab(tab); }, [loadTab, tab]);

    const handleApplication = async (id: string, action: 'approve' | 'reject') => {
        setActionLoading(id + action);
        try {
            if (!USE_MOCK) await adminFetch(`applications/${id}`, { method: 'PATCH', body: JSON.stringify({ action }) });
            setApplications(prev => prev.filter(a => a.id !== id));
            showToast(action === 'approve' ? 'Ambassador approved!' : 'Application rejected.');
        } catch { showToast('Error updating application'); } finally { setActionLoading(null); }
    };

    const handleSubmission = async (id: string, action: 'verify' | 'reject') => {
        setActionLoading(id + action);
        try {
            if (!USE_MOCK) await adminFetch(`submissions/${id}`, { method: 'PATCH', body: JSON.stringify({ action }) });
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: action === 'verify' ? 'VERIFIED' : 'REJECTED' } : s));
            showToast(action === 'verify' ? 'Submission verified!' : 'Submission rejected.');
        } catch { showToast('Error updating submission'); } finally { setActionLoading(null); }
    };

    const handleExtRef = async () => {
        if (!extRefModal || !extRefCount || isNaN(Number(extRefCount))) return;
        setActionLoading('extref');
        try {
            if (!USE_MOCK) await adminFetch('external-referrals', { method: 'POST', body: JSON.stringify({ ambassadorId: extRefModal.ambassadorId, count: Number(extRefCount) }) });
            showToast(`Added ${extRefCount} referrals for ${extRefModal.name}`);
            setExtRefModal(null);
            setExtRefCount('');
            loadTab('ambassadors');
        } catch { showToast('Error adding referrals'); } finally { setActionLoading(null); }
    };

    const handleRemoveAmbassador = async (id: string) => {
        setActionLoading(id + 'remove');
        try {
            if (!USE_MOCK) await adminFetch(`ambassadors/${id}`, { method: 'DELETE' });
            setAmbassadors(prev => prev.filter(a => a.id !== id));
            setManageModal(null);
            setRemoveConfirm(false);
            showToast('Ambassador removed.');
        } catch { showToast('Error removing ambassador'); } finally { setActionLoading(null); }
    };

    const handleDeleteSubmission = async (id: string) => {
        setActionLoading(id + 'delete');
        try {
            if (!USE_MOCK) await adminFetch(`submissions/${id}`, { method: 'DELETE' });
            setSubmissions(prev => prev.filter(s => s.id !== id));
            showToast('Submission deleted.');
        } catch { showToast('Error deleting submission'); } finally { setActionLoading(null); }
    };

    const handleSendEmail = async () => {
        if (!mailSubject || !mailContent) return;
        setActionLoading('mailing');
        try {
            const res = await api.notifyAmbassadors(mailSubject, mailContent);
            showToast(`Email sent to ${res.count} ambassadors!`);
            setMailSubject('');
            setMailContent('');
        } catch (e: any) {
            showToast(e.message || 'Error sending email');
        } finally {
            setActionLoading(null);
        }
    };


    const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
        { id: 'applications', label: 'Applications', icon: <Users className="w-4 h-4" />, badge: applications.length },
        { id: 'submissions', label: 'Submissions', icon: <FileCheck className="w-4 h-4" /> },
        { id: 'ambassadors', label: 'Ambassadors', icon: <Building2 className="w-4 h-4" />, badge: ambassadors.length },
        { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
        { id: 'mailing', label: 'Mailing', icon: <Mail className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl bg-card border border-border shadow-xl text-sm text-foreground animate-in fade-in slide-in-from-top-2">
                    {toast}
                </div>
            )}

            {/* Manage Ambassador Detail Modal */}
            {manageModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setManageModal(null)}>
                    <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                                {manageModal.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-foreground text-lg">{manageModal.name}</p>
                                <p className="text-xs text-muted-foreground">{manageModal.email}</p>
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-3 gap-2 mb-5">
                            {[
                                { label: 'Verified Tasks', value: manageModal.leaderboardStats?.verifiedTasks ?? 0, color: 'text-green-400' },
                                { label: 'Ext. Referrals', value: manageModal.leaderboardStats?.externalReferrals ?? 0, color: 'text-blue-400' },
                                { label: 'Total Score', value: manageModal.leaderboardStats?.totalScore ?? 0, color: 'text-primary' },
                            ].map(s => (
                                <div key={s.label} className="bg-secondary/40 rounded-xl p-3 text-center">
                                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Details */}
                        <div className="space-y-0 border border-border/40 rounded-xl overflow-hidden mb-5">
                            {[
                                { label: 'College', value: manageModal.college || '-', icon: <Building2 className="w-3.5 h-3.5" /> },
                                { label: 'Enrollment ID', value: manageModal.enrollmentId || '-', icon: <IdCard className="w-3.5 h-3.5" /> },
                                { label: 'Phone', value: manageModal.phone || '-', icon: null },
                                { label: 'Referral Code', value: manageModal.referralCode, isCode: true, icon: null },
                                { label: 'Joined', value: new Date(manageModal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), icon: null },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 last:border-0">
                                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        {row.icon}{row.label}
                                    </span>
                                    {row.isCode
                                        ? <code className="text-primary text-xs bg-primary/10 px-2 py-0.5 rounded">{row.value}</code>
                                        : <span className="text-sm text-foreground font-medium text-right max-w-[55%] truncate">{row.value}</span>
                                    }
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => { setManageModal(null); setRemoveConfirm(false); }}>Close</Button>
                            <Button className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 gap-1.5"
                                onClick={() => { setManageModal(null); setExtRefModal({ ambassadorId: manageModal.id, name: manageModal.name }); }}>
                                <Plus className="w-3.5 h-3.5" /> Add Referrals
                            </Button>
                        </div>

                        {/* Remove section */}
                        <div className="mt-4 pt-4 border-t border-border/40">
                            {!removeConfirm ? (
                                <Button
                                    variant="outline"
                                    className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
                                    onClick={() => setRemoveConfirm(true)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove Ambassador
                                </Button>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-xs text-destructive text-center">This will permanently delete the ambassador and all their data. Are you sure?</p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setRemoveConfirm(false)}>Cancel</Button>
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-destructive hover:bg-destructive/90 text-white gap-1.5"
                                            onClick={() => handleRemoveAmbassador(manageModal.id)}
                                            disabled={actionLoading === manageModal.id + 'remove'}
                                        >
                                            {actionLoading === manageModal.id + 'remove'
                                                ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                : <><Trash2 className="w-3.5 h-3.5" /> Confirm Remove</>}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Screenshot Modal */}
            {screenshotModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setScreenshotModal(null)}>
                    <div className="max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                        <img src={screenshotModal} alt="Submission screenshot" className="w-full rounded-xl border border-border" />
                        <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setScreenshotModal(null)}>Close</Button>
                    </div>
                </div>
            )}

            {/* External Referrals Modal */}
            {extRefModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setExtRefModal(null)}>
                    <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-foreground mb-1">Add External Referrals</h3>
                        <p className="text-sm text-muted-foreground mb-4">For <strong>{extRefModal.name}</strong> (from Unstop or other platforms)</p>
                        <Label className="text-sm text-muted-foreground mb-1.5 block">Referral Count</Label>
                        <Input type="number" min="1" placeholder="e.g. 5" value={extRefCount} onChange={e => setExtRefCount(e.target.value)} className="mb-4 h-11" />
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setExtRefModal(null)}>Cancel</Button>
                            <Button className="flex-1 bg-primary text-white" onClick={handleExtRef} disabled={actionLoading === 'extref'}>
                                {actionLoading === 'extref' ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Add Referrals'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <img src={igniteLogo} alt="Ignite Room" className="h-7 w-auto" />
                        <span className="font-bold text-gradient hidden sm:block">Admin Panel</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/ambassador/admin/careers">
                            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                                <FileText className="w-4 h-4" /> <span className="hidden sm:inline">Careers</span>
                            </Button>
                        </Link>
                        <Link to="/ambassador/admin/events">
                            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                                <CalendarDays className="w-4 h-4" /> <span className="hidden sm:inline">Events</span>
                            </Button>
                        </Link>
                        <Link to="/ambassador/admin/mail">
                            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                                <Send className="w-4 h-4" /> <span className="hidden sm:inline">Mail Center</span>
                            </Button>
                        </Link>
                        <Link to="/ambassador/admin/external-verification">
                            <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:text-primary/80">
                                <CheckCircle2 className="w-4 h-4" /> <span className="hidden sm:inline">External Verification</span>
                            </Button>
                        </Link>
                        <Link to="/ambassador/leaderboard">
                            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                                <Trophy className="w-4 h-4" /> <span className="hidden sm:inline">Public Leaderboard</span>
                            </Button>
                        </Link>
                        <div className="text-sm text-muted-foreground hidden sm:block">{user?.name}</div>
                        <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5 text-muted-foreground">
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Tab Bar */}
                <div className="flex gap-1 bg-secondary/30 rounded-xl p-1 border border-border/40 mb-8 overflow-x-auto">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${tab === t.id ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {t.icon}
                            {t.label}
                            {t.badge != null && t.badge > 0 && (
                                <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{t.badge}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Refresh */}
                <div className="flex justify-end mb-4">
                    <Button variant="ghost" size="sm" onClick={() => loadTab(tab)} className="gap-1.5 text-muted-foreground">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                </div>

                {/* ── Tab: Applications ─────────────────────────── */}
                {tab === 'applications' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-foreground">Pending Applications</h2>
                            <p className="text-sm text-muted-foreground">Review and approve/reject campus ambassador applications.</p>
                        </div>
                        {applications.length === 0 ? (
                            <div className="glass-card rounded-2xl p-12 border border-border/50 text-center text-muted-foreground">
                                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400/60" />
                                <p className="font-medium">No pending applications</p>
                                <p className="text-sm mt-1">All applications have been reviewed.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {applications.map(app => (
                                    <div key={app.id} className="glass-card rounded-xl p-5 border border-border/50 flex flex-col sm:flex-row sm:items-center gap-4">
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-foreground">{app.name}</p>
                                            <p className="text-sm text-muted-foreground">{app.email} · {app.phone}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="flex items-center gap-1 text-xs bg-secondary/60 px-2 py-0.5 rounded-full">
                                                    <Building2 className="w-3 h-3" /> {app.college || 'Not specified'}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs bg-secondary/60 px-2 py-0.5 rounded-full">
                                                    <IdCard className="w-3 h-3" /> {app.enrollmentId || 'Not specified'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    Applied {new Date(app.createdAt).toLocaleDateString('en-IN')}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Actions */}
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Button
                                                size="sm"
                                                className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 gap-1.5"
                                                onClick={() => handleApplication(app.id, 'approve')}
                                                disabled={actionLoading === app.id + 'approve'}
                                            >
                                                {actionLoading === app.id + 'approve'
                                                    ? <span className="w-3.5 h-3.5 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                                                    : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
                                                onClick={() => handleApplication(app.id, 'reject')}
                                                disabled={actionLoading === app.id + 'reject'}
                                            >
                                                <XCircle className="w-3.5 h-3.5" /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── Tab: Submissions ─────────────────────────── */}
                {tab === 'submissions' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Task Submissions</h2>
                                    <p className="text-sm text-muted-foreground">Review screenshot proofs submitted via referral links.</p>
                                </div>
                                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setExportModal({ type: 'submissions' })}>
                                    <Download className="w-3.5 h-3.5" /> Export
                                </Button>
                            </div>
                            <div className="flex gap-1 bg-secondary/30 rounded-lg p-1 border border-border/40">
                                {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map(f => (
                                    <button key={f} onClick={() => { setSubFilter(f); }}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${subFilter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >{f}</button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            {submissions
                                .filter(s => subFilter === 'ALL' || s.status === subFilter)
                                .map(sub => (
                                    <div key={sub.id} className="glass-card rounded-xl p-5 border border-border/50 flex flex-col sm:flex-row sm:items-center gap-4">
                                        {/* Screenshot thumb */}
                                        <button onClick={() => setScreenshotModal(sub.screenshotUrl)} className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-secondary/50 border border-border/50 hover:border-primary/40 transition-colors group">
                                            <img src={sub.screenshotUrl} alt="screenshot" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Eye className="w-4 h-4 text-white" />
                                            </div>
                                        </button>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-medium text-foreground">{sub.name}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sub.status === 'VERIFIED' ? 'bg-green-500/15 text-green-400' : sub.status === 'REJECTED' ? 'bg-destructive/15 text-destructive' : 'bg-amber-500/15 text-amber-400'}`}>
                                                    {sub.status}
                                                </span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-0.5">
                                                <p className="text-sm text-muted-foreground">GitHub: @{sub.githubUsername} · {sub.phone}</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Via: <span className="text-foreground/70">{sub.ambassador.name}</span>
                                                {sub.ambassador.college ? ` · ${sub.ambassador.college}` : ''}
                                                {' · '}{new Date(sub.createdAt).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>

                                        {/* Actions — verify/reject for PENDING, delete trash for all */}
                                        <div className="flex gap-2 flex-shrink-0 flex-wrap">
                                            {sub.status === 'PENDING' && (
                                                <>
                                                    <Button size="sm" className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 gap-1.5"
                                                        onClick={() => handleSubmission(sub.id, 'verify')} disabled={!!actionLoading}>
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
                                                        onClick={() => handleSubmission(sub.id, 'reject')} disabled={!!actionLoading}>
                                                        <XCircle className="w-3.5 h-3.5" /> Reject
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-destructive/20 text-destructive/70 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 gap-1"
                                                onClick={() => handleDeleteSubmission(sub.id)}
                                                disabled={actionLoading === sub.id + 'delete'}
                                                title="Delete submission"
                                            >
                                                {actionLoading === sub.id + 'delete'
                                                    ? <span className="w-3 h-3 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                                                    : <Trash2 className="w-3 h-3" />}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            {submissions.filter(s => subFilter === 'ALL' || s.status === subFilter).length === 0 && (
                                <div className="glass-card rounded-2xl p-12 border border-border/50 text-center text-muted-foreground">
                                    <FileCheck className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                                    <p className="font-medium">No {subFilter !== 'ALL' ? subFilter.toLowerCase() : ''} submissions</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── Tab: Ambassadors ─────────────────────────── */}
                {tab === 'ambassadors' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Active Ambassadors</h2>
                                    <p className="text-sm text-muted-foreground">{ambassadors.length} approved ambassadors. Add external referrals from Unstop or other platforms.</p>
                                </div>
                                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setExportModal({ type: 'ambassadors' })}>
                                    <Download className="w-3.5 h-3.5" /> Export
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {ambassadors.map(amb => (
                                <div key={amb.id} className="glass-card rounded-xl p-4 sm:p-5 border border-border/50 flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                                            {amb.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-foreground truncate">{amb.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{amb.email}</p>
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                <span className="flex items-center gap-1 text-xs bg-secondary/60 px-2 py-0.5 rounded-full">
                                                    <Building2 className="w-3 h-3" /> {amb.college || '–'}
                                                </span>
                                                <span className="text-xs text-green-400 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {amb.leaderboardStats?.verifiedTasks ?? 0} tasks</span>
                                                <span className="text-xs text-blue-400 font-medium inline-flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> {amb.leaderboardStats?.externalReferrals ?? 0} ext</span>
                                                <span className="text-xs font-bold text-primary">{amb.leaderboardStats?.totalScore ?? 0} pts</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Button size="sm" variant="outline" className="gap-1.5 border-border/50 h-8 text-xs"
                                            onClick={() => setManageModal(amb)}>
                                            <BarChart2 className="w-3.5 h-3.5" /> Manage
                                        </Button>
                                        <Button size="sm" variant="outline" className="gap-1.5 border-border/50 h-8 text-xs"
                                            onClick={() => setExtRefModal({ ambassadorId: amb.id, name: amb.name })}>
                                            <Plus className="w-3.5 h-3.5" /> Ext. Refs
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {ambassadors.length === 0 && (
                                <div className="glass-card rounded-2xl p-12 border border-border/50 text-center text-muted-foreground">
                                    <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                                    <p className="font-medium">No approved ambassadors yet</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── Tab: Leaderboard ─────────────────────────── */}
                {tab === 'leaderboard' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-foreground">Leaderboard</h2>
                            <p className="text-sm text-muted-foreground">Live rankings of approved ambassadors. Admins are excluded.</p>
                        </div>
                        <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-border/40 bg-secondary/20">
                                        <tr>
                                            {['Rank', 'Ambassador', 'College', 'Tasks', 'Ext. Refs', 'Total Score'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map(entry => (
                                            <tr key={entry.ambassadorId} className="border-b border-border/20 hover:bg-secondary/10 transition-colors">
                                                <td className="px-4 py-3 font-bold text-foreground">
                                                    {entry.rank <= 3 ? <Trophy className={`w-4 h-4 inline-block ${entry.rank === 1 ? 'text-amber-400' : entry.rank === 2 ? 'text-gray-300' : 'text-amber-600'}`} /> : `#${entry.rank}`}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-foreground">{entry.ambassadorName}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{entry.college || '–'}</td>
                                                <td className="px-4 py-3 text-center text-green-400 font-medium">{entry.verifiedTasks}</td>
                                                <td className="px-4 py-3 text-center text-blue-400 font-medium">{entry.externalReferrals}</td>
                                                <td className="px-4 py-3 text-center font-bold text-primary">{entry.totalScore}</td>
                                            </tr>
                                        ))}
                                        {leaderboard.length === 0 && (
                                            <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No entries yet</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Tab: Mailing ─────────────────────────────── */}
                {tab === 'mailing' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="glass-card rounded-2xl border border-border/50 p-6 sm:p-8">
                            <div className="max-w-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-primary/10 rounded-xl">
                                        <Mail className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">Mailing Center</h2>
                                        <p className="text-sm text-muted-foreground">Broadcast messages to all verified ambassadors</p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject Line</Label>
                                        <Input
                                            id="subject"
                                            placeholder="Task Update: New Instagram Challenge"
                                            value={mailSubject}
                                            onChange={e => setMailSubject(e.target.value)}
                                            className="bg-secondary/30 border-border/40 focus:border-primary/50"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="content">Message Content</Label>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Markdown &amp; HTML supported</span>
                                        </div>
                                        <Textarea
                                            id="content"
                                            placeholder="Hi team! We have a new task for you..."
                                            value={mailContent}
                                            onChange={e => setMailContent(e.target.value)}
                                            className="min-h-[200px] bg-secondary/30 border-border/40 focus:border-primary/50 resize-none font-sans text-sm leading-relaxed"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <Button 
                                            className="w-full sm:w-auto px-8 gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                                            disabled={!mailSubject || !mailContent || actionLoading === 'mailing'}
                                            onClick={handleSendEmail}
                                        >
                                            {actionLoading === 'mailing' ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                            Broadcast to Ambassadors
                                        </Button>
                                        <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1.5 px-1">
                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                            This will be sent to currently {ambassadors.length} verified ambassadors.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Export Modal */}
            {exportModal && (
                <ExportModal
                    isOpen={!!exportModal}
                    onClose={() => setExportModal(null)}
                    title={exportModal.type === 'ambassadors' ? 'Ambassador Data' : 'Submissions Data'}
                    data={exportModal.type === 'ambassadors' ? ambassadors : submissions}
                    onExportCSV={() => exportModal.type === 'ambassadors' ? api.exportAmbassadorsCSV() : api.exportSubmissionsCSV()}
                    fields={exportModal.type === 'ambassadors' ? [
                        { id: 'name', label: 'Name' },
                        { id: 'email', label: 'Email' },
                        { id: 'phone', label: 'Phone' },
                        { id: 'college', label: 'College' },
                        { id: 'enrollmentId', label: 'Enrollment ID' },
                        { id: 'referralCode', label: 'Referral Code' },
                        { id: 'leaderboardStats.verifiedTasks', label: 'Tasks Verified' },
                        { id: 'leaderboardStats.totalScore', label: 'Total Score' },
                        { id: 'createdAt', label: 'Joined Date' },
                    ] : [
                        { id: 'id', label: 'Sub ID' },
                        { id: 'ambassador.name', label: 'Ambassador' },
                        { id: 'ambassador.college', label: 'College' },
                        { id: 'name', label: 'Task Name' },
                        { id: 'githubUsername', label: 'GitHub' },
                        { id: 'status', label: 'Status' },
                        { id: 'createdAt', label: 'Submitted Date' },
                    ]}
                />
            )}
        </div>
    );
}
