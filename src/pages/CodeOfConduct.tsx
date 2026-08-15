import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/use-seo';

export default function CodeOfConduct() {
  useSEO({
    title: 'Code of Conduct',
    description: 'Community guidelines and code of conduct for Ignite Room members, events, and online spaces.',
    path: '/code-of-conduct',
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
            Code of Conduct
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Last updated: December 2024
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                1. Our Commitment
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ignite Room is dedicated to providing a welcoming, inclusive, and respectful environment
                for all community members. We are committed to creating a community where everyone feels
                safe, valued, and empowered to contribute their best work.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                2. Expected Behavior
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                All community members are expected to:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground">
                <li>Be respectful and inclusive in all interactions</li>
                <li>Listen actively and value diverse perspectives</li>
                <li>Use inclusive and welcoming language</li>
                <li>Be professional and constructive in feedback</li>
                <li>Respect others' boundaries and personal space</li>
                <li>Contribute positively to the community</li>
                <li>Help create a safe environment for all</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                3. Unacceptable Behavior
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The following behaviors are considered unacceptable and will not be tolerated:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground">
                <li>Harassment, bullying, or intimidation</li>
                <li>Discrimination based on race, gender, religion, sexuality, disability, or other characteristics</li>
                <li>Sexual harassment or unwanted advances</li>
                <li>Threats or violent language</li>
                <li>Hate speech or abusive language</li>
                <li>Trolling or deliberately disruptive behavior</li>
                <li>Sharing others' private information without consent</li>
                <li>Plagiarism or intellectual property violations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                4. Diversity and Inclusion
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ignite Room welcomes and celebrates the diversity of our community. We are committed to
                creating an environment where people of all backgrounds, experiences, and perspectives feel
                valued and included. Discrimination of any kind is not tolerated.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                5. Reporting and Enforcement
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you experience or witness unacceptable behavior:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground">
                <li>Report the incident to our conduct team</li>
                <li>Provide as much detail as possible</li>
                <li>All reports will be treated confidentially</li>
                <li>No retaliation will be tolerated</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Violations of this Code of Conduct may result in warnings, temporary removal,
                or permanent bans from the community, depending on the severity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                6. Attribution
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                This Code of Conduct is adapted from the Contributor Covenant, version 2.0, and the
                community guidelines of leading tech communities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                7. Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions or to report violations of this Code of Conduct, please contact:
              </p>
              <p className="text-muted-foreground mt-3">
                Email: <a href="mailto:admin@igniteroom.in" className="text-primary hover:underline">admin@igniteroom.in</a>
              </p>
              <p className="text-muted-foreground mt-2">
                We take all reports seriously and will respond promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                8. Updates
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Code of Conduct at any time. We will notify community members of
                significant changes and welcome feedback on how we can improve our community standards.
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
