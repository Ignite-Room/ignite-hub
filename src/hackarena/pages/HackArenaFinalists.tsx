import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useSEO } from '@/hooks/use-seo';
import HALayout from '../components/HALayout';
import { GridGlow, PrimaryButton } from '../components/bits';
import { HA_BASE } from '../config';
import { useHAData } from '../api';

export default function HackArenaFinalists() {
  const { data, isLoading } = useHAData();
  const finalists = data?.finalists ?? [];

  useSEO({
    title: 'Grand Finale teams · HackArena – 2027 Edition | Ignite Room',
    description: 'The teams heading to the HackArena 2027 Grand Finale: 36 hours in Bangalore, 19–20 June 2027.',
    path: '/hackarena-2027/finalists',
    noindex: !isLoading && finalists.length === 0,
  });

  return (
    <HALayout>
      <section className="relative overflow-hidden pt-28 pb-24 md:pt-36">
        <GridGlow />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={`${HA_BASE}#finale`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Grand Finale
          </Link>
          <h1 className="mt-5 font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.02] tracking-tight">
            Heading to <span className="text-gradient">Bangalore.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground text-base md:text-lg">The teams selected for the 36-hour Grand Finale, 19–20 June 2027.</p>

          {isLoading ? (
            <div className="mt-10 grid gap-3 sm:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-card animate-pulse" />)}</div>
          ) : finalists.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-border p-10 text-center">
              <Trophy className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 font-heading text-2xl font-bold">Finalists are announced after the prototype round.</h2>
              <p className="mt-2 text-muted-foreground">Check back once every campus round has finished.</p>
              <div className="mt-7"><PrimaryButton to={HA_BASE}>Back to HackArena 2027</PrimaryButton></div>
            </div>
          ) : (
            <ol className="mt-10 grid gap-3 sm:grid-cols-2">
              {finalists.map((f, i) => (
                <li key={`${f.team}-${i}`} className="flex items-center gap-4 rounded-2xl border border-border/80 bg-card/50 p-5">
                  <span className="font-mono text-sm text-primary">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="font-heading text-lg font-bold">{f.team}</div>
                    <div className="text-sm text-muted-foreground">{[f.college, f.city].filter(Boolean).join(' · ')}</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </HALayout>
  );
}
