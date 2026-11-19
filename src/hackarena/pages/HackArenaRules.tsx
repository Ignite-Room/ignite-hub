import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Download, Printer } from 'lucide-react';
import { track } from '@vercel/analytics';
import { useSEO } from '@/hooks/use-seo';
import RevealOnScroll from '@/components/design-system/RevealOnScroll';
import HALayout from '../components/HALayout';
import { GridGlow, PrimaryButton, Serif } from '../components/bits';
import { HA, HA_BASE, applyIsPrimary, getPhase } from '../config';
import { RULEBOOK } from '../content';

const TOC = [
  { id: 'about', n: '01', label: 'About' },
  { id: 'join', n: '02', label: 'How a college joins' },
  { id: 'participation', n: '03', label: 'Participation' },
  { id: 'hosting', n: '04', label: 'Hosting the round' },
  { id: 'shortlisting', n: '05', label: 'Shortlisting' },
  { id: 'prototype', n: '06', label: 'Prototype round' },
  { id: 'finale', n: '07', label: 'Grand Finale' },
  { id: 'after', n: '08', label: 'Sponsors & reporting' },
  { id: 'checklist', n: '09', label: 'Checklist' },
];

function Chapter({ id, n, kicker, title, children }: { id: string; n: string; kicker: string; title: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-border pt-12 pb-4 first:border-t-0 first:pt-0">
      <RevealOnScroll>
        <div className="ha-mono text-xs lowercase text-primary font-bold">({n}) — {kicker}</div>
        <h2 className="mt-3 font-heading text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] leading-tight">{title}</h2>
      </RevealOnScroll>
      <div className="mt-7 space-y-6">{children}</div>
    </section>
  );
}

function RuleTable({ head, rows }: { head: [string, string]; rows: { rule: string; detail: string }[] }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-border bg-card">
      <div className="ha-mono grid grid-cols-[0.8fr_1.6fr] gap-4 border-b-2 border-foreground/80 px-5 py-3 text-[11px] lowercase text-muted-foreground">
        <span>{head[0]}</span>
        <span>{head[1]}</span>
      </div>
      {rows.map((r) => (
        <div key={r.rule} className="grid grid-cols-[0.8fr_1.6fr] gap-4 border-b border-border px-5 py-4 last:border-0 transition-colors hover:bg-secondary/60">
          <span className="text-sm font-extrabold">{r.rule}</span>
          <span className="text-sm text-foreground/85 leading-relaxed">{r.detail}</span>
        </div>
      ))}
    </div>
  );
}

function Callout({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-[20px] border-l-4 border-primary bg-primary/10 px-5 py-4">
      <div className="ha-mono text-[11px] font-bold lowercase text-primary">{label}</div>
      <p className="mt-1 text-[15px] text-foreground/90 leading-relaxed">{children}</p>
    </div>
  );
}

const CHECK_KEY = 'ha27-rulebook-checklist';

