import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { track } from '@vercel/analytics';
import igniteLogo from '@/assets/ignite-logo.png';
import { HA, HA_BASE, HA_DATES, HAPhase, currentMilestone } from '../config';
import { Countdown, GhostButton, GridGlow, PrimaryButton, SponsorLogo } from '../components/bits';
import { useSectionNav } from '../components/HALayout';
import type { Sponsor } from '../api';

const TRACK = [
  { label: 'Applications close', date: '5 Jan', at: HA_DATES.applicationsClose },
  { label: 'First campus round', date: '10 Feb', at: HA_DATES.roundsStart },
  { label: 'Grand Finale', date: '19 Jun', at: HA_DATES.finaleStart },
];

const PHASE_PILL: Record<HAPhase, string> = {
  pre: 'College applications open 25 Nov 2026',
  open: 'College applications are open',
  closed: 'Campus rounds start 10 Feb 2027',
  rounds: 'Campus rounds are live',
  finale: 'Grand Finale is live in Bangalore',
  done: 'Thank you for a great season',
};

export default function Hero({ phase, titleSponsor }: { phase: HAPhase; titleSponsor?: Sponsor }) {
  const goTo = useSectionNav();
  const milestone = currentMilestone(phase);
  const now = Date.now();
  const applyFirst = phase === 'pre' || phase === 'open';

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <GridGlow />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-10 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {PHASE_PILL[phase]}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="mt-6 font-heading font-extrabold leading-[0.92] tracking-[-0.04em]"
          >
            <span className="sr-only">{HA.name} · {HA.edition}</span>
            <span aria-hidden className="block text-[3.4rem] sm:text-7xl lg:text-[6.5rem] text-foreground">HackArena</span>
            <span aria-hidden className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="text-[2.6rem] sm:text-6xl lg:text-[5rem] text-gradient">2027 Edition</span>
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mt-5 inline-flex items-center gap-3"
          >
            <span className="rounded-md border border-border bg-card/70 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">Campus Edition</span>
            <span className="text-sm text-muted-foreground">by Ignite Room</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            A national hackathon that starts on your campus. Colleges across India host an idea-pitching round, shortlisted teams
            build a prototype, and the best meet for {HA.finaleHours} hours in {HA.finaleCity}.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            {applyFirst ? (
              <>
                <PrimaryButton to={`${HA_BASE}/apply`} onClick={() => track('ha_apply_click', { where: 'hero' })}>Apply as a college</PrimaryButton>
                <GhostButton onClick={() => goTo('campuses')}>Find your campus <ChevronDown className="h-4 w-4" /></GhostButton>
              </>
            ) : (
              <>
                <PrimaryButton onClick={() => goTo('campuses')}>Find your campus</PrimaryButton>
                <GhostButton onClick={() => goTo('how-it-works')}>How it works <ChevronDown className="h-4 w-4" /></GhostButton>
              </>
            )}
          </motion.div>

          {titleSponsor && (
            <div className="mt-10 flex items-center gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Presented by</span>
              {titleSponsor.logoUrl ? (
                <SponsorLogo src={titleSponsor.logoUrl} alt={titleSponsor.name} className="h-9 w-auto max-w-[180px]" />
              ) : (
                <span className="font-heading font-bold text-foreground">{titleSponsor.name}</span>
              )}
            </div>
          )}
        </div>

        {/* Emblem + countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative"
        >
          <div className="relative mx-auto hidden lg:flex h-[260px] w-[260px] items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-border/70" />
            <div className="absolute inset-8 rounded-full border border-primary/25" />
            <div className="absolute inset-16 rounded-full bg-primary/15 blur-2xl" />
            <img src={igniteLogo} alt="" className="relative h-36 w-auto animate-glow-pulse" />
            <span className="absolute -right-2 top-10 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] text-foreground">36H</span>
            <span className="absolute -left-4 bottom-12 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] text-foreground">₹1.5L</span>
          </div>

          <div className="lg:mt-6 rounded-2xl border border-border/80 bg-card/50 backdrop-blur-xl p-5 sm:p-6 shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.45)]">
            {milestone ? (
              <Countdown target={milestone.target} label={milestone.label} />
            ) : (
              <p className="font-heading text-xl font-bold">{PHASE_PILL[phase]}</p>
            )}
            <ol className="mt-6 grid grid-cols-3 gap-2">
              {TRACK.map((t, i) => {
                const passed = now > t.at.getTime();
                const active = milestone?.target.getTime() === t.at.getTime();
                return (
                  <li key={t.label} className="relative">
                    <div className={`h-1 rounded-full ${passed ? 'bg-primary' : active ? 'bg-gradient-to-r from-primary to-primary/20' : 'bg-border'}`} />
                    <div className={`mt-2.5 text-[11px] font-semibold uppercase tracking-wide ${active ? 'text-primary' : passed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {t.date}
                    </div>
                    <div className="text-xs text-muted-foreground leading-snug">{t.label}</div>
                    <span className="sr-only">{i + 1} of {TRACK.length}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
