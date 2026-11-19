import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, Copy, MapPin, Timer, Trophy, Users } from 'lucide-react';
import { track } from '@vercel/analytics';
import { useSEO, useStructuredData } from '@/hooks/use-seo';
import HALayout from '../components/HALayout';
import { GridGlow, LogoTile, PrimaryButton, SponsorLogo, StatusBadge } from '../components/bits';
import { HA, HA_BASE, todayIST } from '../config';
import { effectiveCampus, formatDate, useHAData } from '../api';

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.01c0-5.2 4.23-9.43 9.43-9.43a9.37 9.37 0 0 1 9.42 9.44c0 5.2-4.23 9.42-9.44 9.42m8.02-17.44A11.27 11.27 0 0 0 12.05.75C5.8.75.72 5.83.72 12.08c0 2 .52 3.95 1.52 5.66L.62 23.25l5.64-1.48a11.3 11.3 0 0 0 5.78 1.47h.01c6.25 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.31-8.01" />
    </svg>
  );
}

export default function HackArenaCampus() {
  const { slug = '' } = useParams();
  const { data, isLoading, isError, refetch } = useHAData();
  const [copied, setCopied] = useState(false);

  const campus = useMemo(() => {
    const c = data?.campuses.find((x) => x.slug === slug);
    return c ? effectiveCampus(c, todayIST()) : undefined;
  }, [data, slug]);

  const url = `https://www.igniteroom.in${HA_BASE}/campus/${slug}`;

  useSEO({
    title: campus ? `${campus.college} campus round · HackArena 2027 | Ignite Room` : 'Campus round · HackArena 2027 | Ignite Room',
    description: campus
      ? `HackArena – 2027 Edition campus round at ${campus.college}${campus.city ? `, ${campus.city}` : ''} on ${formatDate(campus.roundDate)}. Teams of 2–5, students of this college only.`
      : 'A HackArena – 2027 Edition campus round.',
    path: `${HA_BASE}/campus/${slug}`,
    noindex: !campus && !isLoading,
  });

  const schema = useMemo(
    () =>
      campus && campus.roundDate
        ? {
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: `HackArena 2027 Campus Round · ${campus.college}`,
            startDate: campus.roundDate,
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            location: { '@type': 'Place', name: campus.venue || campus.college, address: { '@type': 'PostalAddress', addressLocality: campus.city, addressRegion: campus.state, addressCountry: 'IN' } },
            organizer: { '@type': 'Organization', name: 'Ignite Room', url: 'https://www.igniteroom.in' },
            url,
          }
        : null,
    [campus, url],
  );
  useStructuredData(schema);

  const canRegister = campus?.status === 'registrations-open' && campus.nymbleUrl;
  const shareText = campus ? `${campus.college} is hosting a HackArena 2027 campus round on ${formatDate(campus.roundDate)}. Register here: ${url}` : url;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <HALayout>
      <section className="relative overflow-hidden pt-28 pb-24 md:pt-36">
        <GridGlow />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={`${HA_BASE}#campuses`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> All campus rounds
          </Link>

          {isLoading ? (
            <div className="mt-8 space-y-4" aria-busy="true">
              <div className="h-20 w-20 rounded-xl bg-card animate-pulse" />
              <div className="h-12 w-2/3 rounded-lg bg-card animate-pulse" />
              <div className="h-48 rounded-2xl bg-card animate-pulse" />
            </div>
          ) : !campus ? (
            <div className="mt-10 rounded-3xl border border-dashed border-border p-10 text-center">
              <h1 className="font-heading text-3xl font-extrabold">{isError ? "Couldn't load this campus" : 'Campus round not found'}</h1>
              <p className="mt-3 text-muted-foreground">
                {isError ? 'Please try again in a moment.' : "This college isn't listed yet. Rounds appear as soon as each college's registration page goes live."}
              </p>
              <div className="mt-7 flex justify-center gap-3">
                {isError && <button onClick={() => refetch()} className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-primary/60">Try again</button>}
                <PrimaryButton to={`${HA_BASE}#campuses`}>See all campuses</PrimaryButton>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-5">
                <LogoTile src={campus.logoUrl} name={campus.college} size="lg" />
                <div>
                  <StatusBadge status={campus.status} />
                  <h1 className="mt-3 font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.05] tracking-tight">{campus.college}</h1>
                  <p className="mt-2 text-muted-foreground">{HA.name} · Campus Round</p>
                </div>
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                <div className="rounded-2xl border border-border/80 bg-card/50 p-6 md:p-8">
                  <dl className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <dt className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"><CalendarDays className="h-4 w-4 text-primary" />Round date</dt>
                      <dd className="mt-2 font-heading text-xl font-bold">{formatDate(campus.roundDate, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"><MapPin className="h-4 w-4 text-primary" />Venue</dt>
                      <dd className="mt-2 font-heading text-xl font-bold">{campus.venue || 'To be announced'}</dd>
                      <dd className="text-sm text-muted-foreground">{[campus.city, campus.state].filter(Boolean).join(', ')}</dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"><Users className="h-4 w-4 text-primary" />Eligibility</dt>
                      <dd className="mt-2 text-[15px] font-medium">Only students of this college · teams of 2–5</dd>
                    </div>
                    {campus.prototypeDue && (
                      <div>
                        <dt className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"><Timer className="h-4 w-4 text-primary" />Prototype due</dt>
                        <dd className="mt-2 text-[15px] font-medium">{formatDate(campus.prototypeDue)} (shortlisted teams)</dd>
                      </div>
                    )}
                  </dl>
                  <p className="mt-8 pt-6 border-t border-border/70 text-sm text-muted-foreground leading-relaxed">
                    Offline idea pitching, no prototype needed. 20% of checked-in teams (up to 20) are shortlisted the same day and build a prototype within 5 days.
                    The best teams go to the 36-hour Grand Finale in Bangalore, 19–20 June 2027.
                  </p>
                </div>

                <div className="space-y-4 order-first lg:order-none">
                  <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/15 to-card/50 p-6">
                    {canRegister ? (
                      <>
                        <h2 className="font-heading text-xl font-bold">Registrations are open</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Register your team on this college&apos;s Nymble page.</p>
                        <a
                          href={campus.nymbleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => track('ha_register_click', { college: campus.slug })}
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-[0_0_40px_-8px_hsl(var(--primary)/0.8)]"
                        >
                          Register on Nymble <ArrowUpRight className="h-4 w-4" />
                        </a>
                      </>
                    ) : (
                      <>
                        <h2 className="font-heading text-xl font-bold">
                          {campus.status === 'coming-soon'
                            ? 'Registrations open soon'
                            : campus.status === 'round-today'
                              ? 'The round is today'
                              : campus.status === 'registrations-closed'
                                ? 'Registrations closed'
                                : 'Round complete'}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {campus.status === 'coming-soon' ? 'Check back here, or ask your Student Coordinator.' : 'Follow the shortlist and results on this page.'}
                        </p>
                        <button disabled className="mt-5 w-full rounded-full border border-border px-6 py-3.5 text-sm font-semibold text-muted-foreground cursor-not-allowed">Register on Nymble</button>
                      </>
                    )}
                  </div>

                  <div className="rounded-2xl border border-border/80 bg-card/50 p-6">
                    <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Share with your batch</h2>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track('ha_share', { college: campus.slug, via: 'whatsapp' })}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:border-emerald-500/60 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
                      >
                        <WhatsAppIcon /> WhatsApp
                      </a>
                      <button onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:border-primary/60 hover:text-primary transition-colors">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy link'}
                      </button>
                    </div>
                  </div>

                  {(campus.sponsorLogoUrl || campus.sponsorName) && (
                    <div className="rounded-2xl border border-border/80 bg-card/50 p-6">
                      <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">College sponsor</h2>
                      <div className="mt-4 flex h-16 items-center justify-center rounded-xl border border-border/70 bg-background/60 px-4">
                        {campus.sponsorLogoUrl ? <SponsorLogo src={campus.sponsorLogoUrl} alt={campus.sponsorName || 'College sponsor'} className="max-h-10 w-auto" /> : <span className="font-heading font-bold">{campus.sponsorName}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {campus.shortlist && campus.shortlist.length > 0 && (
                <div className="mt-6 rounded-2xl border border-border/80 bg-card/50 p-6 md:p-8">
                  <h2 className="flex items-center gap-2 font-heading text-2xl font-bold"><Trophy className="h-5 w-5 text-primary" />Shortlisted teams</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {campus.shortlist.length} team{campus.shortlist.length === 1 ? '' : 's'} heading to the prototype round
                    {campus.prototypeDue ? `, due ${formatDate(campus.prototypeDue)}` : ''}.
                  </p>
                  <ol className="mt-6 grid gap-2 sm:grid-cols-2">
                    {campus.shortlist.map((t, i) => (
                      <li key={`${t}-${i}`} className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/50 px-4 py-3">
                        <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, '0')}</span>
                        <span className="font-medium">{t}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </HALayout>
  );
}