function Checklist() {
  const [done, setDone] = useState<boolean[]>(() => {
    try {
      const raw = localStorage.getItem(CHECK_KEY);
      const arr = raw ? JSON.parse(raw) : null;
      if (Array.isArray(arr)) return RULEBOOK.checklist.map((_, i) => Boolean(arr[i]));
    } catch {
      /* storage unavailable */
    }
    return RULEBOOK.checklist.map(() => false);
  });
  useEffect(() => {
    try {
      localStorage.setItem(CHECK_KEY, JSON.stringify(done));
    } catch {
      /* storage unavailable */
    }
  }, [done]);
  const count = done.filter(Boolean).length;
  const total = done.length;
  return (
    <div className="rounded-[26px] border-2 border-foreground bg-card p-5 sm:p-7 shadow-[6px_6px_0_0_hsl(var(--foreground))]">
      <div className="flex items-center justify-between gap-4">
        <span className="ha-mono text-xs lowercase text-muted-foreground">tick them off as you go (saved on this device)</span>
        <span className="ha-mono shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
          {count}/{total} {count === total ? '🎉' : ''}
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
        <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${(count / total) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
      </div>
      <ul className="mt-5 divide-y divide-border">
        {RULEBOOK.checklist.map((item, i) => (
          <li key={item}>
            <label className="flex cursor-pointer items-start gap-3 py-3.5">
              <input type="checkbox" className="peer sr-only" checked={done[i]} onChange={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))} />
              <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-primary/60 ${done[i] ? 'border-primary bg-primary text-primary-foreground scale-110' : 'border-primary/50'}`}>
                {done[i] && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
              <span className={`text-[15px] leading-relaxed transition-colors ${done[i] ? 'text-muted-foreground line-through decoration-primary/60' : 'text-foreground'}`}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HackArenaRules() {
  useSEO({
    title: 'Campus Round Rule Book · HackArena – 2027 Edition | Ignite Room',
    description: 'The full HackArena 2027 Campus Round Rule Book: dates, how colleges join, team rules, hosting rules, shortlisting, the 5-day prototype round and the Grand Finale in Bangalore.',
    path: '/hackarena-2027/rules',
  });
  const phase = getPhase();
  const [active, setActive] = useState('about');

  useEffect(() => {
    const els = TOC.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-30% 0px -60% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const R = RULEBOOK;

  return (
    <HALayout>
      <section className="relative overflow-hidden pt-28 pb-12 md:pt-36 md:pb-16">
        <GridGlow />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={HA_BASE} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors print:hidden">
            <ArrowLeft className="h-4 w-4" /> HackArena 2027
          </Link>
          <div className="ha-mono mt-7 text-xs lowercase text-primary">hackarena · 2027 edition · campus edition</div>
          <h1 className="mt-3 font-heading text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[0.95] tracking-[-0.045em]">
            Campus Round<br /><Serif className="text-gradient pr-2 text-[1.08em]">Rule Book</Serif>
          </h1>
          <p className="mt-5 max-w-2xl text-muted-foreground text-base md:text-lg leading-relaxed">
            Everything a college needs to apply, host its HackArena campus round, shortlist teams and send them on to the 5-day prototype round and the Grand Finale in Bangalore.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              ['Applications', '25 Nov 2026 – 5 Jan 2027'],
              ['Campus rounds', '10 Feb – 25 Apr 2027'],
              ['Grand Finale', '19–20 June 2027 · Bangalore'],
              ['Prize pool', '₹1.5 Lakh cash'],
            ].map(([k, v]) => (
              <span key={k} className="rounded-full border border-border bg-card px-4 py-2 text-sm"><b className="text-primary">{k}</b> {v}</span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3 print:hidden">
            <a
              href={HA.rulebookPdfUrl}
              download
              onClick={() => track('ha_rulebook_download')}
              className="ha-shine inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4" /> Download the PDF
            </a>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-bold hover:border-primary/60 hover:text-primary transition-colors">
              <Printer className="h-4 w-4" /> Print this page
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 grid gap-10 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Rule book sections" className="hidden lg:block print:hidden">
          <ul className="sticky top-28 space-y-0.5">
            {TOC.map((t) => (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  onClick={(e) => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth' }); }}
                  className={`flex items-center gap-3 rounded-full px-3 py-2 text-sm transition-all ${active === t.id ? 'bg-primary text-primary-foreground font-bold translate-x-1' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                >
                  <span className="ha-mono text-[11px]">{t.n}</span>
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="min-w-0">
          <Chapter id="about" n="01" kicker="about" title={<>What HackArena 2027 Edition <Serif className="text-gradient pr-1">is</Serif></>}>
            <p className="text-[17px] text-foreground/85 leading-relaxed">{R.intro}</p>
            <div className="grid gap-3 md:grid-cols-3">
              {R.stages.map((s, i) => (
                <div key={s.label} className="relative rounded-[22px] border border-border border-t-4 border-t-primary bg-card p-5">
                  <div className="ha-mono text-[11px] font-bold lowercase text-primary">{s.label}</div>
                  <div className="mt-2"><Serif className="text-2xl">{s.title}</Serif></div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                  {s.when && <p className="mt-2 text-sm font-bold">{s.when}</p>}
                  {i < 2 && <ArrowRight aria-hidden className="hidden md:block absolute -right-[18px] top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />}
                </div>
              ))}
            </div>
            <h3 className="pt-2 font-heading text-xl font-extrabold">Key dates</h3>
            <div className="overflow-hidden rounded-[22px] border border-border bg-card">
              <div className="ha-mono grid grid-cols-[1fr_1.4fr] gap-4 border-b-2 border-foreground/80 px-5 py-3 text-[11px] lowercase text-muted-foreground">
                <span>milestone</span>
                <span>date / deadline</span>
              </div>
              {R.keyDates.map((d) => (
                <div key={d.milestone} className="grid grid-cols-[1fr_1.4fr] gap-4 border-b border-border px-5 py-4 last:border-0 hover:bg-secondary/60 transition-colors">
                  <span className="text-sm">{d.milestone}</span>
                  <span className="text-sm"><b>{d.date}</b> <span className="text-muted-foreground">{d.note}</span></span>
                </div>
              ))}
            </div>
            <Callout label="no common prototype timeline">{R.noCommonTimeline}</Callout>
          </Chapter>

          <Chapter id="join" n="02" kicker="how a college joins" title={<>Apply, get approved, <Serif className="text-gradient pr-1">go live on Nymble</Serif></>}>
            <ol className="overflow-hidden rounded-[22px] border border-border bg-card">
              {R.joinSteps.map((s, i) => (
                <li key={s.title} className="flex gap-4 border-b border-border px-5 py-4 last:border-0">
                  <span className="ha-mono text-sm font-bold text-primary">0{i + 1}</span>
                  <span className="text-[15px] leading-relaxed"><b>{s.title}</b> <span className="text-foreground/80">{s.body}</span></span>
                </li>
              ))}
            </ol>
            <h3 className="pt-2 font-heading text-xl font-extrabold">Coordinator roles</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {R.roles.map((r) => (
                <div key={r.label} className="rounded-[22px] border border-border bg-card p-6">
                  <div className="ha-mono text-[11px] font-bold lowercase text-primary">{r.label}</div>
                  <div className="mt-1.5"><Serif className="text-2xl">{r.title}</Serif></div>
                  <ul className="mt-4 space-y-2.5">
                    {r.points.map((p) => (
                      <li key={p} className="flex gap-2.5 text-sm text-foreground/85 leading-relaxed"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Chapter>

          <Chapter id="participation" n="03" kicker="participation" title={<>Who can <Serif className="text-gradient pr-1">take part</Serif></>}>
            <RuleTable head={['rule', 'detail']} rows={R.participation} />
            <h3 className="pt-2 font-heading text-xl font-extrabold">Theme</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[22px] border border-border bg-card p-6">
                <div className="ha-mono text-[11px] font-bold lowercase text-primary">main theme</div>
                <div className="mt-1.5"><Serif className="text-2xl">{R.theme.main.title}</Serif></div>
                <p className="mt-2 text-sm text-foreground/85 leading-relaxed">{R.theme.main.body}</p>
              </div>
              <div className="rounded-[22px] border-2 border-dashed border-border p-6">
                <div className="ha-mono text-[11px] font-bold lowercase text-primary">sponsored tracks</div>
                <div className="mt-1.5"><Serif className="text-2xl">{R.theme.tracks.title}</Serif></div>
                <p className="mt-2 text-sm text-foreground/85 leading-relaxed">{R.theme.tracks.body}</p>
              </div>
            </div>
          </Chapter>

          <Chapter id="hosting" n="04" kicker="hosting the campus round" title={<>Rules for the <Serif className="text-gradient pr-1">internal round</Serif></>}>
            <RuleTable head={['rule', 'detail']} rows={R.hosting} />
          </Chapter>

          <Chapter id="shortlisting" n="05" kicker="shortlisting" title={<>20% of checked-in teams, <Serif className="text-gradient pr-1">up to 20</Serif></>}>
            <p className="text-[17px] text-foreground/85 leading-relaxed">{R.shortlistIntro}</p>
            <div className="overflow-hidden rounded-[22px] border border-border bg-card">
              <div className="ha-mono grid grid-cols-[1fr_0.8fr_1fr] gap-4 border-b-2 border-foreground/80 px-5 py-3 text-[11px] lowercase text-muted-foreground">
                <span>checked-in teams</span>
                <span className="text-right">shortlisted</span>
                <span>note</span>
              </div>
              {R.shortlistTable.map((r) => (
                <div key={r.checkedIn} className="grid grid-cols-[1fr_0.8fr_1fr] gap-4 border-b border-border px-5 py-4 last:border-0 hover:bg-secondary/60 transition-colors">
                  <span className="text-sm">{r.checkedIn}</span>
                  <span className="text-right font-heading text-lg font-extrabold tabular-nums">{r.shortlisted}</span>
                  <span className="text-sm text-muted-foreground">{r.note}</span>
                </div>
              ))}
            </div>
            <Callout label="same-day results">Shortlisted teams are announced on the same day as the campus round.</Callout>
          </Chapter>

          <Chapter id="prototype" n="06" kicker="prototype round" title={<>5 days <Serif className="text-gradient pr-1">to build</Serif></>}>
            <ul className="space-y-3">
              {R.prototype.map((p) => (
                <li key={p} className="flex gap-3 text-[16px] text-foreground/85 leading-relaxed"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{p}</li>
              ))}
            </ul>
          </Chapter>

          <Chapter id="finale" n="07" kicker="grand finale" title={<>36 hours <Serif className="text-gradient pr-1">in Bangalore</Serif></>}>
            <div className="grid gap-3 sm:grid-cols-3">
              {R.finale.map((f, i) => (
                <div key={f.big} className={`rounded-[22px] border p-5 ${i === 0 ? 'border-primary/40 bg-primary/10' : 'border-border bg-card'}`}>
                  <Serif className={`text-4xl ${i === 0 ? 'text-primary' : ''}`}>{f.big}</Serif>
                  <div className="mt-1 text-sm text-muted-foreground">{f.small}</div>
                </div>
              ))}
            </div>
          </Chapter>

          <Chapter id="after" n="08" kicker="sponsors, reporting & certificates" title={<>After approval, during <Serif className="text-gradient pr-1">and after the round</Serif></>}>
            <div>
              <h3 className="font-heading text-xl font-extrabold">College sponsors</h3>
              <p className="mt-2 text-[16px] text-foreground/85 leading-relaxed">
                Colleges may bring their own sponsors for the campus round, <b>subject to approval from Ignite Room</b>.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-xl font-extrabold">Post-event reporting (within 2 days)</h3>
              <div className="mt-3">
                <RuleTable head={['item', 'due']} rows={R.reporting.map((r) => ({ rule: r, detail: 'Within 2 days of the campus round' }))} />
              </div>
            </div>
            <div>
              <h3 className="font-heading text-xl font-extrabold">Certificates</h3>
              <p className="mt-2 text-[16px] text-foreground/85">{R.certificates}</p>
            </div>
          </Chapter>

          <Chapter id="checklist" n="09" kicker="checklist" title={<>College <Serif className="text-gradient pr-1">checklist</Serif></>}>
            <Checklist />
          </Chapter>

          <div className="mt-14 rounded-[28px] border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
            <div>
              <h2 className="font-heading text-2xl font-extrabold">Questions about the rules?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Write to <a href={`mailto:${HA.contactEmail}`} className="text-primary hover:underline">{HA.contactEmail}</a>.</p>
            </div>
            {applyIsPrimary(phase) ? (
              <PrimaryButton to={`${HA_BASE}/apply`}>Apply as a college</PrimaryButton>
            ) : (
              <PrimaryButton to={`${HA_BASE}#campuses`}>Find your campus</PrimaryButton>
            )}
          </div>
        </article>
      </div>
    </HALayout>
  );
}
