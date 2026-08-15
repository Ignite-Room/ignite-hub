import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/use-seo';

export default function PrivacyPolicy() {
  useSEO({
    title: 'Privacy Policy',
    description: 'How Ignite Room collects, uses, and protects your personal information.',
    path: '/privacy-policy',
  });

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />

      <main className="relative z-10 w-full">
        <section className="w-full px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">Privacy Policy</h1>
              <p className="text-muted-foreground text-lg mb-8">Last updated: December 2025</p>

              <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
                <section>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">1. Introduction</h2>
                  <p>Ignite Room ("we," "us," "our") is committed to protecting your privacy. This policy explains how we collect and use personal information.</p>
                </section>

                <section>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">2. Information We Collect</h2>
                  <p>We may collect information you provide directly (name, email) and information collected automatically (IP address, device information).</p>
                </section>

                <section>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">3. How We Use Information</h2>
                  <p>To provide and maintain our services, communicate with you, and improve the site.</p>
                </section>

                <section>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">4. Your Rights</h2>
                  <p>You may request access to, correction of, or deletion of your personal data.</p>
                </section>

                <section>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">5. Contact</h2>
                  <p>If you have questions, email <a href="mailto:admin@igniteroom.in" className="text-primary hover:underline">admin@igniteroom.in</a>.</p>
                </section>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
