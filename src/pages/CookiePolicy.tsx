import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/use-seo';

export default function CookiePolicy() {
  useSEO({
    title: 'Cookie Policy',
    description: 'How Ignite Room uses cookies and similar technologies on igniteroom.in.',
    path: '/cookie-policy',
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
            Cookie Policy
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Last updated: December 2024
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                1. What Are Cookies?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile phone)
                when you visit our website. They help us remember your preferences, understand how you use our
                site, and improve your browsing experience. Cookies contain information that is sent back to our
                servers on each subsequent visit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                2. Types of Cookies We Use
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Essential Cookies</h3>
                  <p>These cookies are necessary for the website to function properly. They help us:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Maintain security</li>
                    <li>Keep track of your session</li>
                    <li>Load pages correctly</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Performance Cookies</h3>
                  <p>These cookies help us understand how visitors use our website:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Track which pages are visited</li>
                    <li>Measure page performance</li>
                    <li>Fix technical issues</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Preference Cookies</h3>
                  <p>These cookies remember your choices and preferences:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Language preferences</li>
                    <li>Theme settings</li>
                    <li>Display preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Marketing Cookies</h3>
                  <p>These cookies track your browsing habits to display relevant content:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Show tailored advertisements</li>
                    <li>Track conversion metrics</li>
                    <li>Measure campaign effectiveness</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                3. Third-Party Cookies
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Some cookies are set by third-party services we use, including:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground">
                <li><strong>Google Analytics:</strong> For website analytics and user behavior tracking</li>
                <li><strong>Social Media Platforms:</strong> For integration with social media services</li>
                <li><strong>Advertising Partners:</strong> For targeted advertising purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                4. Cookie Duration
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Session Cookies</h3>
                  <p>These cookies are temporary and are deleted when you close your browser.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Persistent Cookies</h3>
                  <p>These cookies remain on your device for a specified period (ranging from days to years)
                    and continue to track your browsing habits even after you close your browser.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                5. How to Manage Cookies
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to accept or reject cookies. Most web browsers allow you to:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground">
                <li>View cookies stored on your device</li>
                <li>Delete cookies individually or all at once</li>
                <li>Block specific types of cookies</li>
                <li>Adjust cookie settings for individual websites</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Please note that disabling cookies may affect the functionality and user experience of our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                6. Cookie Settings by Browser
              </h2>
              <div className="space-y-2 text-muted-foreground">
                <p>To manage cookies in your browser:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Preferences → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                  <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and other site permissions</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                7. Do Not Track (DNT)
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If your browser's Do Not Track feature is enabled, we will respect your preference not to be
                tracked for marketing purposes. However, we may still use essential cookies necessary for website
                functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                8. Data Protection
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Information collected through cookies is subject to our Privacy Policy. We use industry-standard
                security measures to protect your data from unauthorized access and misuse.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                9. Legal Basis for Cookies
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies based on:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground">
                <li>Your explicit consent (for non-essential cookies)</li>
                <li>Legitimate business interests (for analytics)</li>
                <li>Legal obligations (for compliance tracking)</li>
                <li>Contractual necessity (for essential functionality)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                10. Updates to This Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time. We will notify you of significant changes
                by posting the updated policy on our website with a new "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                11. Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about our use of cookies or this Cookie Policy, please contact us at:
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
