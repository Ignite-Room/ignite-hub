import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import igniteLogo from '@/assets/ignite-logo.png';

export default function PendingApprovalPage() {
    const location = useLocation();
    const state = location.state as { name?: string; college?: string } | null;

    // Scroll to top
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md text-center relative"
            >
                <div className="glass-card rounded-2xl p-10 border border-border/50 shadow-2xl">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <img src={igniteLogo} alt="Ignite Room" className="h-10 w-auto" />
                    </div>

                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
                        <Clock className="w-8 h-8 text-amber-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-foreground mb-2">Application Received!</h1>
                    {state?.name && (
                        <p className="text-primary font-medium mb-3">Hi {state.name} 👋</p>
                    )}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                        Your campus ambassador application{state?.college ? ` from ${state.college}` : ''} has been submitted successfully.
                        Our team will review your details and get back to you shortly.
                    </p>

                    {/* Steps */}
                    <div className="space-y-3 text-left mb-8">
                        {[
                            { icon: CheckCircle2, label: 'Application submitted', done: true },
                            { icon: Clock, label: 'Admin review in progress', done: false },
                            { icon: Mail, label: 'You\'ll be notified when approved', done: false },
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-green-500/20 text-green-400' : 'bg-muted/50 text-muted-foreground'}`}>
                                    <step.icon className="w-3.5 h-3.5" />
                                </div>
                                <span className={`text-sm ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <Link to="/ambassador/login">
                            <Button variant="outline" className="w-full border-border/50">Check Login Status</Button>
                        </Link>
                        <Link to="/ambassador">
                            <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground text-sm">← Back to Ambassador Program</Button>
                        </Link>
                    </div>

                    <p className="mt-6 text-xs text-muted-foreground">
                        Questions? Email us at{' '}
                        <a href="mailto:hello@igniteroom.in" className="text-primary hover:underline">hello@igniteroom.in</a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
