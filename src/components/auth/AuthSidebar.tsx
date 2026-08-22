import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, CalendarDays } from 'lucide-react';
import igniteLogo from '@/assets/ignite-logo.png';
import heroBadgeLive from '@/assets/figma/hero-badge-live.png';

interface AuthSidebarProps {
    stats: { totalUsers: number; hostedEvents: number } | null;
}

export default function AuthSidebar({ stats }: AuthSidebarProps) {
    return (
        <div className="hidden lg:flex flex-col justify-center w-[42%] px-16 relative z-10">
            <Link to="/" className="flex items-center gap-2.5 mb-3">
                <img src={igniteLogo} alt="Ignite Room" className="h-8 w-auto" />
                <span className="text-xl font-bold text-gradient">Ignite Room</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs mb-14">
                Where developers, builders &amp; innovators meet.
            </p>

            <div className="relative space-y-7">
                <div>
                    <div className="text-5xl font-heading font-bold text-foreground">
                        {stats ? `${stats.totalUsers.toLocaleString()}+` : ' '}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1 uppercase tracking-wider">
                        <Users className="w-3.5 h-3.5" /> Builders active
                    </div>
                </div>
                <div className="h-px bg-border/60 max-w-[180px]" />
                <div>
                    <div className="text-5xl font-heading font-bold text-foreground">
                        {stats ? `${stats.hostedEvents}+` : ' '}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1 uppercase tracking-wider">
                        <CalendarDays className="w-3.5 h-3.5" /> Events hosted
                    </div>
                </div>

                <motion.img
                    src={heroBadgeLive}
                    alt=""
                    aria-hidden="true"
                    initial={{ opacity: 0, y: 10, rotate: -4 }}
                    animate={{ opacity: 1, y: [0, -8, 0], rotate: -4 }}
                    transition={{ opacity: { duration: 0.6, delay: 0.4 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 } }}
                    className="absolute top-1/2 -translate-y-1/2 -right-4 translate-x-full w-36 drop-shadow-xl pointer-events-none select-none hidden xl:block"
                />
            </div>
        </div>
    );
}
