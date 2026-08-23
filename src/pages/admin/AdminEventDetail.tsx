import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, CheckCircle2, IndianRupee, Ticket, Star, Download,
    Save, AlertCircle, RotateCcw, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ReferralChart from '@/pages/dashboard/components/ReferralChart';
import AdminLayout from '@/components/admin/AdminLayout';
import { CATEGORIES, MODES, toLocalInput } from '@/pages/events/organizer/wizard/DetailsStep';
import {
    fetchAdminEvent, updateAdminEvent, fetchAdminRegistrations, adminEventsExportUrl, refundOrder,
    AdminEventDetail as AdminEventDetailType, AdminRegistration, AdminEventUpdateInput,
} from './adminEventsApi';

const EVENT_STATUS_COLOR: Record<string, string> = {
    DRAFT: 'bg-secondary text-muted-foreground',
    PUBLISHED: 'bg-emerald-500/10 text-emerald-400',
    CANCELLED: 'bg-destructive/10 text-destructive',
    COMPLETED: 'bg-blue-500/10 text-blue-400',
};

const REG_STATUS_COLOR: Record<string, string> = {
    CONFIRMED: 'bg-emerald-500/20 text-emerald-400',
    CHECKED_IN: 'bg-primary/20 text-primary',
    CANCELLED: 'bg-destructive/20 text-destructive',
    NO_SHOW: 'bg-secondary text-muted-foreground',
    PENDING_PAYMENT: 'bg-amber-500/20 text-amber-400',
    REFUNDED: 'bg-secondary text-muted-foreground',
};

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

type EditForm = {
    title: string; tagline: string; description: string; category: string; mode: string;
    venueName: string; venueAddress: string; onlineUrl: string;
    startAt: string; endAt: string; registrationDeadline: string; capacity: string;
    isFeatured: boolean; status: string;
};

function eventToForm(event: AdminEventDetailType): EditForm {
    return {
        title: event.title,
        tagline: event.tagline || '',
        description: event.description,
        category: event.category,
        mode: event.mode,
        venueName: event.venueName || '',
        venueAddress: event.venueAddress || '',
        onlineUrl: event.onlineUrl || '',
        startAt: toLocalInput(event.startAt),
        endAt: toLocalInput(event.endAt),
        registrationDeadline: toLocalInput(event.registrationDeadline),
        capacity: event.capacity?.toString() || '',
        isFeatured: event.isFeatured,
        status: event.status,
    };
}

