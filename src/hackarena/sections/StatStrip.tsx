import RevealOnScroll from '@/components/design-system/RevealOnScroll';
import { HA } from '../config';
import type { HAData } from '../api';

/**
 * Brief: "50 campuses · 3 stages · 36-hour finale · ₹1.5 Lakh. Swap in live counts
 * once colleges are approved." The first cell switches to the real approved count
 * as soon as the sheet reports one.
 */
export default function StatStrip({ stats }: { stats?: HAData['stats'] }) {
  const approved = stats?.approvedColleges ?? 0;
  const live = stats?.liveRounds ?? 0;

  const items = [
    approved > 0
      ? { value: String(approved), label: approved === 1 ? 'college approved' : 'colleges approved', sub: live > 0 ? `${live} campus round${live === 1 ? '' : 's'} live` : `of ${HA.campusTarget} campuses` }
      : { value: String(HA.campusTarget), label: 'campuses across India', sub: 'Applications 25 Nov – 5 Jan' },
    { value: '3', label: 'stages', sub: 'Campus · Prototype · Finale' },
    { value: `${HA.finaleHours}h`, label: 'Grand Finale', sub: `${HA.finaleCity} · 19–20 June 2027` },
    { value: HA.prizePool, label: 'cash prize pool', sub: 'At the Grand Finale' },
  ];

  return (
    <section aria-label="HackArena 2027 at a glance" className="relative border-y border-border/70 bg-secondary/40">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4">
        {items.map((s, i) => (
          <RevealOnScroll
            key={s.label}
            delay={i * 0.06}
            className={`px-4 sm:px-8 py-8 md:py-10 border-border/70 ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'border-t lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}
          >
            <div className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tabular-nums">{s.value}</div>
            <div className="mt-1 text-sm font-semibold text-foreground/90">{s.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.sub}</div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
