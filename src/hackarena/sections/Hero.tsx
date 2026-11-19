import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, MousePointer2 } from 'lucide-react';
import { track } from '@vercel/analytics';
import igniteLogo from '@/assets/ignite-logo.png';
import { HA, HA_BASE, HA_DATES, HAPhase, currentMilestone } from '../config';
import { Countdown, GhostButton, GridGlow, Marquee, PrimaryButton, Serif, SponsorLogo, Sticker } from '../components/bits';
import { useSectionNav } from '../components/HALayout';
import type { Sponsor } from '../api';

const TRACK = [
  { label: 'applications close', date: '5 Jan', at: HA_DATES.applicationsClose },
  { label: 'first campus round', date: '10 Feb', at: HA_DATES.roundsStart },
  { label: 'grand finale', date: '19 Jun', at: HA_DATES.finaleStart },
];

const PHASE_PILL: Record<HAPhase, string> = {
  pre: 'College applications open 25 Nov 2026',
  open: 'College applications are open',
  closed: 'Campus rounds start 10 Feb 2027',
  rounds: 'Campus rounds are live',
  finale: 'Grand Finale is live in Bangalore',
  done: 'Thank you for a great season',
};

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 26, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] as const },
});

/** Circular text that slowly spins around the flame. */
function SpinBadge() {
  const text = 'campus edition ✦ idea → prototype → bangalore ✦ 36 hours ✦ ';
  return (
    <svg viewBox="0 0 200 200" className="ha-spin-slow absolute inset-0 h-full w-full text-foreground/55" aria-hidden>
      <defs>
        <path id="ha-circle" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
      </defs>
      <text className="ha-mono" fontSize="10.5" fill="currentColor">
        <textPath href="#ha-circle" textLength="506" lengthAdjust="spacing">{text}</textPath>
      </text>
    </svg>
  );
}

