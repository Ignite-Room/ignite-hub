import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Flame, Trophy, Star, Users, ArrowRight, Zap,
    CheckCircle2, Gift, Camera, Link as LinkIcon
} from 'lucide-react';
import igniteLogo from '@/assets/ignite-logo.png';
import { Button } from '@/components/ui/button';
import AmbassadorChatbot from '@/components/AmbassadorChatbot';

const perks = [
    { icon: Trophy, title: 'Compete on Leaderboard', desc: 'Top ambassadors win exclusive Ignite Room merchandise and recognition.' },
    { icon: Zap, title: 'Earn Points Fast', desc: 'Every verified task and external referral boosts your score instantly.' },
    { icon: Users, title: 'Build Your Network', desc: 'Connect with passionate hackers and builders across campuses.' },
    { icon: Gift, title: 'Exclusive Rewards', desc: 'Unlock perks, certificates, and direct access to Ignite Room events.' },
];

const steps = [
    { n: '01', title: 'Sign Up', desc: 'Create your ambassador account and get your unique referral link instantly.' },
    { n: '02', title: 'Spread the Word', desc: 'Share your referral link with your college network on WhatsApp, Instagram, LinkedIn.' },
    { n: '03', title: 'Complete Tasks', desc: 'Star the Daytona GitHub repo, upload proof via your referral link.' },
    { n: '04', title: 'Climb the Ranks', desc: 'Every verified submission and external referral adds to your leaderboard score.' },
];

const faqs = [
    { q: 'Who can be a Campus Ambassador?', a: 'Any college student in India who is passionate about tech and hackathons. No prior experience needed!' },
    { q: 'How are points calculated?', a: 'Total Score = Verified Task Submissions + External Referrals (from Unstop/other platforms). The leaderboard updates in real-time.' },
    { q: 'When will winners be announced?', a: 'Winners will be announced after the hackathon concludes. Top ambassadors will be contacted directly.' },
    { q: 'Is there a cost to join?', a: 'Absolutely free. Sign up, share your link, and start earning points immediately.' },
];

