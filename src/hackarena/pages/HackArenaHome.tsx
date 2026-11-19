import { useMemo } from 'react';
import { useSEO, useStructuredData } from '@/hooks/use-seo';
import HALayout from '../components/HALayout';
import { HA, HA_DATES, getPhase } from '../config';
import { useHAData } from '../api';
import Hero, { HypeBand } from '../sections/Hero';
import StatStrip from '../sections/StatStrip';
import Campuses from '../sections/Campuses';
import { Finale, ForColleges, HowItWorks, KeyDates, Theme } from '../sections/Story';
import { Faq, Sponsors } from '../sections/SponsorsFaq';

export default function HackArenaHome() {
  const phase = getPhase();
  const { data, isLoading, isError, refetch } = useHAData();

  useSEO({
    title: 'HackArena – 2027 Edition · Campus Edition | Ignite Room',
    description:
      'HackArena 2027 by Ignite Room: a national campus hackathon. Colleges host idea-pitching rounds from 10 Feb to 25 Apr 2027, and the best teams meet for a 36-hour Grand Finale in Bangalore with a ₹1.5 Lakh cash prize pool.',
    path: '/hackarena-2027',
  });

  const schema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: `${HA.name} Grand Finale`,
      description: 'A 36-hour national hackathon finale for teams shortlisted from campus rounds across India.',
      startDate: HA_DATES.finaleStart.toISOString(),
      endDate: HA_DATES.finaleEnd.toISOString(),
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: { '@type': 'Place', name: 'Bangalore (venue to be announced)', address: { '@type': 'PostalAddress', addressLocality: 'Bangalore', addressCountry: 'IN' } },
      organizer: { '@type': 'Organization', name: 'Ignite Room', url: 'https://www.igniteroom.in' },
      url: 'https://www.igniteroom.in/hackarena-2027',
      image: 'https://www.igniteroom.in/ha2027/og.png',
    }),
    [],
  );
  useStructuredData(schema);

  const sponsors = data?.sponsors ?? [];

  return (
    <HALayout>
      <Hero phase={phase} titleSponsor={sponsors.find((s) => s.tier === 'title')} />
      <HypeBand />
      <StatStrip stats={data?.stats} />
      <HowItWorks />
      <Campuses campuses={data?.campuses ?? []} loading={isLoading} error={isError} phase={phase} onRetry={() => refetch()} />
      <KeyDates />
      <Theme trackSponsors={sponsors.filter((s) => s.tier === 'track')} />
      <ForColleges phase={phase} />
      <Finale hasFinalists={(data?.finalists.length ?? 0) > 0} />
      <Sponsors sponsors={sponsors} />
      <Faq />
    </HALayout>
  );
}
