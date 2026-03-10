import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Flame, RefreshCw, Star, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { LeaderboardEntry } from '@/lib/mock-api';

const REFRESH_INTERVAL = 60000;

function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) return <Trophy className="w-6 h-6 text-amber-400" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
}

export default function LeaderboardPage() {
    const { isAuthenticated, isAdmin } = useAuth();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const data = await api.getLeaderboard();
            setEntries(data);
            setLastUpdated(new Date());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaderboard();
        const interval = setInterval(loadLeaderboard, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    const top3 = entries.slice(0, 3);
    const rest = entries.slice(3);

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-primary" />
                        <span className="font-bold text-gradient">Ignite Room</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground hidden sm:block">
                            Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <Button variant="ghost" size="sm" onClick={loadLeaderboard} disabled={loading} className="gap-1.5 text-muted-foreground">
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        {isAuthenticated ? (
                            <Link to={isAdmin ? '/ambassador/admin' : '/ambassador/dashboard'}>
                                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                                    {isAdmin ? 'Admin Panel' : 'My Dashboard'}
                                </Button>
                            </Link>
                        ) : (
                            <Link to="/ambassador/login">
                                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">Ambassador Login</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-10">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-4">
                        <Trophy className="w-4 h-4" />
                        Global Leaderboard
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
                        <span className="text-gradient">Campus Ambassador</span>
                        <br />Rankings
                    </h1>
                    <p className="text-muted-foreground">Live rankings based on verified tasks and external referrals</p>
                </motion.div>

                {/* Top 3 podium */}
                {!loading && top3.length >= 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-3 gap-3 mb-8"
                    >
                        {/* #2 */}
                        <div className="flex flex-col items-center pt-6">
                            <div className="w-14 h-14 rounded-full bg-gray-400/10 border-2 border-gray-400/30 flex items-center justify-center text-xl font-bold text-gray-300 mb-2">
                                {top3[1]?.ambassadorName.charAt(0)}
                            </div>
                            <Trophy className="w-6 h-6 text-gray-300 mb-1" />
                            <p className="text-sm font-semibold text-foreground text-center truncate max-w-[100px]">{top3[1]?.ambassadorName.split(' ')[0]}</p>
                            <p className="text-xs text-muted-foreground">{top3[1]?.totalScore} pts</p>
                            <div className="w-full h-20 bg-gray-400/5 border border-gray-400/20 rounded-t-xl mt-3" />
                        </div>

                        {/* #1 */}
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400/50 flex items-center justify-center text-xl font-bold text-amber-300 mb-2 shadow-lg shadow-amber-500/20">
                                    {top3[0]?.ambassadorName.charAt(0)}
                                </div>
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <div className="bg-amber-500 rounded-full p-1 shadow-sm">
                                        <Trophy className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            </div>
                            <Trophy className="w-8 h-8 text-amber-400 mb-1" />
                            <p className="text-base font-bold text-foreground text-center truncate max-w-[110px]">{top3[0]?.ambassadorName.split(' ')[0]}</p>
                            <p className="text-xs text-amber-400">{top3[0]?.totalScore} pts</p>
                            <div className="w-full h-28 bg-amber-500/5 border border-amber-500/20 rounded-t-xl mt-3" />
                        </div>

                        {/* #3 */}
                        <div className="flex flex-col items-center pt-10">
                            <div className="w-12 h-12 rounded-full bg-amber-700/10 border-2 border-amber-700/30 flex items-center justify-center text-lg font-bold text-amber-600 mb-2">
                                {top3[2]?.ambassadorName.charAt(0)}
                            </div>
                            <Trophy className="w-5 h-5 text-amber-600 mb-1" />
                            <p className="text-sm font-semibold text-foreground text-center truncate max-w-[100px]">{top3[2]?.ambassadorName.split(' ')[0]}</p>
                            <p className="text-xs text-muted-foreground">{top3[2]?.totalScore} pts</p>
                            <div className="w-full h-14 bg-amber-700/5 border border-amber-700/20 rounded-t-xl mt-3" />
                        </div>
                    </motion.div>
                )}

                {/* Score legend */}
                <div className="flex items-center justify-center gap-6 mb-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Star className="w-3 h-3 text-green-400" /> Verified Tasks</span>
                    <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-blue-400" /> External Referrals (Unstop)</span>
                    <span className="flex items-center gap-1.5"><Award className="w-3 h-3 text-amber-400" /> Total Score = Tasks + Referrals</span>
                </div>

                {/* Full Table */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-2xl border border-border/50 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/40">
                                    <th className="px-5 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-16">Rank</th>
                                    <th className="px-5 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Ambassador</th>
                                    <th className="px-5 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">Verified Tasks</th>
                                    <th className="px-5 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">Ext. Referrals</th>
                                    <th className="px-5 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b border-border/20">
                                            <td className="px-5 py-4" colSpan={5}>
                                                <div className="h-5 bg-secondary/50 rounded animate-pulse" />
                                            </td>
                                        </tr>
                                    ))
                                ) : entries.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">No ambassadors yet</td>
                                    </tr>
                                ) : (
                                    entries.map((entry, index) => (
                                        <motion.tr
                                            key={entry.ambassadorId}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className={`border-b border-border/20 hover:bg-white/[0.02] transition-colors ${entry.rank <= 3 ? 'bg-amber-500/[0.02]' : ''
                                                } ${index === entries.length - 1 ? 'border-b-0' : ''}`}
                                        >
                                            <td className="px-5 py-4 w-16">
                                                <div className="flex items-center justify-center">
                                                    <RankBadge rank={entry.rank} />
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${entry.rank === 1 ? 'bg-amber-500/20 text-amber-300' :
                                                        entry.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                                                            entry.rank === 3 ? 'bg-amber-700/20 text-amber-600' :
                                                                'bg-secondary text-muted-foreground'
                                                        }`}>
                                                        {entry.ambassadorName.charAt(0)}
                                                    </div>
                                                    <span className={`font-medium ${entry.rank <= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {entry.ambassadorName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 text-green-400 font-semibold">
                                                    <Star className="w-3.5 h-3.5" />
                                                    {entry.verifiedTasks}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 text-blue-400 font-semibold">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {entry.externalReferrals}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <span className="text-lg font-bold text-foreground">{entry.totalScore}</span>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    Auto-refreshes every 60 seconds · Total Score = Verified Tasks + External Referrals
                </p>
            </div>
        </div>
    );
}
