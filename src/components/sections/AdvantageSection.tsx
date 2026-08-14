import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Compass, MessageCircle, Sparkles } from 'lucide-react';

const advantages = [
  {
    icon: Compass,
    title: 'Find your people',
    description: 'Meet the developers and creators who understand the problem before you begin to explain it.',
  },
  {
    icon: MessageCircle,
    title: 'Build out loud',
    description: 'Turn every draft into a conversation, and every conversation into a better move.',
  },
  {
    icon: Sparkles,
    title: 'Go farther together',
    description: 'Access to mentors, collaborators, and opportunities built to compound.',
  },
];

const feed = [
  { name: 'Ananya Rao', action: 'started a prototype in Ember with 3 collaborators.' },
  { name: 'Karan Shah', action: 'is looking for a frontend collaborator.' },
  { name: 'Nina Iyer', action: 'registered for Build in Public.' },
];

export default function AdvantageSection() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });
  const gridRef = useRef(null);
  const isGridInView = useInView(gridRef, { once: true, margin: '-100px' });

  return (
    <section className="section-padding bg-secondary/30 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16"
        >
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider block mb-4">
              03 / The Advantage
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
              More signal. <em className="italic text-gradient">Less</em> noise.
            </h2>
          </div>
          <p className="text-muted-foreground text-base max-w-sm">
            A community infrastructure for the people choosing to make things happen.
          </p>
        </motion.div>

        <div ref={gridRef} className="grid md:grid-cols-3 gap-6 mb-10">
          {advantages.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isGridInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.12 }}
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-card border border-border/60 p-8"
          >
            <p className="text-3xl text-primary/40 font-heading leading-none mb-3">&ldquo;</p>
            <p className="text-foreground text-lg leading-relaxed mb-6">
              Ignite Room made a massive campus feel beautifully small. I found my co-founder over a design jam and we&apos;re still building.
            </p>
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-primary/20" />
              <div>
                <p className="font-heading font-semibold text-foreground text-sm">Nandini Agarwal</p>
                <p className="text-xs text-muted-foreground">Co-founder</p>
              </div>
            </div>
          </motion.div>

          {/* Live community feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl bg-card border border-border/60 p-8 flex flex-col"
          >
            <span className="text-primary font-medium text-xs uppercase tracking-wider mb-5">
              Live Community Feed
            </span>
            <ul className="space-y-4 flex-1">
              {feed.map((item) => (
                <li key={item.name} className="flex items-start gap-3">
                  <span className="mt-1 h-8 w-8 shrink-0 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary">
                    {item.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                  <p className="text-sm text-muted-foreground leading-snug">
                    <span className="text-foreground font-medium">{item.name}</span> {item.action}
                  </p>
                </li>
              ))}
            </ul>
            <a href="#community" className="mt-6 text-sm font-medium text-primary">
              Open community feed &rarr;
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
