import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { ArrowRight, Play, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const filters = ['Hackathon', 'Workshop', 'Meetup'];

const whatsOn = [
  {
    tag: 'Bangalore',
    title: "HackArena 2.0 Bangalore Zonal",
    gradient: 'from-[hsl(345_70%_45%)] to-[hsl(20_70%_45%)]',
  },
  {
    tag: 'Online + Delhi',
    title: 'Designing products people choose',
    gradient: 'from-[hsl(265_50%_45%)] to-[hsl(345_60%_45%)]',
  },
  {
    tag: 'Community',
    title: 'Build in public: the founder room',
    gradient: 'from-[hsl(20_65%_45%)] to-[hsl(345_75%_40%)]',
  },
];

export default function WhatsOnSection() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  return (
    <section id="events" className="relative section-padding bg-background overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12"
        >
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider block mb-4">
              02 / What&apos;s On
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
              The room is <em className="italic text-gradient">always</em> moving.
            </h2>
          </div>
          <p className="text-muted-foreground text-base max-w-sm">
            Unmissable rooms, workshops, and weekends with people who will become your next creative advantage.
          </p>
        </motion.div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search the room"
              className="w-full rounded-full border border-border bg-card pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter((f) => (f === filter ? null : filter))}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${activeFilter === filter
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {whatsOn.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-primary/40 transition-all"
            >
              <div className={`relative h-40 bg-gradient-to-br ${item.gradient}`}>
                <span className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground">
                  {item.tag}
                </span>
                <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </span>
              </div>
              <div className="p-5 flex items-center justify-between gap-3">
                <h3 className="font-heading font-semibold text-foreground leading-snug">{item.title}</h3>
              </div>
              <div className="px-5 pb-5">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                >
                  Reserve a spot <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-16">
          <Link to="/events" className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors">
            View all upcoming events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Organizer CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-secondary/60 border border-border/60 p-8 md:p-10 text-center"
        >
          <p className="text-muted-foreground mb-1">Want to host your own event on Ignite Room?</p>
          <p className="font-heading text-xl md:text-2xl font-bold text-foreground mb-6">
            Become a <span className="text-gradient">Community Organizer</span>
          </p>
          <Button asChild variant="default" size="lg" className="rounded-full">
            <Link to="/events/organizers/apply">Apply to Become an Organizer</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
