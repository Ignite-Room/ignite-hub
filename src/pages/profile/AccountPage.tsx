import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, CalendarDays, Receipt, MapPin, Ticket,
    CheckCircle2, Clock, XCircle, Loader2, ExternalLink, Award, Rocket, ArrowRight,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TwoFactorSetup from '@/components/TwoFactorSetup';
import { useAuth } from '@/lib/auth-context';
import { api, MyRegistration } from '@/lib/api';

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRupees(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

const REGISTRATION_STATUS_STYLE: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
    CONFIRMED: { label: 'Confirmed', className: 'bg-green-500/10 text-green-400 border-green-500/30', icon: CheckCircle2 },
    CHECKED_IN: { label: 'Checked In', className: 'bg-green-500/10 text-green-400 border-green-500/30', icon: CheckCircle2 },
    PENDING_PAYMENT: { label: 'Payment Pending', className: 'bg-amber-500/10 text-orange-400 border-amber-500/30', icon: Clock },
    CANCELLED: { label: 'Cancelled', className: 'bg-muted text-muted-foreground border-border/50', icon: XCircle },
    NO_SHOW: { label: 'No Show', className: 'bg-muted text-muted-foreground border-border/50', icon: XCircle },
    REFUNDED: { label: 'Refunded', className: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: Receipt },
};

const ORDER_STATUS_STYLE: Record<string, { label: string; className: string }> = {
    PAID: { label: 'Paid', className: 'bg-green-500/10 text-green-400 border-green-500/30' },
    CREATED: { label: 'Awaiting payment', className: 'bg-amber-500/10 text-orange-400 border-amber-500/30' },
    FAILED: { label: 'Failed', className: 'bg-destructive/10 text-destructive border-destructive/30' },
    REFUNDED: { label: 'Refunded', className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
};

function Badge({ label, className }: { label: string; className: string }) {
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}>{label}</span>;
}