export default function Hero({ phase, titleSponsor }: { phase: HAPhase; titleSponsor?: Sponsor }) {
  const goTo = useSectionNav();
  const milestone = currentMilestone(phase);
  const now = Date.now();
  const applyFirst = phase === 'pre' || phase === 'open';
  const playground = useRef<HTMLDivElement>(null);

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-14 md:pt-36 md:pb-20">
      <GridGlow />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.12fr_0.88fr] gap-10 lg:gap-12 items-center">
        <div>
          <motion.div {...rise(0)} className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {PHASE_PILL[phase]}
          </motion.div>

          <h1 className="mt-6 font-heading font-extrabold">
            <span className="sr-only">{HA.name} · {HA.edition}</span>
            <motion.span {...rise(0.08)} aria-hidden className="block text-[3.7rem] sm:text-[5.5rem] lg:text-[7.25rem] leading-[0.86] tracking-[-0.055em] text-foreground">
              HackArena
            </motion.span>
            <motion.span {...rise(0.16)} aria-hidden className="mt-1 flex flex-wrap items-baseline gap-x-3 sm:gap-x-4">
              <span className="text-[2.9rem] sm:text-[4.4rem] lg:text-[5.6rem] leading-none tracking-[-0.05em] text-foreground">2027</span>
              <Serif className="text-[3.3rem] sm:text-[5rem] lg:text-[6.4rem] leading-none text-gradient pr-2">Edition</Serif>
            </motion.span>
          </h1>

          <motion.div {...rise(0.24)} className="mt-5 flex flex-wrap items-center gap-3">
            <span className="ha-mono -rotate-2 rounded-md border-2 border-foreground bg-[#FFE7A3] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-black">
              Campus Edition
            </span>
            <span className="text-sm text-muted-foreground">by <span className="font-bold text-foreground">Ignite Room</span></span>
          </motion.div>

          <motion.p {...rise(0.3)} className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            A national hackathon that <span className="ha-highlight text-foreground font-semibold">starts on your campus</span>. Colleges across India host an
            idea-pitching round, shortlisted teams build a prototype, and the best meet for{' '}
            <Serif className="text-foreground text-[1.15em]">{HA.finaleHours} hours</Serif> in {HA.finaleCity}.
          </motion.p>

          <motion.div {...rise(0.38)} className="mt-8 flex flex-col sm:flex-row gap-3">
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
              <span className="ha-mono text-[11px] lowercase text-muted-foreground">presented by</span>
              {titleSponsor.logoUrl ? (
                <SponsorLogo src={titleSponsor.logoUrl} alt={titleSponsor.name} className="h-9 w-auto max-w-[180px]" />
              ) : (
                <span className="font-heading font-bold text-foreground">{titleSponsor.name}</span>
              )}
            </div>
          )}
        </div>

        <div>
          {/* Sticker playground */}
          <div ref={playground} className="relative mx-auto h-[300px] sm:h-[340px] w-full max-w-[460px]">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.2 }}
                className="relative h-[220px] w-[220px] sm:h-[250px] sm:w-[250px]"
              >
                <SpinBadge />
                <div className="absolute inset-[40px] rounded-full border border-primary/30 bg-card/70 backdrop-blur shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.6)]" />
                <div className="absolute inset-[66px] rounded-full bg-primary/20 blur-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src={igniteLogo} alt="" className="ha-float h-24 sm:h-28 w-auto drop-shadow-[0_10px_30px_hsl(var(--primary)/0.55)]" />
                </div>
              </motion.div>
            </div>

            <Sticker bounds={playground} tone="primary" rotate={-8} delay={0.5} className="left-0 top-6 sm:left-2">₹1.5L prize pool 💸</Sticker>
            <Sticker bounds={playground} tone="butter" rotate={7} delay={0.6} className="right-0 top-2">36h of chaos ☕</Sticker>
            <Sticker bounds={playground} tone="lilac" rotate={-4} delay={0.7} className="left-0 bottom-14">no prototype needed ✌️</Sticker>
            <Sticker bounds={playground} tone="mint" rotate={6} delay={0.8} className="right-2 bottom-20">teams of 2–5 👯</Sticker>
            <Sticker bounds={playground} tone="sky" rotate={-3} delay={0.9} className="left-[24%] bottom-0">bangalore bound ✈️</Sticker>

            <div className="ha-mono pointer-events-none absolute -bottom-6 right-0 flex items-center gap-1 text-[10px] lowercase text-muted-foreground">
              <MousePointer2 className="h-3 w-3" /> psst, the stickers move
            </div>
          </div>

          {/* Ticket-style countdown */}
          <motion.div
            {...rise(0.45)}
            className="ha-ticket mt-10 rounded-[28px] border border-border bg-card/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_30px_80px_-40px_hsl(var(--primary)/0.55)]"
            style={{ ['--notch-y' as string]: '66%' }}
          >
            {milestone ? <Countdown target={milestone.target} label={milestone.label.toLowerCase()} /> : <p className="font-heading text-xl font-bold">{PHASE_PILL[phase]}</p>}
            <div className="my-5 border-t-2 border-dashed border-border" />
            <ol className="grid grid-cols-3 gap-2">
              {TRACK.map((t) => {
                const passed = now > t.at.getTime();
                const active = milestone?.target.getTime() === t.at.getTime();
                return (
                  <li key={t.label}>
                    <div className={`h-1.5 rounded-full ${passed ? 'bg-primary' : active ? 'bg-gradient-to-r from-primary to-primary/15' : 'bg-border'}`} />
                    <div className={`mt-2.5 font-heading text-sm font-extrabold ${active ? 'text-primary' : 'text-foreground'}`}>{t.date}</div>
                    <div className="ha-mono text-[10.5px] lowercase leading-snug text-muted-foreground">{t.label}</div>
                  </li>
                );
              })}
            </ol>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** Two crossing marquee bands under the hero. */
export function HypeBand() {
  const a = ['idea → prototype → bangalore', '36 hours', '₹1.5 lakh cash', 'open innovation', '50 campuses', 'teams of 2–5', 'no prototype needed (yet)'];
  const b = ['campus edition', 'apply 25 nov – 5 jan', 'rounds 10 feb – 25 apr', 'finale 19–20 june', 'hackarena 2027'];
  return (
    <section aria-hidden className="relative h-[140px] sm:h-[160px] overflow-hidden">
      <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-[2.5deg] border-y-2 border-foreground bg-foreground py-2.5">
        <Marquee reverse items={b} itemClassName="ha-mono text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-background" />
      </div>
      <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 -rotate-[2.5deg] border-y-2 border-foreground bg-primary py-3 shadow-[0_20px_50px_-20px_hsl(var(--primary)/0.8)]">
        <Marquee items={a} itemClassName="font-heading text-lg sm:text-2xl font-extrabold lowercase tracking-tight text-primary-foreground" />
      </div>
    </section>
  );
}
