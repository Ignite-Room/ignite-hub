import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Trophy, Users, Zap, CheckCircle2, Gift, ArrowUpRight } from 'lucide-react';
import igniteLogo from '@/assets/ignite-logo.png';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import TaskBoard from '@/components/TaskBoard';
import AmbassadorChatbot from '@/components/AmbassadorChatbot';
import SectionEyebrow from '@/components/design-system/SectionEyebrow';
import RevealOnScroll from '@/components/design-system/RevealOnScroll';
import { useSEO } from '@/hooks/use-seo';

const perks = [
    { icon: Trophy, title: 'Compete on Leaderboard', desc: 'Top ambassadors win exclusive Ignite Room merchandise and recognition.' },
    { icon: Zap, title: 'Earn Points Fast', desc: 'Every verified task and external referral boosts your score instantly.' },
    { icon: Users, title: 'Build Your Network', desc: 'Connect with passionate hackers and builders across campuses.' },
    { icon: Gift, title: 'Exclusive Rewards', desc: 'Unlock perks, certificates, and direct access to Ignite Room events.' },
];

const steps = [
    { n: '01', title: 'Sign Up', desc: 'Create your ambassador account and get your unique referral link instantly.' },
    { n: '02', title: 'Spread the Word', desc: 'Share your referral link with your college network on WhatsApp, Instagram, LinkedIn.' },
    { n: '03', title: 'Complete Tasks', desc: 'When a new task is announced, follow the instructions to earn extra points and climb the ranks.' },
    { n: '04', title: 'Climb the Ranks', desc: 'Every verified submission and external referral adds to your leaderboard score.' },
];

const faqs = [
    { q: 'Who can be a Campus Ambassador?', a: 'Any college student in India who is passionate about tech and hackathons. No prior experience needed!' },
    { q: 'How are points calculated?', a: 'Total Score = Verified Task Submissions + External Referrals (from Unstop/other platforms). The leaderboard updates in real-time.' },
    { q: 'When will winners be announced?', a: 'Winners will be announced after the hackathon concludes. Top ambassadors will be contacted directly.' },
    { q: 'Is there a cost to join?', a: 'Absolutely free. Sign up, share your link, and start earning points immediately.' },
];