export default function AdminEventDetail() {
    const { id } = useParams<{ id: string }>();
    const [tab, setTab] = useState<'overview' | 'edit' | 'registrations'>('overview');
    const [event, setEvent] = useState<AdminEventDetailType | null>(null);
    const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
    const [regsLoaded, setRegsLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [form, setForm] = useState<EditForm | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveOk, setSaveOk] = useState(false);
    const [refundingId, setRefundingId] = useState<string | null>(null);

    const load = () => {
        if (!id) return;
        setLoading(true);
        fetchAdminEvent(id)
            .then(e => { setEvent(e); setForm(eventToForm(e)); })
            .catch(e => setError(e instanceof Error ? e.message : 'Failed to load event'))
            .finally(() => setLoading(false));
    };

    useEffect(load, [id]);

    useEffect(() => {
        if (tab === 'registrations' && id && !regsLoaded) {
            fetchAdminRegistrations(id).then(regs => { setRegistrations(regs); setRegsLoaded(true); }).catch(() => {});
        }
    }, [tab, id, regsLoaded]);

    const handleSave = async () => {
        if (!id || !form) return;
        setSaving(true);
        setSaveError('');
        setSaveOk(false);
        try {
            const payload: AdminEventUpdateInput = {
                title: form.title,
                tagline: form.tagline || null,
                description: form.description,
                category: form.category,
                mode: form.mode,
                venueName: form.venueName || null,
                venueAddress: form.venueAddress || null,
                onlineUrl: form.onlineUrl || null,
                startAt: new Date(form.startAt).toISOString(),
                endAt: new Date(form.endAt).toISOString(),
                registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline).toISOString() : null,
                capacity: form.capacity ? parseInt(form.capacity, 10) : null,
                isFeatured: form.isFeatured,
                status: form.status as AdminEventUpdateInput['status'],
            };
            const updated = await updateAdminEvent(id, payload);
            setEvent(prev => prev ? { ...prev, ...updated } : prev);
            setSaveOk(true);
            setTimeout(() => setSaveOk(false), 2500);
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleRefund = async (orderId: string) => {
        if (!confirm('Issue a full refund for this registration via Razorpay? This cannot be undone.')) return;
        setRefundingId(orderId);
        try {
            await refundOrder(orderId);
            if (id) fetchAdminRegistrations(id).then(setRegistrations);
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Refund failed');
        } finally {
            setRefundingId(null);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
    }
    if (error || !event || !form) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <p className="text-destructive">{error || 'Event not found'}</p>
                <Button asChild variant="outline"><Link to="/ambassador/admin/events">Back to Events</Link></Button>
            </div>
        );
    }

    const mode = form.mode;

    return (
        <AdminLayout
            title={event.title}
            breadcrumb={['Admin', 'Events', 'All Events']}
            actions={
                <Button asChild variant="outline" size="sm">
                    <a href={`/events/${event.slug}`} target="_blank" rel="noopener noreferrer">View Public Page</a>
                </Button>
            }
        >
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <Badge className={EVENT_STATUS_COLOR[event.status]}>{event.status}</Badge>
                    {event.isFeatured && <Badge className="bg-primary/20 text-primary border-primary/30"><Star className="w-3 h-3 mr-1" /> Featured</Badge>}
                    <span className="text-sm text-muted-foreground">
                        By {event.organizer.orgName} ({event.organizer.user.name}) · {event.organizer.user.email}
                    </span>
                </div>

                <div className="flex gap-1 bg-secondary/30 rounded-xl p-1 border border-border/40 mb-6 w-fit">
                    {(['overview', 'edit', 'registrations'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {t === 'edit' ? 'Edit Details' : t}
                        </button>
                    ))}
                </div>

                {tab === 'overview' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatTile icon={<Users className="w-4 h-4" />} label="Total registrations" value={event.analytics.totalRegistrations} />
                            <StatTile icon={<CheckCircle2 className="w-4 h-4" />} label="Checked in" value={event.analytics.registrationsByStatus.CHECKED_IN || 0} />
                            <StatTile icon={<IndianRupee className="w-4 h-4" />} label="Revenue" value={formatRupees(event.analytics.revenueInPaise)} />
                            <StatTile icon={<Ticket className="w-4 h-4" />} label="Ticket types" value={event.ticketTypes.length} />
                        </div>

                        <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
                            <ReferralChart data={event.analytics.registrationsOverTime} title="Registrations over time" label="Registrations" />
                            <div className="glass-card rounded-md p-5 border border-border/50">
                                <h3 className="font-semibold text-foreground mb-4">By Status</h3>
                                <div className="space-y-2.5">
                                    {Object.entries(event.analytics.registrationsByStatus).length === 0 && (
                                        <p className="text-xs text-muted-foreground">No registrations yet.</p>
                                    )}
                                    {Object.entries(event.analytics.registrationsByStatus).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between text-sm">
                                            <Badge className={REG_STATUS_COLOR[status] || 'bg-secondary text-muted-foreground'}>{status.replace('_', ' ')}</Badge>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-md border border-border/50 overflow-hidden">
                            <div className="p-5 pb-0">
                                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Ticket className="w-4 h-4 text-primary" /> Ticket Types</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Sold</TableHead>
                                            <TableHead>Capacity</TableHead>
                                            <TableHead>Team Size</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {event.ticketTypes.map(t => (
                                            <TableRow key={t.id}>
                                                <TableCell className="font-medium">{t.name}</TableCell>
                                                <TableCell>{t.priceInPaise > 0 ? formatRupees(t.priceInPaise) : 'Free'}</TableCell>
                                                <TableCell>{t.quantitySold}</TableCell>
                                                <TableCell className="text-muted-foreground">{t.quantity ?? 'Unlimited'}</TableCell>
                                                <TableCell className="text-muted-foreground">{t.maxTeamSize > 1 ? `${t.minTeamSize}-${t.maxTeamSize}` : 'Individual'}</TableCell>
                                            </TableRow>
                                        ))}
                                        {event.ticketTypes.length === 0 && (
                                            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No ticket types yet.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {event.rounds.length > 0 && (
                            <div className="glass-card rounded-md p-5 border border-border/50">
                                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /> Rounds</h3>
                                <div className="space-y-2">
                                    {event.rounds.map(r => (
                                        <div key={r.id} className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-secondary/30">
                                            <span>{r.name}</span>
                                            <span className="text-muted-foreground text-xs">{r._count.submissions} submissions</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {tab === 'edit' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-md p-6 sm:p-8 border border-border/50 max-w-3xl space-y-5">
                        {saveError && (
                            <p className="text-sm text-destructive flex items-center gap-1.5"><AlertCircle className="w-4 h-4 flex-shrink-0" /> {saveError}</p>
                        )}
                        {saveOk && (
                            <p className="text-sm text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Changes saved.</p>
                        )}

                        <div>
                            <Label className="text-sm text-muted-foreground mb-1.5 block">Title</Label>
                            <Input className="bg-secondary/50 border-border/50 h-11" value={form.title} onChange={e => setForm(f => f && ({ ...f, title: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-sm text-muted-foreground mb-1.5 block">Tagline</Label>
                            <Input className="bg-secondary/50 border-border/50 h-11" value={form.tagline} onChange={e => setForm(f => f && ({ ...f, tagline: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-sm text-muted-foreground mb-1.5 block">Description</Label>
                            <Textarea className="bg-secondary/50 border-border/50" rows={6} value={form.description} onChange={e => setForm(f => f && ({ ...f, description: e.target.value }))} />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Category</Label>
                                <Select value={form.category} onValueChange={v => setForm(f => f && ({ ...f, category: v }))}>
                                    <SelectTrigger className="bg-secondary/50 border-border/50 h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Mode</Label>
                                <Select value={form.mode} onValueChange={v => setForm(f => f && ({ ...f, mode: v }))}>
                                    <SelectTrigger className="bg-secondary/50 border-border/50 h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>{MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>

                        {(mode === 'OFFLINE' || mode === 'HYBRID') && (
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm text-muted-foreground mb-1.5 block">Venue Name</Label>
                                    <Input className="bg-secondary/50 border-border/50 h-11" value={form.venueName} onChange={e => setForm(f => f && ({ ...f, venueName: e.target.value }))} />
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground mb-1.5 block">Venue Address</Label>
                                    <Input className="bg-secondary/50 border-border/50 h-11" value={form.venueAddress} onChange={e => setForm(f => f && ({ ...f, venueAddress: e.target.value }))} />
                                </div>
                            </div>
                        )}
                        {(mode === 'ONLINE' || mode === 'HYBRID') && (
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Online Link</Label>
                                <Input className="bg-secondary/50 border-border/50 h-11" value={form.onlineUrl} onChange={e => setForm(f => f && ({ ...f, onlineUrl: e.target.value }))} />
                            </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Starts</Label>
                                <Input type="datetime-local" className="bg-secondary/50 border-border/50 h-11" value={form.startAt} onChange={e => setForm(f => f && ({ ...f, startAt: e.target.value }))} />
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Ends</Label>
                                <Input type="datetime-local" className="bg-secondary/50 border-border/50 h-11" value={form.endAt} onChange={e => setForm(f => f && ({ ...f, endAt: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Registration Deadline</Label>
                                <Input type="datetime-local" className="bg-secondary/50 border-border/50 h-11" value={form.registrationDeadline} onChange={e => setForm(f => f && ({ ...f, registrationDeadline: e.target.value }))} />
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Overall Capacity</Label>
                                <Input type="number" min={1} placeholder="Unlimited" className="bg-secondary/50 border-border/50 h-11" value={form.capacity} onChange={e => setForm(f => f && ({ ...f, capacity: e.target.value }))} />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Status</Label>
                                <Select value={form.status} onValueChange={v => setForm(f => f && ({ ...f, status: v }))}>
                                    <SelectTrigger className="bg-secondary/50 border-border/50 h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end pb-2.5">
                                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => f && ({ ...f, isFeatured: e.target.checked }))} className="accent-primary w-4 h-4" />
                                    Featured on homepage
                                </label>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button onClick={handleSave} disabled={saving} className="gap-1.5">
                                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </motion.div>
                )}

                {tab === 'registrations' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <h2 className="text-lg font-bold">Registrations ({registrations.length})</h2>
                            {id && (
                                <a href={adminEventsExportUrl(id)} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV</Button>
                                </a>
                            )}
                        </div>
                        {registrations.length === 0 ? (
                            <p className="text-muted-foreground text-center py-10">No registrations yet.</p>
                        ) : (
                            <div className="rounded-md border border-border/60 overflow-hidden overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Ticket</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Registered</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {registrations.map(r => (
                                            <TableRow key={r.id}>
                                                <TableCell className="font-medium">{r.name}{r.teamName ? ` (${r.teamName})` : ''}</TableCell>
                                                <TableCell className="text-muted-foreground">{r.email}</TableCell>
                                                <TableCell className="text-muted-foreground">{r.ticketType.name}</TableCell>
                                                <TableCell className="text-muted-foreground">{r.ticketType.priceInPaise > 0 ? formatRupees(r.ticketType.priceInPaise) : 'Free'}</TableCell>
                                                <TableCell><Badge className={REG_STATUS_COLOR[r.status] || 'bg-secondary'}>{r.status.replace('_', ' ')}</Badge></TableCell>
                                                <TableCell className="text-muted-foreground text-xs">{new Date(r.createdAt).toLocaleDateString('en-IN')}</TableCell>
                                                <TableCell>
                                                    {r.order?.status === 'PAID' && (
                                                        <Button
                                                            size="sm" variant="outline"
                                                            className="text-destructive gap-1 h-7 text-xs"
                                                            disabled={refundingId !== null}
                                                            onClick={() => handleRefund(r.order!.id)}
                                                        >
                                                            {refundingId === r.order.id ? <span className="w-3 h-3 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                                                            Refund
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </motion.div>
                )}
        </AdminLayout>
    );
}