const PROGRAM_STATUS_STYLE: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'Application under review', className: 'bg-amber-500/10 text-orange-400 border-amber-500/30' },
    APPROVED: { label: 'Active', className: 'bg-green-500/10 text-green-400 border-green-500/30' },
    REJECTED: { label: 'Not approved (you can reapply)', className: 'bg-muted text-muted-foreground border-border/50' },
    SUSPENDED: { label: 'Suspended', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

function ProgramCard({ icon: Icon, title, description, status, to, cta }: {
    icon: typeof Award; title: string; description: string;
    status?: keyof typeof PROGRAM_STATUS_STYLE; to: string; cta: string;
}) {
    const statusStyle = status ? PROGRAM_STATUS_STYLE[status] : null;
    return (
        <Link to={to} className="info-block flex-1 min-w-[240px] p-5 group">
            <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="min-w-0">
                    <p className="font-medium text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
            </div>
            {statusStyle ? (
                <Badge label={statusStyle.label} className={statusStyle.className} />
            ) : (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
            )}
        </Link>
    );
}

function Avatar({ url, name }: { url?: string; name?: string }) {
    if (url) return <img src={url} alt={name || 'Avatar'} className="w-16 h-16 rounded-full object-cover border-2 border-primary/30" />;
    return (
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center font-bold text-2xl text-primary border-2 border-primary/30">
            {name?.charAt(0)?.toUpperCase() ?? <User className="w-6 h-6" />}
        </div>
    );
}

export default function AccountPage() {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState<'events' | 'transactions' | 'security'>('events');

    useEffect(() => {
        api.getMyRegistrations()
            .then(setRegistrations)
            .catch(e => setError(e instanceof Error ? e.message : 'Failed to load your events'))
            .finally(() => setLoading(false));
    }, []);

    const transactions = useMemo(() => registrations.filter(r => r.order !== null), [registrations]);

    const isAmbassador = user?.role === 'AMBASSADOR' && user?.accountStatus === 'APPROVED';
    const isPartner = user?.partnerStatus === 'APPROVED';

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-28 pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
                <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="space-y-6">
                    {/* Profile summary */}
                    <motion.div variants={itemVariants} className="glass-card rounded-md p-6 border border-border/50 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                        <Avatar url={user?.avatarUrl} name={user?.name} />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                                <h1 className="text-xl font-bold text-foreground">{user?.name}</h1>
                                {isPartner && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 border border-primary/30 text-primary">
                                        <Award className="w-3 h-3" /> Partner
                                    </span>
                                )}
                                {isAmbassador && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/15 border border-accent/30 text-accent-foreground">
                                        Ambassador
                                    </span>
                                )}
                            </div>
                            <div className="mt-2 space-y-1">
                                <p className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {user?.email}</p>
                                {user?.phone && <p className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-muted-foreground"><Phone className="w-3.5 h-3.5" /> {user.phone}</p>}
                            </div>
                        </div>
                    </motion.div>

                    {/* Programs — apply, or check status */}
                    <motion.div variants={itemVariants} className="info-section flex flex-wrap divide-x divide-border/60">
                        <ProgramCard
                            icon={Award}
                            title="Campus Ambassador Program"
                            description="Lead your campus community and unlock rewards."
                            status={user?.role === 'AMBASSADOR' ? user?.accountStatus : undefined}
                            to={isAmbassador ? '/ambassador/dashboard' : '/ambassador/apply'}
                            cta="Apply now"
                        />
                        <ProgramCard
                            icon={Rocket}
                            title="Organizer Program"
                            description="Host your own hackathons, workshops, and meetups."
                            status={user?.partnerStatus ?? undefined}
                            to={isPartner ? '/events/organizer' : '/events/organizers/apply'}
                            cta="Apply now"
                        />
                    </motion.div>

                    {/* Tabs */}
                    <motion.div variants={itemVariants} className="flex gap-2 border-b border-border/50">
                        <button
                            onClick={() => setTab('events')}
                            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'events' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            My Events
                        </button>
                        <button
                            onClick={() => setTab('transactions')}
                            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'transactions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            Transactions
                        </button>
                        <button
                            onClick={() => setTab('security')}
                            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'security' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            Security
                        </button>
                    </motion.div>

                    {tab === 'security' && (
                        <motion.div variants={itemVariants}>
                            <TwoFactorSetup />
                        </motion.div>
                    )}

                    {loading && (
                        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                    )}
                    {!loading && error && <p className="text-destructive text-center py-10">{error}</p>}

                    {!loading && !error && tab === 'events' && (
                        <motion.div variants={itemVariants}>
                            {registrations.length === 0 && (
                                <div className="info-section rounded-md border border-border/60 p-10 text-center">
                                    <Ticket className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground text-sm">You haven't registered for any events yet.</p>
                                </div>
                            )}
                            {registrations.length > 0 && <div className="info-section rounded-md border border-border/60 divide-y divide-border/60 overflow-hidden">
                            {registrations.map(r => {
                                const status = REGISTRATION_STATUS_STYLE[r.status] ?? REGISTRATION_STATUS_STYLE.CONFIRMED;
                                return (
                                    <a
                                        key={r.id}
                                        href={`/events/ticket/${r.token}`}
                                        className="info-block block p-4 hover:bg-secondary/40 transition-colors"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <p className="font-medium text-foreground truncate">{r.event.title}</p>
                                                    <Badge label={status.label} className={status.className} />
                                                </div>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                                    <CalendarDays className="w-3.5 h-3.5" /> {formatDate(r.event.startAt)}
                                                </p>
                                                {r.event.mode !== 'ONLINE' && r.event.venueName && (
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                        <MapPin className="w-3.5 h-3.5" /> {r.event.venueName}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm text-primary flex-shrink-0">
                                                {r.ticketType.name} <ExternalLink className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    </a>
                                );
                            })}
                            </div>}
                        </motion.div>
                    )}

                    {!loading && !error && tab === 'transactions' && (
                        <motion.div variants={itemVariants}>
                            {transactions.length === 0 && (
                                <div className="info-section rounded-md border border-border/60 p-10 text-center">
                                    <Receipt className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground text-sm">No payments yet. Paid event registrations will show up here.</p>
                                </div>
                            )}
                            {transactions.length > 0 && <div className="info-section rounded-md border border-border/60 divide-y divide-border/60 overflow-hidden">
                            {transactions.map(r => {
                                const orderStatus = ORDER_STATUS_STYLE[r.order!.status] ?? ORDER_STATUS_STYLE.CREATED;
                                return (
                                    <div key={r.id} className="info-block p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <p className="font-medium text-foreground truncate">{r.event.title}</p>
                                                    <Badge label={orderStatus.label} className={orderStatus.className} />
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(r.order!.createdAt)}
                                                    {r.order!.gatewayPaymentId && ` · Ref: ${r.order!.gatewayPaymentId}`}
                                                </p>
                                            </div>
                                            <p className="font-bold text-foreground flex-shrink-0">{formatRupees(r.order!.amountInPaise)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            </div>}
                        </motion.div>
                    )}
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
