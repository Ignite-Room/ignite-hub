import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Clock, IndianRupee, Lightbulb, MapPin, Sparkles, Trophy } from 'lucide-react';
import { track } from '@vercel/analytics';
import RevealOnScroll from '@/components/design-system/RevealOnScroll';
import { HA, HA_BASE, HAPhase } from '../config';
import { COLLEGE_DUTIES, KEY_DATES, STAGES, WHY_HOST } from '../content';
import { GhostButton, PrimaryButton, Section, SectionHeading, SponsorLogo } from '../components/bits';
import type { Sponsor } from '../api';

// ── How it works ───────────────────────────────────────────────────────────

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <SectionHeading
        n="01"
        eyebrow="How it works"
        title={<>Three stages, from your campus <span className="text-gradient">to Bangalore.</span></>}
        lead="Every team starts at their own college. The best ideas get built, and the best builds go to the Grand Finale."
      />
      <div className="relative grid gap-5 md:grid-cols-3">
        <div aria-hidden className="hidden md:block absolute top-[38px] left-[8%] right-[8%] h-px bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
        {STAGES.map((s, i) => (
          <RevealOnScroll key={s.n} delay={i * 0.1} className="relative">
            <div className="h-full rounded-2xl border border-border/80 bg-card/60 p-6 md:p-7 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/50 bg-background font-mono text-sm font-bold text-primary shadow-[0_0_24px_-4px_hsl(var(--primary)/0.6)]">
                  {s.n}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Stage {i + 1}</span>
              </div>
              <h3 className="mt-6 font-heading text-2xl font-extrabold">{s.title}</h3>
              <p className="mt-1.5 text-sm font-semibold text-primary">{s.when}</p>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              <p className="mt-4 pt-4 border-t border-border/70 text-sm text-foreground/85 leading-relaxed">{s.detail}</p>
            </div>
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
        <SectionHeading
          n="03"
          eyebrow="Key dates"
          title="Mark the calendar."
          lead="All dates are in IST. Each college picks its own campus round date between 10 February and 25 April 2027."
        />
        <ol className="relative border-l border-border/80 ml-2">
          {KEY_DATES.map((d, i) => (
            <RevealOnScroll key={d.title} delay={i * 0.06} className="relative pl-8 pb-9 last:pb-0">
              <span aria-hidden className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />
              <div className="font-mono text-xs uppercase tracking-[0.14em] text-primary">{d.date}</div>
              <div className="mt-1.5 font-heading text-xl font-bold text-foreground">{d.title}</div>
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
      <SectionHeading n="04" eyebrow="Theme" title="Open Innovation." lead="Pitch an idea on any problem you care about. Sponsored tracks add focused challenges on top." />
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <RevealOnScroll className="relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/20 via-card/60 to-card/60 p-8 md:p-10">
          <Lightbulb className="h-9 w-9 text-primary" />
          <h3 className="mt-6 font-heading text-3xl md:text-4xl font-extrabold">Any problem. Your idea.</h3>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-md">
            Health, climate, education, finance, campus life, something nobody has named yet. If it matters to you and you can explain why, it fits.
          </p>
          <div aria-hidden className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-primary/25 blur-3xl" />
        </RevealOnScroll>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {slots
            ? [
                ...slots.map((s) => (
                  <RevealOnScroll key={s.name} className="rounded-2xl border border-border/80 bg-card/60 p-6 flex flex-col justify-between min-h-[132px]">
                    <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Sponsored track</div>
                    <div>
                      <div className="mt-3 font-heading text-xl font-bold leading-snug">{s.trackName || 'Track'}</div>
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        by {s.logoUrl ? <SponsorLogo src={s.logoUrl} alt={s.name} className="h-5 w-auto max-w-[110px]" /> : <span className="text-foreground">{s.name}</span>}
                      </div>
                    </div>
                  </RevealOnScroll>
                )),
                <div key="more" className="rounded-2xl border border-dashed border-border bg-card/30 p-6 flex flex-col justify-between min-h-[132px]">
                  <Sparkles className="h-5 w-5 text-primary/70" />
                  <div className="font-heading text-lg font-bold text-foreground/80">More tracks announcing soon</div>
                </div>,
              ]
            : [1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-dashed border-border bg-card/30 p-6 flex flex-col justify-between min-h-[132px]">
                  <Sparkles className="h-5 w-5 text-primary/70" />
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Sponsored track {i}</div>
                    <div className="mt-1 font-heading text-lg font-bold text-foreground/80">Announcing soon</div>
                  </div>
                </div>
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
        eyebrow="For colleges"
        title={<>Host a campus round at <span className="text-gradient">your college.</span></>}
        lead="For Deans, HODs and faculty coordinators. A Faculty SPOC applies together with a Student Coordinator."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-4 sm:grid-cols-2">
          {WHY_HOST.map((w, i) => (
            <RevealOnScroll key={w.title} delay={i * 0.05} className="rounded-2xl border border-border/80 bg-card/60 p-6">
              <div className="font-mono text-xs text-primary">0{i + 1}</div>
              <h3 className="mt-3 font-heading text-lg font-bold leading-snug">{w.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{w.body}</p>
            </RevealOnScroll>
          ))}
        </div>
        <RevealOnScroll className="rounded-2xl border border-border/80 bg-background/60 p-6 md:p-8 flex flex-col">
          <h3 className="font-heading text-xl font-bold">What your college does</h3>
          <ul className="mt-5 space-y-3.5">
            {COLLEGE_DUTIES.map((d) => (
              <li key={d} className="flex gap-3 text-sm text-foreground/90 leading-relaxed">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"><Check className="h-3.5 w-3.5" /></span>
                {d}
              </li>
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

// ── Campus Leader / Ambassador ─────────────────────────────────────────────

export function CampusLeader() {
  return (
    <Section id="campus-leader">
      <RevealOnScroll className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-8 md:p-12">
        <div aria-hidden className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative grid gap-8 md:grid-cols-[1.3fr_1fr] items-center">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">06 · Campus Leaders</span>
            <h2 className="mt-4 font-heading text-3xl md:text-4xl font-extrabold leading-tight">Bring HackArena to your campus.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl">
              Campus Leaders represent Ignite Room at their college: they get a faculty SPOC on board, spread the word and fill the room on round day.
              It&apos;s free to join. Share your referral link, complete tasks, climb the leaderboard and earn merch, certificates and perks.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <PrimaryButton to={HA.ambassadorUrl}>Become a Campus Leader</PrimaryButton>
            <Link to="/ambassador/leaderboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
              View the leaderboard <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </RevealOnScroll>
    </Section>
  );
}

// ── Grand Finale ───────────────────────────────────────────────────────────

export function Finale({ hasFinalists }: { hasFinalists: boolean }) {
  const facts = [
    { icon: MapPin, k: 'City', v: HA.finaleCity, sub: 'Venue announcing soon' },
    { icon: Clock, k: 'Format', v: `${HA.finaleHours} hours`, sub: 'Non-stop hackathon' },
    { icon: Trophy, k: 'Dates', v: '19–20 June', sub: '2027' },
    { icon: IndianRupee, k: 'Prize pool', v: HA.prizePool, sub: 'Cash' },
  ];
  return (
    <section id="finale" className="relative scroll-mt-20 overflow-hidden border-y border-border/70">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,hsl(var(--primary)/0.28),transparent_70%)]" />
      <div aria-hidden className="absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-heading font-extrabold text-[22vw] leading-none tracking-[-0.06em] text-foreground/[0.03] whitespace-nowrap">
        BANGALORE
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <SectionHeading
          n="07"
          eyebrow="Grand Finale"
          align="center"
          title={<>36 hours. <span className="text-gradient">One stage.</span></>}
          lead="The best teams from campuses across India meet in Bangalore for a 36-hour hackathon."
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {facts.map((f, i) => (
            <RevealOnScroll key={f.k} delay={i * 0.07} className="rounded-2xl border border-border/80 bg-background/70 backdrop-blur p-5 sm:p-6">
              <f.icon className="h-5 w-5 text-primary" />
              <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{f.k}</div>
              <div className="mt-1 font-heading text-2xl sm:text-3xl font-extrabold">{f.v}</div>
              <div className="mt-1 text-xs text-muted-foreground">{f.sub}</div>
            </RevealOnScroll>
          ))}
        </div>
        {hasFinalists && (
          <div className="mt-10 text-center">
            <PrimaryButton to={`${HA_BASE}/finalists`}>See the finalists</PrimaryButton>
          </div>
        )}
      </div>
    </section>
  );
}
