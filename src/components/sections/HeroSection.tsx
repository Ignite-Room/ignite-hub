import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Flame, Trophy, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth, redirectPathForUser } from '@/lib/auth-context';

const stats = [
  { value: '12,000+', label: 'Community members' },
  { value: '20+', label: 'Events hosted' },
  { value: '15+', label: 'Partner organizations' },
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
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-[0.18em] mb-4"
            >
              <Flame className="w-4 h-4" />
              A Student-Driven Tech Community
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-[4rem] font-bold leading-[1.05] mb-5 text-foreground"
            >
              Where Ideas
              <br />
              <em className="italic text-gradient not-italic">Ignite</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base md:text-lg text-muted-foreground max-w-lg mb-7 leading-relaxed"
            >
              Empowering learners, innovators, and builders through hackathons,
              mentorship, and a collaborative ecosystem that turns ideas into reality.
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
                onClick={() => navigate(isAuthenticated && user ? redirectPathForUser(user) : '/login')}
              >
                {isAuthenticated && user ? 'Go to Ignite Room' : 'Join Ignite Room'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Events
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
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
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
                <Trophy className="h-4 w-4 text-primary" />
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground leading-tight">Ambassador tasks</p>
                <p className="text-sm text-muted-foreground leading-tight">new tasks live now</p>
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
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </span>
              </div>

              <p className="text-sm text-muted-foreground">Latest from the community</p>
              <p className="font-heading text-2xl font-bold text-foreground mb-5">Hack the Flame</p>

              <div className="rounded-2xl bg-gradient-card border border-border/60 p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-1">National-level hackathon</p>
                <div className="flex items-center justify-between">
                  <p className="font-heading font-semibold text-foreground">200+ builders in Mumbai</p>
                  <ArrowUpRight className="h-4 w-4 text-primary shrink-0" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-secondary/60 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Campus reach</p>
                  <p className="font-heading font-semibold text-foreground text-sm">15+ chapters nationwide</p>
                </div>
                <Flame className="h-6 w-6 text-primary" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="hidden sm:block relative mt-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <div className="w-1.5 h-3 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
}
