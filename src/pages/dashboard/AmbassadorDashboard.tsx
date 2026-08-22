import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Copy, Check, Share2, Trophy, Users, BadgeCheck, ExternalLink, Flame,
    LogOut, Star, RefreshCw, AlertTriangle, MessageCircle, Twitter, Linkedin, Sparkles, UserCircle,
    Clock, XCircle, Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import type { Submission, LeaderboardEntry, DailyReferral } from '@/lib/mock-api';
import type { Task } from '@/lib/api';
import ReferralChart from './components/ReferralChart';
import SubmissionsTable from './components/SubmissionsTable';
import StatsCard from './components/StatsCard';
import igniteLogo from '@/assets/ignite-logo.png';

const SITE_URL = window.location.origin;

export default function AmbassadorDashboard() {
    const { user, logout } = useAuth();
    const [copied, setCopied] = useState(false);
    const [stats, setStats] = useState({ totalReferrals: 0, verifiedTasks: 0, externalReferrals: 0, rank: 0 });
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [chartData, setChartData] = useState<DailyReferral[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loadError, setLoadError] = useState(false);
    const [retrying, setRetrying] = useState(false);

    const referralLink = user?.referralCode ? `${SITE_URL}/ref/${user.referralCode}` : '';

    // Ambassador and Partner (organizer) status are independent privileges on one
    // account — this dashboard only unlocks once the Ambassador application itself
    // is approved, regardless of role history.
    const isApprovedAmbassador = user?.role === 'AMBASSADOR' && user?.accountStatus === 'APPROVED';
    const isPending = user?.role === 'AMBASSADOR' && user?.accountStatus === 'PENDING';
    const isRejected = user?.role === 'AMBASSADOR' && user?.accountStatus === 'REJECTED';
    const isPartner = user?.partnerStatus === 'APPROVED';

    const loadData = useCallback(async () => {
        if (!user?.id || !isApprovedAmbassador) return;
        setLoadError(false);
        try {
            const [statsData, subs, chart, lb, taskList] = await Promise.allSettled([
                api.getMyStats(user.id),
                api.getMySubmissions(user.id),
                api.getDailyReferrals(user.id),
                api.getLeaderboard(),
                api.getTasks(),
            ]);

            // Use fulfilled values or safe defaults — never crash on partial failure
            setStats(statsData.status === 'fulfilled' && statsData.value
                ? statsData.value
                : { totalReferrals: 0, verifiedTasks: 0, externalReferrals: 0, rank: 0 });
            setSubmissions(subs.status === 'fulfilled' && Array.isArray(subs.value)
                ? subs.value.slice(0, 8) : []);
            setChartData(chart.status === 'fulfilled' && Array.isArray(chart.value)
                ? chart.value : []);
            setLeaderboard(lb.status === 'fulfilled' && Array.isArray(lb.value)
                ? lb.value : []);
            setTasks(taskList.status === 'fulfilled' && Array.isArray(taskList.value)
                ? taskList.value : []);
        } catch (e) {
            console.error('[Dashboard] Unhandled load error:', e);
            setLoadError(true);
        }
    }, [user?.id, isApprovedAmbassador]);

    useEffect(() => { loadData(); }, [loadData]);

    // Re-fetch when window regains focus (user returning from completing a referral task)
    useEffect(() => {
        const onFocus = () => loadData();
        window.addEventListener('visibilitychange', onFocus);
        return () => window.removeEventListener('visibilitychange', onFocus);
    }, [loadData]);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
        } catch {
            // Fallback for mobile browsers that block clipboard
            const el = document.createElement('textarea');
            el.value = referralLink;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareText = `Join Ignite Room's HackArena hackathon! Complete a quick task using my referral link.\n\n${referralLink}`;
    const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
    const shareLinkedIn = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, '_blank');

    const handleRetry = async () => {
        setRetrying(true);
        await loadData();
        setRetrying(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <img src={igniteLogo} alt="Ignite Room" className="h-6 sm:h-7 w-auto" />
                        <span className="font-bold text-gradient text-base sm:text-lg hidden xs:block">Ignite Room</span>
                    </div>

                    <nav className="flex items-center gap-2 sm:gap-3">
                        <Link to="/contact" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Support</span>
                        </Link>
                        <Link to="/ambassador/leaderboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <Trophy className="w-4 h-4" />
                            <span className="hidden sm:inline">Leaderboard</span>
                        </Link>
                        <Link to="/ambassador/profile" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <UserCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Profile</span>
                        </Link>
                        <div className="w-px h-4 bg-border hidden sm:block" />
                        <div className="flex items-center gap-2">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="w-7 h-7 rounded-full object-cover border border-primary/30 flex-shrink-0"
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                    {user?.name?.charAt(0) ?? '?'}
                                </div>
                            )}
                            <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[100px]">{user?.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 w-8 sm:w-auto sm:px-3" onClick={logout}>
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline ml-1.5">Logout</span>
                        </Button>
                    </nav>
                </div>
            </header>

            {/* Error Recovery UI */}
            {loadError && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl p-4 bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 flex-wrap"
                    >
                        <div className="flex items-center gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <p className="text-sm text-amber-300">Couldn't load dashboard data. Check your connection.</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={handleRetry} disabled={retrying}
                            className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 gap-1.5 h-8">
                            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
                            Retry
                        </Button>
                    </motion.div>
                </div>
            )}

            {/* Main content */}
            {!isApprovedAmbassador ? (
                <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
                    <div className="glass-card rounded-2xl p-8 text-center border border-border/50">
                        {isPending ? (
                            <>
                                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-7 h-7 text-amber-400" />
                                </div>
                                <h1 className="text-xl font-bold text-foreground mb-2">Application under review</h1>
                                <p className="text-muted-foreground text-sm">
                                    We're reviewing your Campus Ambassador application. You'll get an email either way — your Ignite Room account works normally in the meantime.
                                </p>
                            </>
                        ) : isRejected ? (
                            <>
                                <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="w-7 h-7 text-destructive" />
                                </div>
                                <h1 className="text-xl font-bold text-foreground mb-2">Application not approved</h1>
                                <p className="text-muted-foreground text-sm mb-5">Your last application wasn't approved, but you're welcome to apply again.</p>
                                <Button asChild><Link to="/ambassador/apply">Reapply</Link></Button>
                            </>
                        ) : (
                            <>
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                                    <Award className="w-7 h-7 text-primary" />
                                </div>
                                <h1 className="text-xl font-bold text-foreground mb-2">Join the Campus Ambassador Program</h1>
                                <p className="text-muted-foreground text-sm mb-5">Lead your campus community, run tasks, and unlock exclusive rewards. Your existing account gets upgraded once approved.</p>
                                <Button asChild><Link to="/ambassador/apply">Apply Now</Link></Button>
                            </>
                        )}
                    </div>
                </main>
            ) : (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5 sm:space-y-6">

                    {/* Welcome */}
                    <motion.div variants={itemVariants}>
                        <h1 className="text-xl sm:text-3xl font-bold text-foreground flex items-center gap-2 flex-wrap">
                            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] ?? ''}</span> <Sparkles className="w-6 h-6 text-amber-400 inline-block mb-1" />
                            {isPartner && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 border border-primary/30 text-primary">
                                    <Award className="w-3 h-3" /> Partner
                                </span>
                            )}
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">Track your referrals and {isPartner ? 'partner tasks' : 'submissions'} here.</p>
                    </motion.div>

                    {/* Stats Cards — 2 col on mobile, 4 on desktop */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <StatsCard label="Total Referrals" value={stats.totalReferrals} icon={<Users className="w-5 h-5" />} color="primary" />
                        <StatsCard label="Verified Tasks" value={stats.verifiedTasks} icon={<BadgeCheck className="w-5 h-5" />} color="green" />
                        <StatsCard label="Ext. Referrals" value={stats.externalReferrals} icon={<ExternalLink className="w-5 h-5" />} color="blue" />
                        <StatsCard
                            label="Leaderboard Rank"
                            value={stats.rank > 0 ? `#${stats.rank}` : '-'}
                            icon={<Trophy className="w-5 h-5" />}
                            color="amber"
                            isString
                        />
                    </motion.div>

                    {/* Referral Card */}
                    <motion.div variants={itemVariants} className="glass-card rounded-2xl p-4 sm:p-6 border border-border/50">
                        <div className="mb-3">
                            <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
                                <Share2 className="w-4 h-4 text-primary" />
                                Your Referral Link
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Share to earn points on the leaderboard</p>
                        </div>

                        <div className="flex gap-2 mb-3">
                            <div className="flex-1 bg-secondary/60 rounded-xl px-3 py-2.5 border border-border/40 min-w-0 overflow-hidden">
                                <code className="text-xs sm:text-sm text-primary truncate block">{referralLink || '-'}</code>
                            </div>
                            <Button onClick={copyLink} variant="outline" size="sm"
                                className="border-border/50 hover:border-primary/50 gap-1.5 flex-shrink-0 h-auto px-3 sm:px-4">
                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                            </Button>
                        </div>

                        {/* Share buttons — wrap nicely on mobile */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground">Share:</span>
                            <Button size="sm" variant="ghost" onClick={shareWhatsApp}
                                className="h-8 px-2.5 sm:px-3 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 gap-1.5 flex items-center">
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={shareTwitter}
                                className="h-8 px-2.5 sm:px-3 text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 gap-1.5 flex items-center">
                                <Twitter className="w-3.5 h-3.5" />
                                <span>Twitter</span>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={shareLinkedIn}
                                className="h-8 px-2.5 sm:px-3 text-xs bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 gap-1.5 flex items-center">
                                <Linkedin className="w-3.5 h-3.5" />
                                <span>LinkedIn</span>
                            </Button>
                        </div>
                    </motion.div>

                    {/* Active Tasks Banner */}
                    <motion.div variants={itemVariants}
                        className="rounded-2xl p-4 sm:p-5 border border-border/50 bg-secondary/20"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                                <Flame className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-foreground text-sm">{tasks.length} Active Task{tasks.length === 1 ? '' : 's'}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Share your referral link — anyone who completes a task through it earns you leaderboard points.</p>
                            </div>
                        </div>
                        {tasks.length > 0 && (
                            <div className="grid sm:grid-cols-2 gap-2.5">
                                {tasks.map((t) => (
                                    <div key={t.id} className="rounded-xl border border-border/40 bg-background/40 px-3.5 py-3">
                                        <p className="text-sm font-medium text-foreground">{t.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Chart + Leaderboard Preview */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                            <ReferralChart data={chartData} />
                        </div>
                        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-border/50">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                                    <Trophy className="w-4 h-4 text-amber-400" />
                                    Top Ambassadors
                                </h3>
                                <Link to="/ambassador/leaderboard" className="text-xs text-primary hover:text-primary/80 transition-colors">View all →</Link>
                            </div>
                            <div className="space-y-2.5">
                                {leaderboard.slice(0, 5).map((entry) => (
                                    <div key={entry.ambassadorId} className="flex items-center gap-2.5">
                                        <span className={`w-6 text-center text-sm font-bold flex-shrink-0 flex items-center justify-center ${entry.rank === 1 ? 'text-amber-400' : entry.rank === 2 ? 'text-gray-300' : entry.rank === 3 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                            {entry.rank <= 3 ? <Trophy className="w-4 h-4 mx-auto" /> : `#${entry.rank}`}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${entry.ambassadorId === user?.id ? 'text-primary' : 'text-foreground'}`}>
                                                {entry.ambassadorId === user?.id ? 'You' : entry.ambassadorName}
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-foreground flex-shrink-0">{entry.totalScore}</span>
                                    </div>
                                ))}
                                {leaderboard.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-4">No entries yet</p>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Submissions Table */}
                    <motion.div variants={itemVariants}>
                        <SubmissionsTable submissions={submissions} title={isPartner ? 'Recent Partner Tasks (from your link)' : 'Recent Submissions (from your link)'} />
                    </motion.div>

                </motion.div>
            </main>
            )}
        </div>
    );
}
