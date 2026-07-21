import { Link } from 'react-router-dom';
import { CalendarDays, Award, Rocket, User as UserIcon, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
    const { user } = useAuth();
    const role = (user?.role || '').toUpperCase();
    const isAmbassador = role === 'AMBASSADOR';
    const ambassadorPending = isAmbassador && user?.accountStatus === 'PENDING';

    const cards = [
        {
            icon: CalendarDays,
            title: 'Events',
            description: 'Browse upcoming hackathons, workshops, and meetups, and register in a few clicks.',
            cta: 'Browse Events',
            to: '/events',
        },
        {
            icon: Award,
            title: 'Ambassador Program',
            description: ambassadorPending
                ? 'Your Campus Ambassador application is under review. We\'ll notify you once it\'s approved.'
                : isAmbassador
                    ? 'Head to your Ambassador Dashboard to track referrals, tasks, and leaderboard rank.'
                    : 'Lead your campus community, run events, and unlock exclusive rewards as a Campus Ambassador.',
            cta: ambassadorPending ? 'View Status' : isAmbassador ? 'Open Dashboard' : 'Apply Now',
            to: ambassadorPending ? '/ambassador/pending' : isAmbassador ? '/ambassador/dashboard' : '/ambassador/signup',
        },
        {
            icon: Rocket,
            title: 'Organize Events',
            description: 'Host your own hackathon or workshop on Ignite Room — manage registrations, rounds, and scoring.',
            cta: 'Organizer Dashboard',
            to: '/events/organizer',
        },
        {
            icon: UserIcon,
            title: 'My Profile',
            description: 'Update your details, avatar, and account information.',
            cta: 'View Profile',
            to: '/ambassador/profile',
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
                <div className="mb-12">
                    <span className="text-primary font-medium text-sm uppercase tracking-wider block mb-3">
                        Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">What would you like to do?</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Everything on Ignite Room — events, the Ambassador Program, and hosting tools — starts here.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                    {cards.map(card => (
                        <Link
                            key={card.title}
                            to={card.to}
                            className="group relative rounded-2xl bg-gradient-card border border-border/60 p-6 hover:border-primary/40 transition-all flex flex-col"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <card.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-heading font-semibold text-xl text-foreground mb-2">{card.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{card.description}</p>
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                                {card.cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
