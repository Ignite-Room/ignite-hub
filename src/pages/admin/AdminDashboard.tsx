import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, FileCheck, Trophy, LogOut, CheckCircle2, XCircle,
    Eye, Download, RefreshCw, Plus, ChevronDown, Building2, IdCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import igniteLogo from '@/assets/ignite-logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

type Tab = 'applications' | 'submissions' | 'ambassadors' | 'leaderboard';

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
}
interface LeaderboardEntry {
    rank: number; ambassadorId: string; ambassadorName: string; college: string;
    verifiedTasks: number; externalReferrals: number; totalScore: number;
}

function authHeader() {
    const token = localStorage.getItem('ignite_token');
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
            showToast(action === 'approve' ? '✅ Ambassador approved!' : '❌ Application rejected.');
        } catch { showToast('Error updating application'); } finally { setActionLoading(null); }
    };

    const handleSubmission = async (id: string, action: 'verify' | 'reject') => {
        setActionLoading(id + action);
        try {
            if (!USE_MOCK) await adminFetch(`submissions/${id}`, { method: 'PATCH', body: JSON.stringify({ action }) });
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: action === 'verify' ? 'VERIFIED' : 'REJECTED' } : s));
            showToast(action === 'verify' ? '✅ Submission verified!' : '❌ Submission rejected.');
        } catch { showToast('Error updating submission'); } finally { setActionLoading(null); }
    };

    const handleExtRef = async () => {
        if (!extRefModal || !extRefCount || isNaN(Number(extRefCount))) return;
        setActionLoading('extref');
        try {
            if (!USE_MOCK) await adminFetch('external-referrals', { method: 'POST', body: JSON.stringify({ ambassadorId: extRefModal.ambassadorId, count: Number(extRefCount) }) });
            showToast(`✅ Added ${extRefCount} referrals for ${extRefModal.name}`);
            setExtRefModal(null);
            setExtRefCount('');
            loadTab('ambassadors');
        } catch { showToast('Error adding referrals'); } finally { setActionLoading(null); }
    };

    const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
        { id: 'applications', label: 'Applications', icon: <Users className="w-4 h-4" />, badge: applications.length },
        { id: 'submissions', label: 'Submissions', icon: <FileCheck className="w-4 h-4" /> },
        { id: 'ambassadors', label: 'Ambassadors', icon: <Building2 className="w-4 h-4" /> },
        { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl bg-card border border-border shadow-xl text-sm text-foreground animate-in fade-in slide-in-from-top-2">
                    {toast}
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
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Task Submissions</h2>
                                <p className="text-sm text-muted-foreground">Review screenshot proofs submitted via referral links.</p>
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
                                            <p className="text-sm text-muted-foreground">GitHub: @{sub.githubUsername} · {sub.phone}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Via: <span className="text-foreground/70">{sub.ambassador.name}</span>
                                                {sub.ambassador.college ? ` · ${sub.ambassador.college}` : ''}
                                                {' · '}{new Date(sub.createdAt).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>

                                        {/* Actions — only show for PENDING */}
                                        {sub.status === 'PENDING' && (
                                            <div className="flex gap-2 flex-shrink-0">
                                                <Button size="sm" className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 gap-1.5"
                                                    onClick={() => handleSubmission(sub.id, 'verify')} disabled={!!actionLoading}>
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                                                </Button>
                                                <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
                                                    onClick={() => handleSubmission(sub.id, 'reject')} disabled={!!actionLoading}>
                                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                                </Button>
                                            </div>
                                        )}
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
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Active Ambassadors</h2>
                                <p className="text-sm text-muted-foreground">{ambassadors.length} approved ambassadors. Add external referrals from Unstop or other platforms.</p>
                            </div>
                            <Button size="sm" variant="outline" className="gap-1.5 border-border/50"
                                onClick={() => window.open(`${API_URL}/admin/submissions/export?token=${localStorage.getItem('ignite_token')}`, '_blank')}>
                                <Download className="w-3.5 h-3.5" /> Export CSV
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {ambassadors.map(amb => (
                                <div key={amb.id} className="glass-card rounded-xl p-5 border border-border/50 flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-foreground">{amb.name}</p>
                                        <p className="text-sm text-muted-foreground">{amb.email}</p>
                                        <div className="flex flex-wrap gap-2 mt-1.5">
                                            <span className="flex items-center gap-1 text-xs bg-secondary/60 px-2 py-0.5 rounded-full">
                                                <Building2 className="w-3 h-3" /> {amb.college || '–'}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs bg-secondary/60 px-2 py-0.5 rounded-full">
                                                <IdCard className="w-3 h-3" /> {amb.enrollmentId || '–'}
                                            </span>
                                            <span className="text-xs text-green-400">✓ {amb.leaderboardStats?.verifiedTasks ?? 0} tasks</span>
                                            <span className="text-xs text-blue-400">↗ {amb.leaderboardStats?.externalReferrals ?? 0} ext. refs</span>
                                            <span className="text-xs font-bold text-primary">{amb.leaderboardStats?.totalScore ?? 0} pts</span>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="gap-1.5 border-border/50 flex-shrink-0"
                                        onClick={() => setExtRefModal({ ambassadorId: amb.id, name: amb.name })}>
                                        <Plus className="w-3.5 h-3.5" /> Add Ext. Referrals
                                    </Button>
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
                                                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
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
            </main>
        </div>
    );
}
