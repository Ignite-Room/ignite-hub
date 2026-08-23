import { Suspense, lazy, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Smartphone, ArrowLeft, Flame, Hammer, Bell,
    Apple, Bot, Rocket, ArrowRight, CheckCircle2, Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Logo3DStatic = lazy(() => import('@/components/Logo3DStatic'));

const floatingParticles = [
    { delay: 0, x: '10%', size: 4 },
    { delay: 0.5, x: '25%', size: 3 },
    { delay: 1, x: '45%', size: 5 },
    { delay: 0.3, x: '65%', size: 3 },
    { delay: 0.8, x: '80%', size: 4 },
    { delay: 1.5, x: '90%', size: 2 },
];

const cards = [
    { title: 'iOS App', desc: 'Native App Store release', Icon: Apple },
    { title: 'Android App', desc: 'Native Play Store release', Icon: Bot },
    { title: 'Early Access', desc: 'Beta testing coming soon', Icon: Rocket },
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function AppComingSoon() {
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [alreadySubscribed, setAlreadySubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notifyError, setNotifyError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleNotifyClick = () => {
        setNotifyOpen(true);
        setTimeout(() => inputRef.current?.focus(), 120);
    };

    const handleSubmit = async () => {
        if (!email.trim() || !email.includes('@')) return;
        setLoading(true);
        setNotifyError('');
        try {
            const res = await fetch(`${API_BASE}/notify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Something went wrong');
            setAlreadySubscribed(data.exists === true);
            setSubmitted(true);
        } catch (err: unknown) {
            setNotifyError(err instanceof Error ? err.message : 'Failed to subscribe. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
    };


    return (
        <div className="relative min-h-screen bg-background overflow-hidden flex flex-col items-center justify-center px-6 py-24">

            {/* 3D logo background */}
            <Suspense fallback={null}>
                <Logo3DStatic />
            </Suspense>

            {/* Background glows */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Floating particles */}
            {floatingParticles.map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute bottom-0 rounded-full bg-primary/40"
                    style={{ left: p.x, width: p.size, height: p.size }}
                    animate={{ y: [0, '-100vh'], opacity: [0, 0.8, 0] }}
                    transition={{ delay: p.delay, duration: 6 + i, repeat: Infinity, ease: 'linear' }}
                />
            ))}

            {/* Back button */}
            <motion.div
                className="absolute top-8 left-8 z-20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                    <Link to="/">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </Button>
            </motion.div>

            {/* Content */}
            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">

                {/* Phone icon */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="flex justify-center"
                >
                    <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center shadow-[0_0_60px_hsl(345_100%_59%_/_0.2)]">
                        <Smartphone className="w-12 h-12 text-primary" />
                        <motion.div
                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        >
                            <Hammer className="w-4 h-4 text-white" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Label */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30"
                >
                    <Flame className="w-3.5 h-3.5 text-primary" />
                    <span className="text-primary font-semibold text-xs uppercase tracking-widest">In Development</span>
                </motion.div>

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="space-y-4"
                >
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                        We're Building{' '}
                        <span className="text-gradient">Something</span>
                        <br />Incredible
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
                        The Ignite Room app is currently in the works. Our team is crafting
                        an experience that puts the entire community right in your pocket.
                    </p>
                </motion.div>

                {/* Progress bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-sm mx-auto space-y-2"
                >
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>App development progress</span>
                        <span className="text-primary font-semibold">~60%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-pink-400 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: '60%' }}
                            transition={{ delay: 0.7, duration: 1.2, ease: 'easeOut' }}
                        />
                    </div>
                </motion.div>

                {/* Platform cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid sm:grid-cols-3 gap-4 text-left"
                >
                    {cards.map(({ title, desc, Icon }) => (
                        <div key={title} className="p-4 rounded-xl bg-secondary/40 border border-border/50 space-y-2">
                            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground text-sm">{title}</h3>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                    ))}
                </motion.div>

                {/* CTA — notify me */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 }}
                    className="flex flex-col items-center gap-4"
                >
                    <AnimatePresence mode="wait">

                        {/* Default: just the button */}
                        {!notifyOpen && !submitted && (
                            <motion.div
                                key="btn"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex flex-col sm:flex-row items-center gap-4"
                            >
                                <Button
                                    variant="hero"
                                    size="lg"
                                    className="gap-2"
                                    onClick={handleNotifyClick}
                                >
                                    <Bell className="w-4 h-4" />
                                    Notify Me at Launch
                                </Button>
                                <Button asChild variant="outline" size="lg">
                                    <Link to="/">Back to Homepage</Link>
                                </Button>
                            </motion.div>
                        )}

                        {/* Email input box */}
                        {notifyOpen && !submitted && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className="w-full max-w-md"
                            >
                                <div className="flex items-center gap-0 rounded-md border border-primary/40 bg-secondary/60 backdrop-blur-sm shadow-[0_0_40px_hsl(345_100%_59%_/_0.1)] overflow-hidden px-4 py-1.5">
                                    <Bell className="w-4 h-4 text-primary shrink-0" />
                                    <input
                                        ref={inputRef}
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Enter your email address…"
                                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground px-3 py-2.5 outline-none"
                                    />
                                    <motion.button
                                        onClick={handleSubmit}
                                        whileHover={!loading ? { scale: 1.1 } : {}}
                                        whileTap={!loading ? { scale: 0.95 } : {}}
                                        className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 disabled:opacity-40 transition-colors hover:bg-primary/80"
                                        disabled={!email.includes('@') || loading}
                                        aria-label="Submit"
                                    >
                                        {loading
                                            ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                                            : <ArrowRight className="w-4 h-4 text-white" />}
                                    </motion.button>
                                </div>
                                {notifyError && (
                                    <p className="text-xs text-destructive mt-2 text-center">{notifyError}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    We'll ping you as soon as the app is ready. No spam, ever.
                                </p>
                            </motion.div>
                        )}

                        {/* Confirmation */}
                        {submitted && (
                            <motion.div
                                key="confirm"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className="flex flex-col items-center gap-3 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                                    className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center"
                                >
                                    <CheckCircle2 className="w-7 h-7 text-primary" />
                                </motion.div>
                                <p className="text-lg font-semibold text-foreground">
                                    {alreadySubscribed ? 'Already on the list!' : "You're on the list!"}
                                </p>
                                <p className="text-sm text-muted-foreground max-w-xs">
                                    {alreadySubscribed
                                        ? <><span className="text-primary font-medium">{email}</span> is already subscribed. We'll notify you when the app goes live!</>
                                        : <>We'll notify <span className="text-primary font-medium">{email}</span> the moment the Ignite Room app goes live.</>}
                                </p>
                                <Button asChild variant="outline" size="sm" className="mt-2">
                                    <Link to="/">Back to Homepage</Link>
                                </Button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </motion.div>

            </div>
        </div>
    );
}
