import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, IndianRupee, TrendingUp, Wallet, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OrganizerLayout from '@/components/organizer/OrganizerLayout';
import StatTile, { StatTileGrid } from '@/components/StatTile';
import { fetchEarnings, fetchOrganizerPayouts, organizerPayoutInvoiceUrl, Earnings, OrganizerPayout } from './organizerPayoutsApi';

function formatRupees(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function EarningsPage() {
    const [earnings, setEarnings] = useState<Earnings | null>(null);
    const [payouts, setPayouts] = useState<OrganizerPayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([fetchEarnings(), fetchOrganizerPayouts()])
            .then(([e, p]) => { setEarnings(e); setPayouts(p); })
            .catch(err => setError(err instanceof Error ? err.message : 'Failed to load earnings'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <OrganizerLayout title="Earnings & Payouts" breadcrumb={['Organizer', 'Payments']}>
            {loading && <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />}
            {!loading && error && <p className="text-destructive text-center py-10">{error}</p>}

            {!loading && !error && earnings && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <StatTileGrid cols={3}>
                        <StatTile icon={<IndianRupee className="w-4 h-4" />} label="Total earned" value={formatRupees(earnings.totalEarnedInPaise)} />
                        <StatTile icon={<TrendingUp className="w-4 h-4" />} label="Already paid out" value={formatRupees(earnings.paidOutInPaise)} />
                        <StatTile icon={<Wallet className="w-4 h-4" />} label="Pending payout" value={formatRupees(earnings.pendingInPaise)} />
                    </StatTileGrid>

                    {earnings.pendingInPaise > 0 && (
                        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3">
                            <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                            <p className="text-sm text-orange-300">
                                {formatRupees(earnings.pendingInPaise)} is awaiting settlement from Ignite Room. Make sure your{' '}
                                <Link to="/events/organizer/payout-settings" className="underline hover:text-orange-200">payout details</Link> are up to date.
                            </p>
                        </div>
                    )}

                    <div className="glass-card rounded-md border border-border/50 overflow-hidden">
                        <div className="p-5 pb-0">
                            <h3 className="font-semibold text-foreground mb-4">By Event</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Total Revenue</TableHead>
                                        <TableHead>Pending</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {earnings.events.map(e => (
                                        <TableRow key={e.eventId}>
                                            <TableCell className="font-medium">{e.eventTitle}</TableCell>
                                            <TableCell>{formatRupees(e.totalInPaise)}</TableCell>
                                            <TableCell className={e.pendingInPaise > 0 ? 'text-orange-400' : 'text-muted-foreground'}>
                                                {formatRupees(e.pendingInPaise)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {earnings.events.length === 0 && (
                                        <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No paid ticket revenue yet.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="glass-card rounded-md border border-border/50 overflow-hidden">
                        <div className="p-5 pb-0">
                            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Payout History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice</TableHead>
                                        <TableHead>Events</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payouts.map(p => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">{p.invoiceNumber}</TableCell>
                                            <TableCell className="text-muted-foreground">{p.eventTitles.join(', ')}</TableCell>
                                            <TableCell>{formatRupees(p.amountInPaise)}</TableCell>
                                            <TableCell><Badge variant="outline">{p.method === 'UPI' ? 'UPI' : 'Bank Transfer'}</Badge></TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{p.referenceNumber}</TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{new Date(p.createdAt).toLocaleDateString('en-IN')}</TableCell>
                                            <TableCell>
                                                <a href={organizerPayoutInvoiceUrl(p.id)} target="_blank" rel="noopener noreferrer">
                                                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Download className="w-3 h-3" /> Invoice</Button>
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {payouts.length === 0 && (
                                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No payouts recorded yet.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </motion.div>
            )}
        </OrganizerLayout>
    );
}
