import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/use-seo';

export default function TermsOfService() {
  useSEO({
    title: 'Terms of Service',
    description: 'The terms and conditions for using Ignite Room and participating in our community and events.',
    path: '/terms-of-service',
  });

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Last updated: December 2024
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the Ignite Room website and services, you accept and agree to be
                bound by the terms and provision of this agreement. If you do not agree to abide by the
                above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                2. Use License
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Permission is granted to temporarily download one copy of the materials (information or software)
                on Ignite Room's website for personal, non-commercial transitory viewing only. This is the grant
                of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained</li>
                <li>Remove any copyright or other proprietary notations</li>
                <li>Transfer the materials to another person or "mirror" the materials</li>
                <li>Use the materials for illegal purposes or in violation of any rules or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                3. Disclaimer
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The materials on Ignite Room's website are provided on an 'as is' basis. Ignite Room makes no
                warranties, expressed or implied, and hereby disclaims and negates all other warranties including,
                without limitation, implied warranties or conditions of merchantability, fitness for a particular
                purpose, or non-infringement of intellectual property.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                4. Limitations
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall Ignite Room or its suppliers be liable for any damages (including, without limitation,
                damages for loss of data or profit, or due to business interruption) arising out of the use or
                inability to use the materials on Ignite Room's website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                5. Accuracy of Materials
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The materials appearing on Ignite Room's website could include technical, typographical, or
                photographic errors. Ignite Room does not warrant that any of the materials on our website are
                accurate, complete, or current. We may make changes to the materials and information contained
                therein at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                6. Links
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ignite Room has not reviewed all of the sites linked to our website and is not responsible for
                the contents of any such linked site. The inclusion of any link does not imply endorsement by
                Ignite Room of the site. Use of any such linked website is at the user's own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                7. Modifications
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ignite Room may revise these terms of service for our website at any time without notice. By using
                this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                8. Governing Law
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of India,
                and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                9. User Conduct
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Users agree not to:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground">
                <li>Engage in any conduct that restricts or inhibits anyone's use of the website</li>
                <li>Post unlawful, threatening, abusive, defamatory, or vulgar content</li>
                <li>Impersonate any person or entity</li>
                <li>Upload viruses or malicious code</li>
                <li>Disrupt the normal flow of dialogue within our website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                10. Contact Information
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-muted-foreground mt-3">
                Email: <a href="mailto:admin@igniteroom.in" className="text-primary hover:underline">admin@igniteroom.in</a>
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
