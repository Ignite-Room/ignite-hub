import { Suspense, lazy, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
// import ActiveEventSection from '@/components/sections/ActiveEventSection'; // re-enable for next live event
import EventsSection from '@/components/sections/EventsSection';
import AmbassadorSection from '@/components/sections/AmbassadorSection';
import ChaptersSection from '@/components/sections/ChaptersSection';
import AppSection from '@/components/sections/AppSection';
import CollaborationsSection from '@/components/sections/CollaborationsSection';
import Footer from '@/components/Footer';
import AmbassadorTasksPopup from '@/components/AmbassadorTasksPopup';
import { useSEO } from '@/hooks/use-seo';

// Lazy load 3D background for performance
const Logo3DBackground = lazy(() => import('@/components/Logo3DBackground'));

const Index = () => {
  useSEO({
    title: 'Ignite Room',
    description: 'Ignite Room is a student-powered ecosystem for hackathons, mentorship, and events across 6 chapters in India. Join builders and innovators turning ideas into real momentum.',
    path: '/',
  });

  // The 3D flame glow was tuned for the near-black dark theme; on the light
  // background it reads as a solid pink shape over content, so only show it in dark mode.
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen bg-background">
      {/* 3D Background - lazy loaded, dark theme only */}
      {mounted && resolvedTheme === 'dark' && (
        <Suspense fallback={null}>
          <Logo3DBackground />
        </Suspense>
      )}

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        {/* <ActiveEventSection /> — re-enable when next event goes live */}
        <EventsSection />
        <AmbassadorSection />
        <ChaptersSection />
        <AppSection />
        <CollaborationsSection />
      </main>

      {/* Footer */}
      <footer className="relative z-20 pointer-events-auto">
        <Footer />
      </footer>

      {/* Ambassador Program announcement */}
      <AmbassadorTasksPopup />
    </div>
  );
};

export default Index;
