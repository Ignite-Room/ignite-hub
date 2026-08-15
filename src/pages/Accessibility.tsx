import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/use-seo';

export default function Accessibility() {
  useSEO({
    title: 'Accessibility',
    description: "Ignite Room's commitment to digital accessibility and how to report accessibility issues.",
    path: '/accessibility',
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
            Accessibility Statement
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Last updated: December 2024
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Our Commitment
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ignite Room is committed to making our website accessible to all visitors, regardless of their
                abilities or disabilities. We believe that accessibility is not just a feature, but a fundamental
                right, and we are continuously working to improve the accessibility of our digital presence.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Accessibility Standards
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website is designed and tested to conform to the Web Content Accessibility Guidelines (WCAG)
                2.1 Level AA standards. These guidelines provide recommendations for making web content more
                accessible to people with disabilities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Accessibility Features
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website includes the following accessibility features:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground">
                <li>Keyboard navigation support</li>
                <li>Screen reader compatibility</li>
                <li>Clear heading structure</li>
                <li>Alt text for images</li>
                <li>Sufficient color contrast</li>
                <li>Resizable text and fonts</li>
                <li>Captions for video content</li>
                <li>Focus indicators for interactive elements</li>
                <li>Skip navigation links</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Assistive Technologies
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website has been tested with popular screen readers including NVDA, JAWS, and VoiceOver
                to ensure compatibility. We support the use of keyboard-only navigation and other assistive
                technologies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Known Issues and Workarounds
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                While we strive for perfect accessibility, some issues may occasionally occur. We are
                continuously identifying and fixing any accessibility barriers. If you encounter any issues,
                please let us know so we can address them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Browser and Device Support
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website is tested on multiple browsers and devices. While we support the latest versions
                of major browsers, some older browsers may not support all features. We encourage you to use
                current browser versions for the best experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Third-Party Content
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Some content on our website is provided by third parties and may not meet our accessibility
                standards. We work with our partners to improve accessibility where possible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Feedback and Contact
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We welcome feedback on the accessibility of our website. If you experience difficulty accessing
                any part of our site, please contact us:
              </p>
              <p className="text-muted-foreground mt-4">
                Email: <a href="mailto:admin@igniteroom.in" className="text-primary hover:underline">admin@igniteroom.in</a>
              </p>
              <p className="text-muted-foreground mt-2">
                Please include details about:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>What page or feature you were accessing</li>
                <li>What assistive technology you were using</li>
                <li>The issue you encountered</li>
                <li>Your suggested solution (if any)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Accessibility Roadmap
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We are continuously working to improve accessibility across our platform. Our future plans include:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground">
                <li>Regular WCAG 2.1 AA compliance audits</li>
                <li>Expanded keyboard navigation options</li>
                <li>Improved color contrast in certain areas</li>
                <li>Video captions for all content</li>
                <li>User feedback integration into our accessibility improvements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Accessibility Resources
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                For more information about web accessibility and assistive technologies, visit:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-1 text-muted-foreground">
                <li><a href="https://www.w3.org/WAI/" className="text-primary hover:underline">Web Accessibility Initiative (WAI)</a></li>
                <li><a href="https://www.wcag.org/" className="text-primary hover:underline">Web Content Accessibility Guidelines (WCAG)</a></li>
              </ul>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
