import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Copy, Check, Share2, Trophy, Users, BadgeCheck, ExternalLink,
    Flame, LogOut, Star, Twitter, Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import type { Submission, LeaderboardEntry, DailyReferral } from '@/lib/mock-api';
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
    const [loadError, setLoadError] = useState(false);

    const referralLink = user ? `${SITE_URL}/ref/${user.referralCode}` : '';
    const localLink = user ? `${window.location.origin}/ref/${user.referralCode}` : '';

    const loadData = useCallback(async () => {
        if (!user) return;
        setLoadError(false);
        try {
            const [statsData, subs, chart, lb] = await Promise.all([
                api.getMyStats(user.id),
                api.getMySubmissions(user.id),
                api.getDailyReferrals(user.id),
                api.getLeaderboard(),
            ]);
            setStats(statsData ?? { totalReferrals: 0, verifiedTasks: 0, externalReferrals: 0, rank: 0 });
            setSubmissions((subs ?? []).slice(0, 8));
            setChartData(chart ?? []);
            setLeaderboard(lb ?? []);
        } catch (e) {
            console.error('[Dashboard] Failed to load data:', e);
            setLoadError(true);
        }
    }, [user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const copyLink = () => {
        navigator.clipboard.writeText(localLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareText = `🔥 Join Ignite Room's HackArena hackathon! Complete a quick task using my referral link and let's build something amazing together.\n\n${localLink}`;

    const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
    const shareLinkedIn = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(localLink)}`, '_blank');

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <img src={igniteLogo} alt="Ignite Room" className="h-7 w-auto" />
                        <span className="font-bold text-gradient text-lg hidden sm:block">Ignite Room</span>
                    </div>

                    <nav className="flex items-center gap-4">
                        <Link to="/ambassador/leaderboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <Trophy className="w-4 h-4" />
                            <span className="hidden sm:inline">Leaderboard</span>
                        </Link>
                        <div className="w-px h-4 bg-border" />
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                {user?.name.charAt(0)}
                            </div>
                            <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[120px]">{user?.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={logout}>
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </nav>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

                    {/* Welcome */}
                    <motion.div variants={itemVariants}>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                            Welcome back, <span className="text-gradient">{user?.name.split(' ')[0]}</span> 👋
                        </h1>
                        <p className="text-muted-foreground mt-1">Track your referrals and submissions here.</p>
                    </motion.div>

                    {/* Referral Card */}
                    <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 border border-border/50">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="font-semibold text-foreground flex items-center gap-2">
                                    <Share2 className="w-4 h-4 text-primary" />
                                    Your Referral Link
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">Share to earn points on the leaderboard</p>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <div className="flex-1 bg-secondary/60 rounded-xl px-4 py-3 border border-border/40 min-w-0">
                                <code className="text-sm text-primary truncate block">{localLink}</code>
                            </div>
                            <Button onClick={copyLink} variant="outline" className="border-border/50 hover:border-primary/50 gap-2 flex-shrink-0">
                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Share:</span>
                            <Button size="sm" variant="ghost" onClick={shareWhatsApp} className="h-8 px-3 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 gap-1.5">
                                <span className="text-base">💬</span> WhatsApp
                            </Button>
                            <Button size="sm" variant="ghost" onClick={shareTwitter} className="h-8 px-3 text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 gap-1.5">
                                <Twitter className="w-3.5 h-3.5" /> Twitter
                            </Button>
                            <Button size="sm" variant="ghost" onClick={shareLinkedIn} className="h-8 px-3 text-xs bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 gap-1.5">
                                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                            </Button>
                        </div>
                    </motion.div>

                    {/* Task Banner */}
                    <motion.div variants={itemVariants}
                        className="rounded-2xl p-5 border border-primary/30 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/5 flex items-center justify-between gap-4 flex-wrap"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <Star className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground text-sm">Active Task: Star the Daytona Repository</p>
                                <p className="text-xs text-muted-foreground">Star the repo on GitHub and submit proof via your referral link</p>
                            </div>
                        </div>
                        <a href="https://github.com/daytonaio/daytona" target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 gap-1.5 flex-shrink-0">
                                <ExternalLink className="w-3.5 h-3.5" /> View Repo
                            </Button>
                        </a>
                    </motion.div>

                    {/* Stats Cards */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard label="Total Referrals" value={stats.totalReferrals} icon={<Users className="w-5 h-5" />} color="primary" />
                        <StatsCard label="Verified Tasks" value={stats.verifiedTasks} icon={<BadgeCheck className="w-5 h-5" />} color="green" />
                        <StatsCard label="External Referrals" value={stats.externalReferrals} icon={<ExternalLink className="w-5 h-5" />} color="blue" />
                        <StatsCard
                            label="Leaderboard Rank"
                            value={stats.rank > 0 ? `#${stats.rank}` : '—'}
                            icon={<Trophy className="w-5 h-5" />}
                            color="amber"
                            isString
                        />
                    </motion.div>

                    {/* Chart + Leaderboard Preview */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                            <ReferralChart data={chartData} />
                        </div>
                        <div className="glass-card rounded-2xl p-5 border border-border/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-amber-400" />
                                    Top Ambassadors
                                </h3>
                                <Link to="/ambassador/leaderboard" className="text-xs text-primary hover:text-primary/80 transition-colors">View all →</Link>
                            </div>
                            <div className="space-y-3">
                                {leaderboard.slice(0, 5).map((entry) => (
                                    <div key={entry.ambassadorId} className="flex items-center gap-3">
                                        <span className={`w-6 text-center text-sm font-bold ${entry.rank === 1 ? 'text-amber-400' : entry.rank === 2 ? 'text-gray-300' : entry.rank === 3 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                            {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${entry.ambassadorId === user?.id ? 'text-primary' : 'text-foreground'}`}>
                                                {entry.ambassadorId === user?.id ? 'You' : entry.ambassadorName}
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-foreground">{entry.totalScore}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Submissions Table */}
                    <motion.div variants={itemVariants}>
                        <SubmissionsTable submissions={submissions} title="Recent Submissions (from your link)" />
                    </motion.div>

                </motion.div>
            </main>
        </div>
    );
}
