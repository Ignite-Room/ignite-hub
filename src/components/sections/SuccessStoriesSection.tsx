import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Quote } from 'lucide-react';

const stories = [
  {
    quote: "Won HackArena 2.0 Mumbai Zonal and landed my first design internship through the connections I made. The ROI is insane.",
    name: 'Rahul Nair',
    role: 'Product Designer · Mumbai',
  },
  {
    quote: "I walked into Ignite & Initiate not knowing anyone. Six months later half my team came from that room.",
    name: 'Sanya Kapoor',
    role: 'Founder · Delhi',
  },
  {
    quote: "The Ambassador Program taught me more about running a community than any internship could have.",
    name: 'Aarav Mehta',
    role: 'Campus Ambassador · Bangalore',
  },
];

export default function SuccessStoriesSection() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % stories.length), 6000);
    return () => clearInterval(id);
  }, []);

  const story = stories[active];

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider block mb-4">
            04 / Success Stories
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
            They <em className="italic text-gradient">Built</em>, They <em className="italic text-gradient">Won</em>, They <em className="italic text-gradient">Grew</em>.
          </h2>
        </motion.div>

        <div className="rounded-2xl bg-card border border-border/60 p-10 md:p-14 min-h-[260px] flex flex-col items-center justify-center">
          <Quote className="w-8 h-8 text-primary/40 mb-6" />
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-xl md:text-2xl font-heading font-medium text-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
                &ldquo;{story.quote}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="h-11 w-11 rounded-full bg-primary/15 flex items-center justify-center text-sm font-semibold text-primary">
                  {story.name.split(' ').map((n) => n[0]).join('')}
                </span>
                <div className="text-left">
                  <p className="font-heading font-semibold text-foreground text-sm">{story.name}</p>
                  <p className="text-xs text-muted-foreground">{story.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8">
          {stories.map((s, i) => (
            <button
              key={s.name}
              aria-label={`Show story from ${s.name}`}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-primary' : 'w-2 bg-border'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
