import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DISMISS_KEY = 'ignite_intern_popup_dismissed';

export default function InternRecruitmentPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (sessionStorage.getItem(DISMISS_KEY)) return;
        const timer = setTimeout(() => setIsOpen(true), 2200);
        return () => clearTimeout(timer);
    }, []);

    const dismiss = () => {
        sessionStorage.setItem(DISMISS_KEY, '1');
        setIsOpen(false);
    };

    const apply = () => {
        dismiss();
        navigate('/careers');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    className="fixed bottom-5 left-5 right-5 z-50 sm:left-auto sm:w-[380px]"
                >
                    <div className="glass-card relative overflow-hidden rounded-2xl p-5 shadow-2xl shadow-black/40">
                        {/* Top accent line */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

                        <button
                            onClick={dismiss}
                            aria-label="Dismiss announcement"
                            className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                <Smartphone className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0 pr-6">
                                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                                    We're hiring
                                </p>
                                <h3 className="mt-1 font-heading text-base font-bold leading-snug text-foreground">
                                    The Ignite Room app is launching soon
                                </h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                    Join the launch team as an App Dev Intern and ship a real product with us.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            <Button size="sm" onClick={apply} className="group flex-1">
                                Apply now
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={dismiss} className="text-muted-foreground">
                                Maybe later
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
