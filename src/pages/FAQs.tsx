import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/use-seo';

export default function FAQs() {
  useSEO({
    title: 'FAQs',
    description: 'Frequently asked questions about Ignite Room — how to join, event participation, mentorship, and how to get involved with the community.',
    path: '/faqs',
  });

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: 'How do I join Ignite Room?', a: 'Click Join Us in the navbar or visit the Join Us page and fill the form.' },
    { q: 'Are events free to attend?', a: 'Most community events are free; some workshops or bootcamps may have fees.' },
    { q: 'How can I contribute?', a: 'You can volunteer, mentor, write blog posts, or host events.' },
    { q: 'Do you offer mentorship?', a: 'Yes, we pair experienced members with learners for mentorship.' },
    { q: 'How do I submit an idea?', a: 'Use the Contact page or post in our community channels.' },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />

      <main className="relative z-10 w-full">
        <section className="w-full px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl font-heading font-bold text-foreground mb-4">FAQs</h1>
              <p className="text-muted-foreground mb-8">Frequently asked questions about the community and events.</p>

              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-secondary/50 border border-border/50 rounded-lg">
                    <button
                      className="w-full text-left px-4 py-3 flex items-center justify-between"
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    >
                      <span className="font-medium text-foreground">{faq.q}</span>
                      <span className="text-muted-foreground">{openIndex === i ? '−' : '+'}</span>
                    </button>
                    {openIndex === i && (
                      <div className="px-4 pb-4 text-muted-foreground">{faq.a}</div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
