import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Award, Rocket, User as UserIcon, ArrowRight, Ticket, Trophy, ListChecks } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

const CARD_STYLES = {
    pink: 'from-primary/15 to-primary/5 hover:border-primary/40',
    amber: 'from-amber-500/15 to-amber-500/5 hover:border-amber-500/40',
    purple: 'from-purple-500/15 to-purple-500/5 hover:border-purple-500/40',
    green: 'from-green-500/15 to-green-500/5 hover:border-green-500/40',
} as const;

const ICON_STYLES = {
    pink: 'bg-primary/15 text-primary',
    amber: 'bg-amber-500/15 text-orange-400',
    purple: 'bg-purple-500/15 text-purple-400',
    green: 'bg-green-500/15 text-green-400',
} as const;

const BADGE_STYLES = {
    pink: 'bg-primary/15 text-primary',
    amber: 'bg-amber-500/15 text-orange-400',
    purple: 'bg-purple-500/15 text-purple-400',
    green: 'bg-green-500/15 text-green-400',
} as const;

export default function HomePage() {
    const { user } = useAuth();
    const role = (user?.role || '').toUpperCase();
    const isAmbassador = role === 'AMBASSADOR';
    const ambassadorApproved = isAmbassador && user?.accountStatus === 'APPROVED';
    const ambassadorPending = isAmbassador && user?.accountStatus === 'PENDING';
    const ambassadorRejected = isAmbassador && user?.accountStatus === 'REJECTED';

    const [eventsJoined, setEventsJoined] = useState<number | null>(null);
    const [ambassadorRank, setAmbassadorRank] = useState<number | null>(null);

    useEffect(() => {
        api.getMyRegistrations().then((regs) => setEventsJoined(regs.length)).catch(() => setEventsJoined(null));
    }, []);

    useEffect(() => {
        if (!ambassadorApproved || !user?.id) return;
        api.getMyStats(user.id).then((s) => setAmbassadorRank(s.rank || null)).catch(() => setAmbassadorRank(null));
    }, [ambassadorApproved, user?.id]);

    const cards: { icon: typeof CalendarDays; title: string; description: string; cta: string; to: string; color: keyof typeof CARD_STYLES; badge?: string; foot?: string }[] = [
        {
            icon: CalendarDays,
            title: 'Events',
            description: 'Browse upcoming hackathons, workshops, and meetups, and register in a few clicks.',
            cta: 'Browse Events',
            to: '/events',
            color: 'pink',
        },
        {
            icon: Award,
            title: 'Ambassador Program',
            description: ambassadorPending
                ? 'Your Campus Ambassador application is under review. We\'ll notify you once it\'s approved.'
                : ambassadorRejected
                    ? 'Your last application wasn\'t approved. You\'re welcome to apply again.'
                    : ambassadorApproved
                        ? 'Head to your Ambassador Dashboard to track referrals, tasks, and leaderboard rank.'
                        : 'Lead your campus community, run events, and unlock exclusive rewards as a Campus Ambassador.',
            cta: ambassadorPending ? 'View Status' : ambassadorRejected ? 'Reapply' : ambassadorApproved ? 'Open Dashboard' : 'Apply Now',
            to: ambassadorPending ? '/ambassador/pending' : ambassadorApproved ? '/ambassador/dashboard' : '/ambassador/apply',
            color: 'amber',
            badge: ambassadorPending ? 'Pending' : ambassadorApproved ? 'Active' : undefined,
            foot: ambassadorApproved && ambassadorRank ? `Rank #${ambassadorRank}` : undefined,
        },
        {
            icon: Rocket,
            title: 'Organize Events',
            description: 'Host your own hackathon or workshop on Ignite Room: manage registrations, rounds, and scoring.',
            cta: 'Organizer Dashboard',
            to: '/events/organizer',
            color: 'purple',
        },
        {
            icon: UserIcon,
            title: isAmbassador ? 'My Profile' : 'My Account',
            description: isAmbassador
                ? 'Update your details, avatar, and account information.'
                : 'View your registered events, payment history, and account details.',
            cta: isAmbassador ? 'View Profile' : 'View Account',
            to: isAmbassador ? '/ambassador/profile' : '/account',
            color: 'green',
            foot: eventsJoined !== null ? `${eventsJoined} event${eventsJoined === 1 ? '' : 's'} registered` : undefined,
        },
    ];

    const statTiles = [
        { icon: Ticket, value: eventsJoined, label: 'Events joined' },
        ...(ambassadorApproved ? [{ icon: Trophy, value: ambassadorRank, label: 'Leaderboard rank', prefix: '#' }] : []),
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
                <div className="mb-10">
                    <span className="text-primary font-medium text-sm uppercase tracking-wider block mb-3">
                        Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">What would you like to do?</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Everything on Ignite Room starts here: events, the Ambassador Program, and hosting tools.
                    </p>
                </div>

                {statTiles.some((s) => s.value !== null) && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-wrap gap-8 mb-10 pb-8 border-b border-border/50"
                    >
                        {statTiles.filter((s) => s.value !== null).map((s) => (
                            <div key={s.label} className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                                    <s.icon className="w-4.5 h-4.5 text-primary" />
                                </span>
                                <div>
                                    <div className="text-2xl font-heading font-bold text-foreground">{'prefix' in s && s.prefix ? s.prefix : ''}{s.value}</div>
                                    <div className="text-sm text-muted-foreground">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                <div className="grid sm:grid-cols-2 gap-6">
                    {cards.map((card, index) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.08 }}
                        >
                            <Link
                                to={card.to}
                                className={`group relative rounded-md bg-gradient-to-br ${CARD_STYLES[card.color]} border border-border/60 p-6 transition-all flex flex-col h-full overflow-hidden`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${ICON_STYLES[card.color]}`}>
                                        <card.icon className="w-6 h-6" />
                                    </div>
                                    {card.badge && (
                                        <span className={`text-sm font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${BADGE_STYLES[card.color]}`}>
                                            {card.badge}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-heading font-semibold text-xl text-foreground mb-2">{card.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{card.description}</p>
                                <div className="flex items-center justify-between">
                                    {card.foot ? (
                                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                            <ListChecks className="w-3.5 h-3.5" /> {card.foot}
                                        </span>
                                    ) : <span />}
                                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                                        {card.cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
