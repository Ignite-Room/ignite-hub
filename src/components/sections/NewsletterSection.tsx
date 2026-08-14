import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NewsletterSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get('email');
    navigate(`/newsletter${email ? `?email=${encodeURIComponent(String(email))}` : ''}`);
  };

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-2xl mx-auto text-center"
      >
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Flame className="h-6 w-6 text-primary" />
        </div>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
          Something <em className="italic text-gradient">incredible</em> is brewing.
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
          Join 12,000+ innovators, builders, and collaborators. Get updates on events, opportunities, and community news.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            className="w-full flex-1 rounded-full border border-border bg-card px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="w-full sm:w-auto shrink-0 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Get Updates
          </button>
        </form>
        <p className="text-xs text-muted-foreground mt-4">No spam, ever. Unsubscribe anytime.</p>
      </motion.div>
    </section>
  );
}
