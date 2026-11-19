import { motion } from 'framer-motion';
import { ArrowRight, Check, Clock, IndianRupee, Lock, MapPin, Trophy } from 'lucide-react';
import { track } from '@vercel/analytics';
import RevealOnScroll from '@/components/design-system/RevealOnScroll';
import { HA, HA_BASE, HAPhase } from '../config';
import { COLLEGE_DUTIES, KEY_DATES, STAGES, WHY_HOST } from '../content';
import { GhostButton, Marquee, PrimaryButton, Section, SectionHeading, Serif, SponsorLogo, Squiggle } from '../components/bits';
import type { Sponsor } from '../api';

// ── How it works ───────────────────────────────────────────────────────────

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <SectionHeading
        n="01"
        eyebrow="how it works"
        title={<>Three stages, from your campus <Serif className="text-gradient pr-1">to <Squiggle>Bangalore.</Squiggle></Serif></>}
        lead="Every team starts at their own college. The best ideas get built, and the best builds go to the Grand Finale."
      />
      <div className="grid gap-5 md:grid-cols-3">
        {STAGES.map((s, i) => (
          <RevealOnScroll key={s.n} delay={i * 0.12} className="relative">
            <motion.div
              whileHover={{ y: -8, rotate: i === 1 ? 1 : -1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="ha-wiggle-hover group relative h-full overflow-hidden rounded-[28px] border border-border bg-card p-6 md:p-7"
            >
              <span aria-hidden className="ha-outline pointer-events-none absolute -right-3 -top-6 font-heading text-[7.5rem] font-extrabold leading-none tracking-[-0.06em] transition-colors group-hover:[-webkit-text-stroke-color:hsl(var(--primary)/0.5)]">
                {s.n}
              </span>
              <span className="ha-wiggle-target relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background text-2xl">{s.emoji}</span>
              <div className="ha-mono relative mt-6 text-[11px] lowercase text-muted-foreground">stage {i + 1} / 3</div>
              <h3 className="relative mt-1 font-heading text-[1.7rem] font-extrabold tracking-tight">{s.title}</h3>
              <p className="relative mt-1.5 text-sm font-bold text-primary">{s.when}</p>
              <p className="relative mt-4 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              <p className="relative mt-5 rounded-2xl bg-secondary/70 px-4 py-3 text-sm text-foreground/85 leading-relaxed">{s.detail}</p>
            </motion.div>
            {i < STAGES.length - 1 && (
              <span aria-hidden className="hidden md:flex absolute -right-[18px] top-1/2 z-10 h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-primary">
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </RevealOnScroll>
        ))}
      </div>
    </Section>
  );
}

// ── Key dates ──────────────────────────────────────────────────────────────

export function KeyDates() {
  return (
    <Section id="dates" band>
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28 h-fit">
          <SectionHeading
            n="03"
            eyebrow="key dates"
            title={<>Mark the <Serif className="text-gradient pr-1">calendar.</Serif></>}
            lead="All dates are in IST. Each college picks its own campus round date between 10 February and 25 April 2027."
          />
        </div>
        <ol className="relative ml-3 border-l-2 border-dashed border-border">
          {KEY_DATES.map((d, i) => (
            <RevealOnScroll key={d.title} delay={i * 0.05} className="relative pl-9 pb-10 last:pb-0">
              <span aria-hidden className="absolute -left-[11px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-background">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <div className="ha-mono text-[11px] sm:text-xs lowercase text-primary font-bold">{d.date}</div>
              <div className="mt-1.5 font-heading text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">{d.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{d.body}</div>
            </RevealOnScroll>
          ))}
        </ol>
      </div>
    </Section>
  );
}

// ── Theme ──────────────────────────────────────────────────────────────────

export function Theme({ trackSponsors }: { trackSponsors: Sponsor[] }) {
  const slots = trackSponsors.length > 0 ? trackSponsors : null;
  return (
    <Section id="theme">
      <SectionHeading
        n="04"
        eyebrow="theme"
        title={<>Open <Serif className="text-gradient pr-1">Innovation.</Serif></>}
        lead="Pitch an idea on any problem you care about. Sponsored tracks add focused challenges on top."
      />
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <RevealOnScroll className="relative overflow-hidden rounded-[32px] border-2 border-foreground bg-primary p-8 md:p-10 text-primary-foreground">
          <div aria-hidden className="pointer-events-none absolute -right-6 -bottom-10 text-[11rem] leading-none opacity-20 rotate-12 select-none">💡</div>
          <span className="ha-mono text-xs lowercase opacity-80">(main theme)</span>
          <h3 className="mt-5 font-heading text-4xl md:text-5xl font-extrabold leading-[1.02] tracking-[-0.04em]">
            Any problem.<br /><Serif className="text-[1.1em]">Your idea.</Serif>
          </h3>
          <p className="mt-5 max-w-md leading-relaxed opacity-90">
            Health, climate, education, finance, campus life, something nobody has named yet. If it matters to you and you can explain why, it fits.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {['health', 'climate', 'edtech', 'fintech', 'campus life', 'your call'].map((t, i) => (
              <span key={t} className={`ha-mono rounded-full border border-primary-foreground/40 px-3 py-1 text-xs ${i === 5 ? 'bg-primary-foreground text-primary font-bold' : ''}`}>#{t}</span>
            ))}
          </div>
        </RevealOnScroll>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {slots
            ? [
                ...slots.map((s) => (
                  <RevealOnScroll key={s.name} className="rounded-[24px] border border-border bg-card p-6 flex flex-col justify-between min-h-[140px]">
                    <div className="ha-mono text-[11px] lowercase text-primary">(sponsored track)</div>
                    <div>
                      <div className="mt-3 font-heading text-xl font-extrabold leading-snug">{s.trackName || 'Track'}</div>
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        by {s.logoUrl ? <SponsorLogo src={s.logoUrl} alt={s.name} className="h-5 w-auto max-w-[110px]" /> : <span className="text-foreground">{s.name}</span>}
                      </div>
                    </div>
                  </RevealOnScroll>
                )),
                <div key="more" className="rounded-[24px] border-2 border-dashed border-border p-6 flex flex-col justify-between min-h-[140px]">
                  <Lock className="h-5 w-5 text-primary/70" />
                  <div className="font-heading text-lg font-extrabold text-foreground/80">More tracks dropping soon 👀</div>
                </div>,
              ]
            : [1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  whileHover={{ rotate: i % 2 ? -2 : 2, scale: 1.02 }}
                  className="rounded-[24px] border-2 border-dashed border-border bg-card/50 p-6 flex flex-col justify-between min-h-[140px]"
                >
                  <Lock className="h-5 w-5 text-primary/70" />
                  <div>
                    <div className="ha-mono text-[11px] lowercase text-muted-foreground">(sponsored track 0{i})</div>
                    <div className="mt-1 font-heading text-lg font-extrabold text-foreground/80">dropping soon 👀</div>
                  </div>
                </motion.div>
              ))}
        </div>
      </div>
    </Section>
  );
}

// ── For colleges ───────────────────────────────────────────────────────────

export function ForColleges({ phase }: { phase: HAPhase }) {
  const canApply = phase === 'pre' || phase === 'open';
  return (
    <Section id="colleges" band>
      <SectionHeading
        n="05"
        eyebrow="for colleges"
        title={<>Host a campus round at <Serif className="text-gradient pr-1">your college.</Serif></>}
        lead="For Deans, HODs and faculty coordinators. A Faculty SPOC applies together with a Student Coordinator."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-4 sm:grid-cols-2">
          {WHY_HOST.map((w, i) => (
            <RevealOnScroll key={w.title} delay={i * 0.06}>
              <motion.div whileHover={{ y: -5 }} className="ha-wiggle-hover h-full rounded-[24px] border border-border bg-card p-6">
                <span className="ha-wiggle-target inline-block text-3xl">{w.emoji}</span>
                <h3 className="mt-4 font-heading text-lg font-extrabold leading-snug tracking-tight">{w.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{w.body}</p>
              </motion.div>
            </RevealOnScroll>
          ))}
        </div>
        <RevealOnScroll className="relative rounded-[28px] border-2 border-foreground bg-card p-6 md:p-8 flex flex-col shadow-[6px_6px_0_0_hsl(var(--foreground))]">
          <span className="ha-mono absolute -top-3 left-6 rotate-[-3deg] rounded-md border-2 border-foreground bg-[#C6F1DA] px-2 py-0.5 text-[11px] font-bold lowercase text-black">your to-do list</span>
          <h3 className="mt-2 font-heading text-2xl font-extrabold tracking-tight">What your college does</h3>
          <ul className="mt-5 space-y-3.5">
            {COLLEGE_DUTIES.map((d, i) => (
              <motion.li
                key={d}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * i }}
                className="flex gap-3 text-sm text-foreground/90 leading-relaxed"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
                {d}
              </motion.li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">Ignite Room does not fund campus rounds. They are simple idea-pitching events, hosted entirely by the college.</p>
          <div className="mt-auto pt-7 flex flex-col sm:flex-row gap-3">
            {canApply ? (
              <PrimaryButton to={`${HA_BASE}/apply`} onClick={() => track('ha_apply_click', { where: 'colleges' })}>Apply as a college</PrimaryButton>
            ) : (
              <span className="inline-flex items-center rounded-full border border-border px-5 py-3 text-sm text-muted-foreground">Applications closed on 5 Jan 2027</span>
            )}
            <GhostButton to={`${HA_BASE}/rules`}>Read the rule book</GhostButton>
          </div>
        </RevealOnScroll>
      </div>
    </Section>
  );
}

// ── Grand Finale ───────────────────────────────────────────────────────────

export function Finale({ hasFinalists }: { hasFinalists: boolean }) {
  const facts = [
    { icon: MapPin, k: 'city', v: HA.finaleCity, sub: 'venue announcing soon' },
    { icon: Clock, k: 'format', v: `${HA.finaleHours} hours`, sub: 'non-stop hackathon' },
    { icon: Trophy, k: 'dates', v: '19–20 June', sub: '2027' },
    { icon: IndianRupee, k: 'prize pool', v: HA.prizePool, sub: 'cash' },
  ];
  return (
    <section id="finale" className="relative scroll-mt-20 overflow-hidden bg-[hsl(0_0%_4%)] text-[hsl(0_0%_96%)]">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_110%,hsl(var(--primary)/0.45),transparent_70%)]" />
      <div aria-hidden className="absolute inset-x-0 top-10 opacity-[0.07]">
        <Marquee items={['BANGALORE', 'GRAND FINALE', '36 HOURS']} itemClassName="font-heading text-[7rem] sm:text-[10rem] font-extrabold tracking-[-0.05em] leading-none" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <RevealOnScroll className="text-center mx-auto max-w-3xl mb-14">
          <span className="ha-mono inline-flex items-center gap-2 text-xs lowercase text-white/60">
            <span className="text-primary font-bold">(06)</span> grand finale <span className="text-primary">✦</span>
          </span>
          <h2 className="mt-5 font-heading text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[0.95] tracking-[-0.045em]">
            36 hours.<br /><Serif className="text-gradient pr-2 text-[1.08em]">One stage.</Serif>
          </h2>
          <p className="mt-5 text-base md:text-lg text-white/65">The teams selected by Ignite Room from campuses across India meet in Bangalore for a 36-hour hackathon.</p>
        </RevealOnScroll>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {facts.map((f, i) => (
            <RevealOnScroll key={f.k} delay={i * 0.08}>
              <motion.div whileHover={{ y: -6, rotate: i % 2 ? 1.5 : -1.5 }} className="h-full rounded-[24px] border border-white/12 bg-white/[0.04] backdrop-blur p-5 sm:p-6">
                <f.icon className="h-5 w-5 text-primary" />
                <div className="ha-mono mt-5 text-[11px] lowercase text-white/50">{f.k}</div>
                <div className="mt-1 font-heading text-2xl sm:text-[2rem] font-extrabold tracking-tight">{f.v}</div>
                <div className="ha-mono mt-1 text-[11px] lowercase text-white/50">{f.sub}</div>
              </motion.div>
            </RevealOnScroll>
          ))}
        </div>
        {hasFinalists && (
          <div className="mt-12 text-center">
            <PrimaryButton to={`${HA_BASE}/finalists`}>See the finalists</PrimaryButton>
          </div>
        )}
      </div>
    </section>
  );
}
