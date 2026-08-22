import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth, redirectPathForUser } from '@/lib/auth-context';
import { api } from '@/lib/api';
import heroDashboardCard from '@/assets/figma/hero-dashboard-card.png';
import heroBadgeLive from '@/assets/figma/hero-badge-live.png';
import heroBadgeCrew from '@/assets/figma/hero-badge-crew.png';

export default function HeroSection() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState<{ totalUsers: number; hostedEvents: number; approvedAmbassadors: number } | null>(null);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <section id="home" className="relative overflow-hidden bg-gradient-hero pt-32 pb-16 md:pt-40 md:pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-16 items-center">
          {/* Copy */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-[0.14em] mb-5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              India&apos;s Builder Community
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-[3.75rem] font-bold leading-[1.08] mb-6 text-foreground"
            >
              Where Developers,<br />
              <em className="italic">Builders</em> &amp; Innovators<br />
              Meet.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base md:text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed"
            >
              Ignite Room is a student-powered ecosystem for the curious ones,
              turning late-night ideas into teams, projects, and real momentum.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12"
            >
              <Button
                variant="default"
                size="lg"
                className="group rounded-full cursor-pointer gap-2"
                onClick={() => navigate(isAuthenticated && user ? redirectPathForUser(user) : '/login')}
              >
                {isAuthenticated && user ? 'Go to Ignite Room' : 'Login to Ignite Room'}
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full gap-2"
                onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore events
                <ChevronDown className="w-4 h-4" />
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex flex-wrap gap-x-10 gap-y-4"
            >
              <div>
                <div className="text-3xl font-heading font-bold text-foreground">{stats ? `${stats.totalUsers.toLocaleString()}+` : '—'}</div>
                <div className="text-sm text-muted-foreground mt-1">members building</div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-foreground">{stats ? `${stats.hostedEvents}+` : '—'}</div>
                <div className="text-sm text-muted-foreground mt-1">live events</div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-foreground">15</div>
                <div className="text-sm text-muted-foreground mt-1">cities connected</div>
              </div>
            </motion.div>
          </div>

          {/* Visual: tilted dashboard-preview card (real exported design assets) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="relative hidden lg:flex items-center justify-center h-[440px]"
          >
            {/* Concentric ring backdrop */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[420px] h-[420px] rounded-full border border-border/60" />
            </div>
            <div className="absolute top-6 left-10 h-1.5 w-1.5 rounded-full bg-primary/60" />
            <div className="absolute bottom-10 right-6 h-1.5 w-1.5 rounded-full bg-primary/60" />

            <img
              src={heroDashboardCard}
              alt="Ignite Room dashboard preview"
              className="relative w-[420px] max-w-full drop-shadow-2xl animate-float"
            />

            <motion.img
              src={heroBadgeLive}
              alt="Live now: Product teardown, 124 builders in room"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-2 right-0 z-20 w-40 drop-shadow-xl"
            />

            <motion.img
              src={heroBadgeCrew}
              alt="New crew formed: AI for good, 5 members"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-4 left-0 z-20 w-40 drop-shadow-xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
