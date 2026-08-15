import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/use-seo';

export default function Disclaimer() {
  useSEO({
    title: 'Disclaimer',
    description: 'Legal disclaimer for Ignite Room content, events, and services.',
    path: '/disclaimer',
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
            Disclaimer
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Last updated: December 2024
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                General Disclaimer
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The information provided on the Ignite Room website is for educational and informational
                purposes only. While we strive to provide accurate and up-to-date information, we make no
                representations or warranties of any kind, express or implied, about the completeness,
                accuracy, reliability, suitability, or availability of the information on our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                No Professional Advice
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Nothing on this website should be construed as professional advice, legal advice,
                financial advice, or medical advice. Always consult with qualified professionals before
                making decisions based on information from this site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall Ignite Room, its directors, employees, or agents be liable for any indirect,
                incidental, special, consequential, or punitive damages, or any loss of profits or revenues,
                whether incurred directly or indirectly, arising from:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground">
                <li>Your use of our website</li>
                <li>Errors or omissions in our content</li>
                <li>Third-party content or links</li>
                <li>Interruption or unavailability of services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Third-Party Content
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website may contain links to third-party websites and content. Ignite Room does not
                endorse, warrant, or assume responsibility for the accuracy, legality, or content of these
                external sites. Your use of third-party websites is entirely at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Events and Activities
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Participation in Ignite Room events and activities is voluntary. Participants assume all risks
                associated with their participation. Ignite Room is not responsible for any injuries, damages,
                or losses that occur during events.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                User-Generated Content
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Users are responsible for the content they post on our platform. Ignite Room does not endorse
                or take responsibility for user-generated content. Any views or opinions expressed are those
                of the individual users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Changes to Content
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ignite Room reserves the right to modify, update, or remove any content on our website at any
                time without notice. We are not responsible for any consequences arising from such changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Contact for Clarifications
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this disclaimer, please contact us at:
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
