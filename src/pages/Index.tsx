import { Suspense, lazy, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import TickerStrip from '@/components/sections/TickerStrip';
import WhatsOnSection from '@/components/sections/WhatsOnSection';
import AdvantageSection from '@/components/sections/AdvantageSection';
import SuccessStoriesSection from '@/components/sections/SuccessStoriesSection';
import ChaptersSection from '@/components/sections/ChaptersSection';
import LiveActivitySection from '@/components/sections/LiveActivitySection';
import CollaborationsSection from '@/components/sections/CollaborationsSection';
import AppSection from '@/components/sections/AppSection';
import NewsletterSection from '@/components/sections/NewsletterSection';
import Footer from '@/components/Footer';

// Lazy load 3D background for performance
const Logo3DBackground = lazy(() => import('@/components/Logo3DBackground'));

const Index = () => {
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
        <TickerStrip />
        <WhatsOnSection />
        <AdvantageSection />
        <SuccessStoriesSection />
        <ChaptersSection />
        <LiveActivitySection />
        <CollaborationsSection />
        <AppSection />
        <NewsletterSection />
      </main>

      {/* Footer */}
      <footer className="relative z-20 pointer-events-auto">
        <Footer />
      </footer>
    </div>
  );
};

export default Index;
