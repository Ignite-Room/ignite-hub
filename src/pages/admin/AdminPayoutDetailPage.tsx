import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    AlertCircle, AlertTriangle, CheckCircle2, Download, Eye, EyeOff, Landmark,
    RefreshCw, Send, Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    fetchPayoutOrganizerDetail, createPayout, resendInvoice, adminPayoutInvoiceUrl, OrganizerPayoutDetail,
} from './adminPayoutsApi';

function formatRupees(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function maskAccountNumber(v: string): string {
    if (v.length <= 4) return '••••';
    return '•'.repeat(v.length - 4) + v.slice(-4);
}

function maskUpi(v: string): string {
    const at = v.indexOf('@');
    if (at < 0) return '••••';
    const name = v.slice(0, at);
    const handle = v.slice(at + 1);
    const visible = name.slice(0, 2);
    return `${visible}${'•'.repeat(Math.max(name.length - visible.length, 2))}@${handle}`;
}

export default function AdminPayoutDetailPage() {
    const { organizerId } = useParams<{ organizerId: string }>();
    const [detail, setDetail] = useState<OrganizerPayoutDetail | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [amount, setAmount] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [revealed, setRevealed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [resendingId, setResendingId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const load = () => {
        if (!organizerId) return;
        fetchPayoutOrganizerDetail(organizerId)
            .then(d => {
                setDetail(d);
                setSelected(new Set(d.pendingOrders.map(o => o.id)));
                setRevealed(false);
            })
            .catch(e => setError(e instanceof Error ? e.message : 'Failed to load organizer'))
            .finally(() => setLoading(false));
    };

    useEffect(load, [organizerId]);

    const selectedTotalInPaise = useMemo(() => {
        if (!detail) return 0;
        return detail.pendingOrders.filter(o => selected.has(o.id)).reduce((s, o) => s + o.amountInPaise, 0);
    }, [detail, selected]);

    useEffect(() => {
        setAmount((selectedTotalInPaise / 100).toFixed(2));
    }, [selectedTotalInPaise]);

    const toggleOrder = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (!detail) return;
        setSelected(prev => prev.size === detail.pendingOrders.length ? new Set() : new Set(detail.pendingOrders.map(o => o.id)));
    };

    const handleCreatePayout = async () => {
        if (!detail) return;
        setError('');
        setSuccess('');
        if (selected.size === 0) return setError('Select at least one order to settle');
        if (!referenceNumber.trim()) return setError('Enter a transaction reference (UTR / UPI reference)');
        const amountInPaise = Math.round(parseFloat(amount) * 100);
        if (!amountInPaise || amountInPaise <= 0) return setError('Enter a valid amount');

        setCreating(true);
        try {
            const res = await createPayout({
                organizerId: detail.organizerId,
                orderIds: Array.from(selected),
                amountInPaise,
                referenceNumber: referenceNumber.trim(),
                notes: notes.trim() || undefined,
            });
            setSuccess(`Payout recorded (${res.invoiceNumber}).${res.invoiceEmailSent ? ' Invoice emailed to the organizer.' : ' The invoice email failed to send; use "Resend" below once ready.'}`);
            setReferenceNumber('');
            setNotes('');
            load();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to record payout');
        } finally {
            setCreating(false);
        }
    };

    const handleResend = async (payoutId: string) => {
        setResendingId(payoutId);
        try {
            await resendInvoice(payoutId);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to resend invoice');
        } finally {
            setResendingId(null);
        }
    };

    if (loading) {
        return <AdminLayout title="Organizer Payout" breadcrumb={['Admin', 'Finance']}><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></AdminLayout>;
    }
    if (error && !detail) {
        return <AdminLayout title="Organizer Payout" breadcrumb={['Admin', 'Finance']}><p className="text-destructive text-center py-10">{error}</p></AdminLayout>;
    }
    if (!detail) return null;

    return (
        <AdminLayout title={detail.orgName} breadcrumb={['Admin', 'Finance', 'Organizer Payouts']}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <p className="text-sm text-muted-foreground -mt-2">{detail.contactName} &middot; {detail.contactEmail} &middot; {detail.contactPhone}</p>

                {error && <p className="text-sm text-destructive flex items-center gap-1.5"><AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}</p>}
                {success && <p className="text-sm text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {success}</p>}

                {!detail.payoutDetails ? (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                        <p className="text-sm text-destructive">This organizer has not configured payout details yet. They need to add a bank account or UPI ID before a payout can be recorded.</p>
                    </div>
                ) : (
                    <div className="glass-card rounded-md p-5 border border-border/50">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold flex items-center gap-2"><Landmark className="w-4 h-4 text-primary" /> Payout Details</h3>
                            <Button size="sm" variant="ghost" className="gap-1.5 text-xs h-7" onClick={() => setRevealed(r => !r)}>
                                {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {revealed ? 'Hide' : 'Reveal'}
                            </Button>
                        </div>
                        {detail.payoutDetails.method === 'BANK_TRANSFER' ? (
                            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                <div><span className="text-muted-foreground">Account Number: </span>
                                    <span className="font-mono">{detail.payoutDetails.bankAccountNumber ? (revealed ? detail.payoutDetails.bankAccountNumber : maskAccountNumber(detail.payoutDetails.bankAccountNumber)) : '-'}</span>
                                </div>
                                <div><span className="text-muted-foreground">IFSC: </span><span className="font-mono">{detail.payoutDetails.bankIfsc || '-'}</span></div>
                                <div><span className="text-muted-foreground">Bank: </span>{detail.payoutDetails.bankName || '-'}</div>
                                <div><span className="text-muted-foreground">Beneficiary: </span>{detail.payoutDetails.beneficiaryName || '-'}</div>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                <div><span className="text-muted-foreground">UPI ID: </span>
                                    <span className="font-mono">{detail.payoutDetails.upiId ? (revealed ? detail.payoutDetails.upiId : maskUpi(detail.payoutDetails.upiId)) : '-'}</span>
                                </div>
                                <div><span className="text-muted-foreground">Payee: </span>{detail.payoutDetails.upiPayeeName || '-'}</div>
                            </div>
                        )}
                    </div>
                )}

                <div className="glass-card rounded-md border border-border/50 overflow-hidden">
                    <div className="p-5 pb-3 flex items-center justify-between flex-wrap gap-2">
                        <h3 className="font-semibold flex items-center gap-2"><Wallet className="w-4 h-4 text-primary" /> Pending Orders</h3>
                        <p className="text-sm text-muted-foreground">Total pending: <span className="font-bold text-orange-400">{formatRupees(detail.pendingTotalInPaise)}</span></p>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">
                                        <input type="checkbox" checked={selected.size === detail.pendingOrders.length && detail.pendingOrders.length > 0} onChange={toggleAll} className="accent-primary w-4 h-4" />
                                    </TableHead>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {detail.pendingOrders.map(o => (
                                    <TableRow key={o.id}>
                                        <TableCell><input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleOrder(o.id)} className="accent-primary w-4 h-4" /></TableCell>
                                        <TableCell className="font-medium">{o.eventTitle}</TableCell>
                                        <TableCell>{formatRupees(o.amountInPaise)}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</TableCell>
                                    </TableRow>
                                ))}
                                {detail.pendingOrders.length === 0 && (
                                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No pending revenue to settle.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {detail.pendingOrders.length > 0 && (
                    <div className="glass-card rounded-md p-6 border border-border/50 space-y-4">
                        <h3 className="font-semibold">Record Payout</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Amount (₹)</Label>
                                <Input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="bg-secondary/50 border-border/50 h-11" />
                                <p className="text-xs text-muted-foreground/60 mt-1">Prefilled from selected orders; reduce it to deduct fees if needed.</p>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Transaction Reference (UTR / UPI Ref)</Label>
                                <Input value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} placeholder="e.g. UTR123456789" className="bg-secondary/50 border-border/50 h-11" />
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm text-muted-foreground mb-1.5 block">Notes (optional)</Label>
                            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="bg-secondary/50 border-border/50" />
                        </div>
                        <Button onClick={handleCreatePayout} disabled={creating || !detail.payoutDetails} className="gap-1.5">
                            {creating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                            Record Payout &amp; Send Invoice
                        </Button>
                    </div>
                )}

                <div className="glass-card rounded-md border border-border/50 overflow-hidden">
                    <div className="p-5 pb-0">
                        <h3 className="font-semibold mb-4">Payout History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {detail.payouts.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.invoiceNumber}</TableCell>
                                        <TableCell>{formatRupees(p.amountInPaise)}</TableCell>
                                        <TableCell><Badge variant="outline">{p.method === 'UPI' ? 'UPI' : 'Bank'}</Badge></TableCell>
                                        <TableCell className="text-muted-foreground text-xs">{p.referenceNumber}</TableCell>
                                        <TableCell>
                                            <Badge className={p.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-destructive/20 text-destructive'}>{p.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs">{new Date(p.createdAt).toLocaleDateString('en-IN')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <a href={adminPayoutInvoiceUrl(p.id)} target="_blank" rel="noopener noreferrer">
                                                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Download className="w-3 h-3" /></Button>
                                                </a>
                                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={resendingId === p.id} onClick={() => handleResend(p.id)}>
                                                    {resendingId === p.id ? <span className="w-3 h-3 border-2 border-border border-t-foreground rounded-full animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {detail.payouts.length === 0 && (
                                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No payouts recorded yet.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </motion.div>
        </AdminLayout>
    );
}
