import { useMemo, useState } from 'react';
import { Building2, RotateCcw, Search, X } from 'lucide-react';
import { track } from '@vercel/analytics';
import { HA_BASE, HAPhase, todayIST } from '../config';
import { Campus, CampusStatus, STATUS_META, STATUS_ORDER, effectiveCampus, sortCampuses } from '../api';
import { CampusCard, PrimaryButton, Section, SectionHeading } from '../components/bits';

const MONTHS = [
  { v: '02', label: 'February' },
  { v: '03', label: 'March' },
  { v: '04', label: 'April' },
];

const selectCls =
  'h-11 rounded-full border border-border bg-card/70 px-4 pr-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 appearance-none bg-no-repeat bg-[length:14px] bg-[right_14px_center]';
const chevron = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
};

export default function Campuses({
  campuses: raw,
  loading,
  error,
  phase,
  onRetry,
}: {
  campuses: Campus[];
  loading: boolean;
  error: boolean;
  phase: HAPhase;
  onRetry: () => void;
}) {
  const today = todayIST();
  const campuses = useMemo(() => sortCampuses(raw.map((c) => effectiveCampus(c, today)), today), [raw, today]);

  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [month, setMonth] = useState('');
  const [status, setStatus] = useState<CampusStatus | ''>('');

  const cityCounts = useMemo(() => {
    const m = new Map<string, number>();
    campuses.forEach((c) => {
      const key = c.region || c.city;
      if (key) m.set(key, (m.get(key) ?? 0) + 1);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [campuses]);

  const statuses = useMemo(() => STATUS_ORDER.filter((s) => campuses.some((c) => c.status === s)), [campuses]);

  const filtered = campuses.filter((c) => {
    if (q && !c.college.toLowerCase().includes(q.trim().toLowerCase())) return false;
    if (city && (c.region || c.city) !== city) return false;
    if (month && c.roundDate?.slice(5, 7) !== month) return false;
    if (status && c.status !== status) return false;
    return true;
  });

  const anyFilter = q || city || month || status;
  const reset = () => { setQ(''); setCity(''); setMonth(''); setStatus(''); };
  const canApply = phase === 'pre' || phase === 'open';

  return (
    <Section id="campuses" band>
      <SectionHeading
        n="02"
        eyebrow="Campus events"
        title={<>Find your <span className="text-gradient">campus round.</span></>}
        lead="Every approved college appears here as soon as its registration page goes live. Register on your own college's page: all team members must be from the same college."
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[214px] rounded-2xl border border-border/60 bg-card/40 animate-pulse" />
          ))}
        </div>
      ) : campuses.length === 0 ? (
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-border bg-background/50 px-6 py-14 md:py-20 text-center">
          <div aria-hidden className="absolute left-1/2 top-0 -translate-x-1/2 h-40 w-[480px] bg-primary/15 blur-3xl" />
          <Building2 className="relative mx-auto h-10 w-10 text-primary" />
          <h3 className="relative mt-5 font-heading text-2xl md:text-3xl font-extrabold">Campus rounds are coming soon</h3>
          <p className="relative mx-auto mt-3 max-w-xl text-muted-foreground leading-relaxed">
            {error
              ? "We couldn't load the campus list just now."
              : 'Campus rounds run from 10 February to 25 April 2027. Each college appears here as soon as its registration page opens.'}
            {canApply && !error && " Don't see your college? Ask your Dean, HOD or a faculty coordinator to apply before 5 January 2027."}
          </p>
          <div className="relative mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            {error ? (
              <button onClick={onRetry} className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-primary/60 hover:text-primary transition-colors">
                <RotateCcw className="h-4 w-4" /> Try again
              </button>
            ) : canApply ? (
              <PrimaryButton to={`${HA_BASE}/apply`} onClick={() => track('ha_apply_click', { where: 'campuses-empty' })}>Apply as a college</PrimaryButton>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          {/* Stations: campuses per city / region */}
          {cityCounts.length > 1 && (
            <div className="mb-8">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Stations</div>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap snap-x">
                {cityCounts.map(([name, count]) => {
                  const active = city === name;
                  return (
                    <button
                      key={name}
                      onClick={() => setCity(active ? '' : name)}
                      aria-pressed={active}
                      className={`snap-start shrink-0 inline-flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                        active ? 'border-primary bg-primary/15 text-foreground' : 'border-border bg-card/60 text-foreground/85 hover:border-primary/50'
                      }`}
                    >
                      <span className="font-semibold">{name}</span>
                      <span className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-8 grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <label className="relative">
              <span className="sr-only">Search by college name</span>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search your college"
                className="h-11 w-full rounded-full border border-border bg-card/70 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            </label>
            <label>
              <span className="sr-only">City or region</span>
              <select value={city} onChange={(e) => setCity(e.target.value)} className={`${selectCls} w-full`} style={chevron}>
                <option value="">All cities</option>
                {cityCounts.map(([name]) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Month</span>
              <select value={month} onChange={(e) => setMonth(e.target.value)} className={`${selectCls} w-full`} style={chevron}>
                <option value="">Any month</option>
                {MONTHS.map((m) => <option key={m.v} value={m.v}>{m.label}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as CampusStatus | '')} className={`${selectCls} w-full`} style={chevron}>
                <option value="">Any status</option>
                {statuses.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
              </select>
            </label>
          </div>

          <div className="mb-5 flex items-center justify-between text-sm text-muted-foreground">
            <span aria-live="polite">{filtered.length} of {campuses.length} campus{campuses.length === 1 ? '' : 'es'}</span>
            {anyFilter && (
              <button onClick={reset} className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"><X className="h-3.5 w-3.5" />Clear filters</button>
            )}
          </div>

          {filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => <CampusCard key={c.slug} campus={c} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
              No campus rounds match these filters.{' '}
              <button onClick={reset} className="text-primary hover:underline">Clear filters</button>
            </div>
          )}
        </>
      )}
    </Section>
  );
}
