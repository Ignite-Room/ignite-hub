import { motion } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { maskEmail } from '@/lib/utils';
import igniteLogo from '@/assets/ignite-logo.png';
import sparkle from '@/assets/figma/sparkle.png';

interface WelcomeBackSplashProps {
    email: string;
    onContinue: () => void;
}

/** Shown instead of the login form when the visitor already has a live session, matching the Figma "Good to have you back." frame. Follows the site's light/dark theme. */
export default function WelcomeBackSplash({ email, onContinue }: WelcomeBackSplashProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px]" />
            </div>

            <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 z-10">
                <img src={igniteLogo} alt="Ignite Room" className="h-7 w-auto" />
                <span className="text-foreground font-bold">Ignite Room</span>
            </Link>
            <Link to="/" aria-label="Close" className="absolute top-6 right-6 z-10 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 text-center px-6 max-w-lg"
            >
                <img src={sparkle} alt="" aria-hidden="true" className="w-7 h-7 mx-auto mb-6" />
                <span className="font-body text-primary font-bold text-xs uppercase tracking-[0.2em] block mb-4">Welcome back</span>
                <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground leading-[1.1] mb-5">
                    Good to have<br /><em className="font-serif italic font-normal">you back.</em>
                </h1>
                <p className="text-muted-foreground text-sm mb-10">
                    Signed in as {maskEmail(email)}. Your session is still signed in.
                </p>
                <Button onClick={onContinue} size="lg" className="rounded-full gap-2 px-8 h-12">
                    Enter the room <ArrowUpRight className="w-4 h-4" />
                </Button>
            </motion.div>
        </div>
    );
}