export default function AmbassadorLanding() {
    return (
        <>
            <div className="min-h-screen bg-background text-foreground font-sans">
                {/* Background glow */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[80px]" />
                </div>

                {/* ── Navbar ─────────────────────────────────────────────────── */}
                <nav className="relative z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl sticky top-0">
                    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <img
                                src={igniteLogo}
                                alt="Ignite Room"
                                className="h-8 w-auto group-hover:scale-105 transition-transform"
                            />
                            <span className="font-bold tracking-tight text-gradient">Ignite Room</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Link to="/ambassador/leaderboard">
                                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                                    <Trophy className="w-4 h-4" /> Leaderboard
                                </Button>
                            </Link>
                            <Link to="/ambassador/login">
                                <Button variant="outline" size="sm" className="border-border/50">Log In</Button>
                            </Link>
                            <Link to="/ambassador/signup">
                                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white gap-1.5">
                                    Join Now <ArrowRight className="w-3.5 h-3.5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* ── Hero ───────────────────────────────────────────────────── */}
                <section className="relative z-10 pt-24 pb-20 px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
                        >
                            <Flame className="w-4 h-4" />
                            Campus Ambassador Program 2026
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
                            Represent{' '}
                            <span className="text-gradient">Ignite Room</span>
                            <br />at Your Campus
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                            Become the face of Ignite Room at your college. Spread the word about our upcoming hackathon,
                            earn points for every referral, and compete for top spot on the leaderboard.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/ambassador/signup">
                                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white gap-2 text-base px-8 h-12 shadow-lg shadow-primary/20">
                                    <Zap className="w-5 h-5" /> Become an Ambassador
                                </Button>
                            </Link>
                            <Link to="/ambassador/leaderboard">
                                <Button size="lg" variant="outline" className="gap-2 text-base px-8 h-12 border-border/50">
                                    <Trophy className="w-5 h-5" /> View Leaderboard
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
                                { val: <Flame className="w-7 h-7 mx-auto text-orange-500" />, label: 'Hackathon by Ignite Room' },
                                { val: <Trophy className="w-7 h-7 mx-auto text-amber-400" />, label: 'Real Prizes & Perks' },
                            ].map(s => (
                                <div key={s.label} className="text-center">
                                    <div className="text-2xl font-bold text-foreground">{s.val}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </section>

                {/* ── How it Works ───────────────────────────────────────────── */}
                <section className="relative z-10 py-20 px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-14">
                            <span className="text-primary text-sm font-semibold uppercase tracking-widest">How It Works</span>
                            <h2 className="text-3xl md:text-4xl font-bold mt-2">Four simple steps to the top</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {steps.map((s, i) => (
                                <motion.div
                                    key={s.n}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card rounded-2xl p-6 border border-border/50 relative overflow-hidden group hover:border-primary/30 transition-colors"
                                >
                                    <div className="text-4xl font-black text-primary/15 absolute top-4 right-4 font-mono">{s.n}</div>
                                    <div className="text-2xl font-bold text-primary mb-2">{s.n}</div>
                                    <h3 className="font-bold text-foreground mb-2">{s.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Perks ──────────────────────────────────────────────────── */}
                <section className="relative z-10 py-20 px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-14">
                            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Why Join</span>
                            <h2 className="text-3xl md:text-4xl font-bold mt-2">Perks of being an Ambassador</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {perks.map((p, i) => (
                                <motion.div
                                    key={p.title}
                                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card rounded-2xl p-6 border border-border/50 flex gap-4 hover:border-primary/30 transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <p.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground mb-1">{p.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Task Highlight ─────────────────────────────────────────── */}
                <section className="relative z-10 py-20 px-4">
                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="glass-card rounded-2xl p-8 border border-primary/20 bg-primary/[0.03] text-center"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-5">
                                <Star className="w-7 h-7 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-3">Current Active Task</h2>
                            <p className="text-muted-foreground mb-5 leading-relaxed">
                                Star the <strong className="text-foreground">daytonaio/daytona</strong> repository on GitHub and upload a screenshot as proof via your referral link. Each verified submission earns you <strong className="text-primary">+1 point</strong>.
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center mb-6">
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 text-sm text-foreground border border-border/50"><Star className="w-3.5 h-3.5 text-amber-400" /> Star the Repo</span>
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 text-sm text-foreground border border-border/50"><Camera className="w-3.5 h-3.5 text-muted-foreground" /> Screenshot Proof</span>
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 text-sm text-foreground border border-border/50"><LinkIcon className="w-3.5 h-3.5 text-primary" /> Share Your Link</span>
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 text-sm text-foreground border border-border/50"><Trophy className="w-3.5 h-3.5 text-amber-500" /> Earn Points</span>
                            </div>
                            <Link to="/ambassador/signup">
                                <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                                    <Zap className="w-4 h-4" /> Start Earning Now
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* ── FAQ ────────────────────────────────────────────────────── */}
                <section className="relative z-10 py-20 px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
                        </div>
                        <div className="space-y-3">
                            {faqs.map((f, i) => (
                                <motion.div
                                    key={f.q}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card rounded-xl p-5 border border-border/50"
                                >
                                    <div className="flex gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-foreground mb-1">{f.q}</p>
                                            <p className="text-sm text-muted-foreground">{f.a}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ────────────────────────────────────────────────────── */}
                <section className="relative z-10 py-24 px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="glass-card rounded-3xl p-12 border border-primary/20"
                            style={{ background: 'radial-gradient(ellipse at center, hsl(345 100% 59% / 0.06) 0%, transparent 70%)' }}
                        >
                            <Flame className="w-12 h-12 text-primary mx-auto mb-5" />
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Ignite?</h2>
                            <p className="text-muted-foreground mb-8 text-lg">
                                Join the campus ambassador program today and represent Ignite Room at your college.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link to="/ambassador/signup">
                                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white gap-2 px-8 h-12 shadow-lg shadow-primary/20">
                                        <Zap className="w-5 h-5" /> Create Account
                                    </Button>
                                </Link>
                                <Link to="/ambassador/login">
                                    <Button size="lg" variant="outline" className="border-border/50 px-8 h-12">
                                        Already have an account
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
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
