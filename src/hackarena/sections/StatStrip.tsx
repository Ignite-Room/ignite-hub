import RevealOnScroll from '@/components/design-system/RevealOnScroll';
import { HA } from '../config';
import type { HAData } from '../api';
import { Serif } from '../components/bits';

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
      : { value: String(HA.campusTarget), label: 'campuses', sub: 'across India' },
    { value: '3', label: 'stages', sub: 'campus · prototype · finale' },
    { value: `${HA.finaleHours}h`, label: 'grand finale', sub: `${HA.finaleCity.toLowerCase()} · 19–20 june` },
    { value: HA.prizePool, label: 'cash pool', sub: 'at the grand finale' },
  ];

  return (
    <section aria-label="HackArena 2027 at a glance" className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((s, i) => (
            <RevealOnScroll key={s.label} delay={i * 0.07}>
              <div className="group h-full rounded-3xl border border-border bg-card p-5 sm:p-7 transition-all hover:-translate-y-1 hover:border-primary/40">
                <div className="font-heading text-[2.2rem] sm:text-5xl font-extrabold tracking-[-0.04em] text-foreground tabular-nums transition-colors group-hover:text-primary">{s.value}</div>
                <div className="mt-1"><Serif className="text-xl sm:text-2xl text-foreground/85">{s.label}</Serif></div>
                <div className="ha-mono mt-2 text-[10.5px] sm:text-[11px] lowercase text-muted-foreground">{s.sub}</div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
