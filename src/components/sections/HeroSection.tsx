import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Bell, Flame, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

const stats = [
  { value: '12,000+', label: 'Community members' },
  { value: '40+', label: 'Events hosted' },
  { value: '15+', label: 'City chapters' },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <section id="home" className="relative overflow-hidden bg-gradient-hero pt-28 pb-10 md:pt-32 md:pb-14">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />

      {/* Radial glow */}
      <div className="absolute top-1/4 right-0 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
          {/* Copy */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 text-primary font-semibold text-xs md:text-sm uppercase tracking-[0.18em] mb-4"
            >
              <Flame className="w-4 h-4" />
              01 / Meet &amp; Build Community
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-[4rem] font-bold leading-[1.05] mb-5 text-foreground"
            >
              Where Developers,
              <br />
              <em className="italic text-gradient">Builders</em> &amp; Innovators
              <br />
              Meet.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base md:text-lg text-muted-foreground max-w-lg mb-7 leading-relaxed"
            >
              Ignite Room is a developer-powered ecosystem for the curious ones — turning late-night ideas into rooms, projects, and real momentum.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-9"
            >
              <Button
                variant="default"
                size="lg"
                className="group rounded-full cursor-pointer"
                onClick={() => navigate(isAuthenticated && user ? '/home' : '/login')}
              >
                {isAuthenticated && user ? 'Go to Ignite Room' : 'Login to Ignite Room'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore events
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="grid grid-cols-3 gap-6 max-w-lg"
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl md:text-3xl font-heading font-bold text-gradient">{stat.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="relative hidden lg:block max-w-md ml-auto"
          >
            <div className="absolute -inset-10 bg-primary/15 blur-[100px] rounded-full pointer-events-none" />

            {/* Floating notification */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 right-2 z-20 flex items-center gap-2 rounded-2xl bg-card border border-border/70 shadow-xl px-4 py-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
                <Sparkles className="h-4 w-4 text-primary" />
              </span>
              <div className="text-left">
                <p className="text-xs font-semibold text-foreground leading-tight">Product livestream</p>
                <p className="text-[11px] text-muted-foreground leading-tight">starts in 10 min</p>
              </div>
            </motion.div>

            {/* Main card */}
            <div className="relative rounded-[2rem] border border-border/70 bg-card shadow-2xl p-6 animate-float">
              <div className="flex items-center justify-between mb-7">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                  <span className="h-3 w-3 rounded-full bg-muted" />
                  <span className="h-3 w-3 rounded-full bg-muted" />
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </span>
              </div>

              <p className="text-sm text-muted-foreground">Good evening,</p>
              <p className="font-heading text-2xl font-bold text-foreground mb-5">Priya 👋</p>

              <div className="rounded-2xl bg-gradient-card border border-border/60 p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Product livestream</p>
                <div className="flex items-center justify-between">
                  <p className="font-heading font-semibold text-foreground">HackArena 2.0 · Bangalore</p>
                  <ArrowUpRight className="h-4 w-4 text-primary shrink-0" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-secondary/60 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">More crew formed</p>
                  <p className="font-heading font-semibold text-foreground text-sm">6 new rooms today</p>
                </div>
                <div className="flex -space-x-2">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-8 w-8 rounded-full bg-primary/20 border-2 border-card" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
