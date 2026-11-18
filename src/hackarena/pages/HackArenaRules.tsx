import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useSEO } from '@/hooks/use-seo';
import HALayout from '../components/HALayout';
import { GridGlow, PrimaryButton } from '../components/bits';
import { HA, HA_BASE, applyIsPrimary, getPhase } from '../config';
import { RULES } from '../content';

export default function HackArenaRules() {
  useSEO({
    title: 'Campus Round Rule Book · HackArena – 2027 Edition | Ignite Room',
    description: 'Rules for HackArena 2027 campus rounds: dates, format, team size, shortlisting, the prototype round and the Grand Finale in Bangalore.',
    path: '/hackarena-2027/rules',
  });
  const phase = getPhase();

  return (
    <HALayout>
      <section className="relative overflow-hidden pt-28 pb-10 md:pt-36 md:pb-14">
        <GridGlow />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={HA_BASE} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors print:hidden">
            <ArrowLeft className="h-4 w-4" /> HackArena 2027
          </Link>
          <span className="mt-6 block font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Campus Round Rule Book</span>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.02] tracking-tight">The rules, in one page.</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground text-base md:text-lg leading-relaxed">
            Everything a college and its students need to know about the {HA.name} campus round, the prototype round and the Grand Finale.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 print:hidden">
            {HA.rulebookPdfUrl && (
              <a href={HA.rulebookPdfUrl} download className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                <Download className="h-4 w-4" /> Download PDF
              </a>
            )}
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-primary/60 hover:text-primary transition-colors">
              <Printer className="h-4 w-4" /> Print this page
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <dl className="rounded-2xl border border-border/80 bg-card/50 divide-y divide-border/70 overflow-hidden">
          {RULES.map((r, i) => (
            <div key={r.topic} className="grid sm:grid-cols-[220px_1fr] gap-1 sm:gap-6 px-5 sm:px-7 py-5">
              <dt className="flex items-center gap-3 text-sm font-semibold text-foreground">
                <span className="font-mono text-[11px] text-primary">{String(i + 1).padStart(2, '0')}</span>
                {r.topic}
              </dt>
              <dd className="text-[15px] text-foreground/85 leading-relaxed pl-8 sm:pl-0">{r.copy}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 rounded-2xl border border-border/80 bg-card/50 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
          <div>
            <h2 className="font-heading text-xl font-bold">Questions about the rules?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Write to <a href={`mailto:${HA.contactEmail}`} className="text-primary hover:underline">{HA.contactEmail}</a>.</p>
          </div>
          {applyIsPrimary(phase) ? (
            <PrimaryButton to={`${HA_BASE}/apply`}>Apply as a college</PrimaryButton>
          ) : (
            <PrimaryButton to={`${HA_BASE}#campuses`}>Find your campus</PrimaryButton>
          )}
        </div>
      </section>
    </HALayout>
  );
}
