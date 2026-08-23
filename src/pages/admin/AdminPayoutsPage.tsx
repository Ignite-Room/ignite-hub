import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, IndianRupee, Wallet, AlertTriangle, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/admin/AdminLayout';
import { fetchPayoutOrganizers, OrganizerPayoutSummary } from './adminPayoutsApi';

function formatRupees(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <div className="glass-card rounded-md p-4 border border-border/50 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary flex-shrink-0">{icon}</div>
            <div className="min-w-0">
                <p className="text-lg font-bold text-foreground truncate">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

export default function AdminPayoutsPage() {
    const [organizers, setOrganizers] = useState<OrganizerPayoutSummary[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPayoutOrganizers()
            .then(setOrganizers)
            .catch(e => setError(e instanceof Error ? e.message : 'Failed to load organizers'))
            .finally(() => setLoading(false));
    }, []);

    const totals = useMemo(() => ({
        pendingInPaise: organizers.reduce((s, o) => s + o.pendingInPaise, 0),
        earnedInPaise: organizers.reduce((s, o) => s + o.totalEarnedInPaise, 0),
        notConfigured: organizers.filter(o => o.pendingInPaise > 0 && !o.payoutConfigured).length,
    }), [organizers]);

    const filtered = organizers.filter(o =>
        !query || o.orgName.toLowerCase().includes(query.toLowerCase()) || o.contactEmail.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <AdminLayout title="Organizer Payouts" breadcrumb={['Admin', 'Finance']}>
            {loading && <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />}
            {!loading && error && <p className="text-destructive text-center py-10">{error}</p>}

            {!loading && !error && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <StatTile icon={<Wallet className="w-4 h-4" />} label="Total pending settlement" value={formatRupees(totals.pendingInPaise)} />
                        <StatTile icon={<IndianRupee className="w-4 h-4" />} label="Total collected all-time" value={formatRupees(totals.earnedInPaise)} />
                        <StatTile icon={<AlertTriangle className="w-4 h-4" />} label="Awaiting payout setup" value={totals.notConfigured} />
                    </div>

                    <div className="relative max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search by organizer or email..." value={query} onChange={e => setQuery(e.target.value)} className="pl-9 h-10 bg-secondary/30 border-border/40" />
                    </div>

                    <div className="space-y-3">
                        {filtered.length === 0 && <p className="text-muted-foreground text-center py-10">No organizers with ticket revenue yet.</p>}
                        {filtered.map(o => (
                            <Link
                                key={o.organizerId}
                                to={`/ambassador/admin/payouts/${o.organizerId}`}
                                className="block rounded-md border border-border/50 bg-card p-4 hover:border-primary/30 transition-colors"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <p className="font-medium truncate">{o.orgName}</p>
                                            {o.payoutConfigured ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-400 gap-1"><CheckCircle2 className="w-3 h-3" /> Payout configured</Badge>
                                            ) : (
                                                <Badge className="bg-destructive/10 text-destructive gap-1"><XCircle className="w-3 h-3" /> Not configured</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">{o.contactEmail}</p>
                                        {o.lastPayoutAt && (
                                            <p className="text-xs text-muted-foreground/70 mt-0.5">Last paid {new Date(o.lastPayoutAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-6 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Pending</p>
                                            <p className={`font-bold ${o.pendingInPaise > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>{formatRupees(o.pendingInPaise)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Total earned</p>
                                            <p className="font-medium text-foreground">{formatRupees(o.totalEarnedInPaise)}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            )}
        </AdminLayout>
    );
}