export default function AmbassadorLanding() {
    useSEO({
        title: 'Campus Ambassador Program',
        description: 'Become a Campus Ambassador for Ignite Room. Lead your campus community, complete tasks, earn rewards, and climb the leaderboard — free to join.',
        path: '/ambassador',
    });

    return (
        <>
            <div className="min-h-screen bg-background text-foreground font-sans">
                {/* Background glow */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[80px]" />
                </div>

                <Navbar />

                {/* ── Hero ───────────────────────────────────────────────────── */}
                <section className="relative z-10 pt-32 pb-20 px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto"
                    >
                        <motion.span
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-[0.14em] mb-6"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Campus Ambassador Program
                        </motion.span>

                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-[3.75rem] font-bold leading-[1.08] mb-6 text-foreground">
                            Represent <em className="font-serif italic font-normal">Ignite Room</em><br />at Your Campus
                        </h1>

                        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                            Become the face of Ignite Room at your college. Spread the word about our upcoming hackathon,
                            earn points for every referral, and compete for top spot on the leaderboard.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/ambassador/apply">
                                <Button size="lg" className="rounded-full gap-2 text-base px-8 h-12 shadow-lg shadow-primary/20">
                                    Become an Ambassador <ArrowUpRight className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link to="/ambassador/leaderboard">
                                <Button size="lg" variant="outline" className="rounded-full gap-2 text-base px-8 h-12 border-border/50">
                                    <Trophy className="w-4 h-4" /> View Leaderboard
                                </Button>
                            </Link>
                        </div>

                        {/* Stats bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap gap-8 justify-center mt-16 pt-10 border-t border-border/30"
                        >
                            {[
                                { val: '₹0', label: 'Cost to Join' },
                                { val: '100%', label: 'Free to Participate' },
                                { val: <Flame className="w-7 h-7 mx-auto text-primary" />, label: 'Hackathon by Ignite Room' },
                                { val: <Trophy className="w-7 h-7 mx-auto text-amber-400" />, label: 'Real Prizes & Perks' },
                            ].map(s => (
                                <div key={s.label} className="text-center">
                                    <div className="text-2xl font-heading font-bold text-foreground">{s.val}</div>
                                    <div className="text-xs text-muted-foreground mt-1.5 uppercase tracking-wider">{s.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </section>

                {/* ── How it Works ───────────────────────────────────────────── */}
                <section className="relative z-10 section-padding pt-0">
                    <div className="max-w-5xl mx-auto">
                        <RevealOnScroll className="text-center mb-14">
                            <SectionEyebrow index="01" label="How It Works" className="justify-center flex" />
                            <h2 className="font-heading text-3xl md:text-4xl font-bold">Four simple steps to the top</h2>
                        </RevealOnScroll>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {steps.map((s, i) => (
                                <RevealOnScroll key={s.n} delay={i * 0.08}>
                                    <div className="glow-card p-6 h-full hover:border-primary/40 transition-colors group relative">
                                        <div className="text-4xl font-black text-primary/10 absolute top-4 right-4 font-mono">{s.n}</div>
                                        <div className="text-2xl font-heading font-bold text-primary mb-2">{s.n}</div>
                                        <h3 className="font-heading font-semibold text-foreground mb-2">{s.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                                    </div>
                                </RevealOnScroll>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Perks ──────────────────────────────────────────────────── */}
                <section className="relative z-10 section-padding pt-0">
                    <div className="max-w-5xl mx-auto">
                        <RevealOnScroll className="text-center mb-14">
                            <SectionEyebrow index="02" label="Why Join" className="justify-center flex" />
                            <h2 className="font-heading text-3xl md:text-4xl font-bold">Perks of being an Ambassador</h2>
                        </RevealOnScroll>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {perks.map((p, i) => (
                                <RevealOnScroll key={p.title} delay={i * 0.08}>
                                    <div className="glow-card p-6 flex gap-4 h-full hover:border-primary/40 transition-colors group">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                            <p.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-heading font-semibold text-foreground mb-1">{p.title}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                                        </div>
                                    </div>
                                </RevealOnScroll>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Active Tasks ───────────────────────────────────────────── */}
                <section className="relative z-10 section-padding pt-0">
                    <div className="max-w-3xl mx-auto">
                        <RevealOnScroll className="text-center mb-8">
                            <SectionEyebrow index="03" label="Live Right Now" className="justify-center flex" />
                            <h2 className="font-heading text-3xl font-bold">Active Tasks</h2>
                            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                                Once you're an ambassador, share your referral link — anyone who completes a task through it earns you points.
                            </p>
                        </RevealOnScroll>
                        <TaskBoard />
                    </div>
                </section>

                {/* ── FAQ ────────────────────────────────────────────────────── */}
                <section className="relative z-10 section-padding pt-0">
                    <div className="max-w-3xl mx-auto">
                        <RevealOnScroll className="text-center mb-12">
                            <SectionEyebrow index="04" label="FAQ" className="justify-center flex" />
                            <h2 className="font-heading text-3xl font-bold">Frequently Asked Questions</h2>
                        </RevealOnScroll>
                        <div className="space-y-3">
                            {faqs.map((f, i) => (
                                <RevealOnScroll key={f.q} delay={i * 0.05}>
                                    <div className="glow-card p-5">
                                        <div className="flex gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-foreground mb-1">{f.q}</p>
                                                <p className="text-sm text-muted-foreground">{f.a}</p>
                                            </div>
                                        </div>
                                    </div>
                                </RevealOnScroll>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ────────────────────────────────────────────────────── */}
                <section className="relative z-10 section-padding pt-0">
                    <div className="max-w-2xl mx-auto text-center">
                        <RevealOnScroll>
                            <div
                                className="glow-card p-12 relative overflow-hidden"
                            >
                                <div className="glow-card-accent w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                <Flame className="w-12 h-12 text-primary mx-auto mb-5 relative z-10" />
                                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 relative z-10">Ready to Ignite?</h2>
                                <p className="text-muted-foreground mb-8 text-lg relative z-10">
                                    Join the campus ambassador program today and represent Ignite Room at your college.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
                                    <Link to="/ambassador/apply">
                                        <Button size="lg" className="rounded-full gap-2 px-8 h-12 shadow-lg shadow-primary/20">
                                            <Zap className="w-5 h-5" /> Create Account
                                        </Button>
                                    </Link>
                                    <Link to="/login">
                                        <Button size="lg" variant="outline" className="rounded-full border-border/50 px-8 h-12">
                                            Already have an account
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </RevealOnScroll>
                    </div>
                </section>

                {/* ── Footer ─────────────────────────────────────────────────── */}
                <footer className="relative z-10 border-t border-border/30 py-8 px-4">
                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <img src={igniteLogo} alt="Ignite Room" className="h-5 w-auto" />
                            <span>© 2026 Ignite Room. All rights reserved.</span>
                        </div>
                        <div className="flex gap-5">
                            <Link to="/" className="hover:text-foreground transition-colors">Main Site</Link>
                            <Link to="/ambassador/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link>
                            <a href="mailto:admin@igniteroom.in" className="hover:text-foreground transition-colors">Contact</a>
                        </div>
                    </div>
                </footer>
            </div>

            {/* ── AI Chatbot ──────────────────────────────────────────────── */}
            <AmbassadorChatbot />
        </>
    );
}
