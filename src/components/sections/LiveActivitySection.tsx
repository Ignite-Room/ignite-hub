import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Award, Rocket, UserPlus, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const activity = [
  { icon: UserPlus, text: 'Arjun M. registered for HackArena 2.0 Delhi Zonal', time: '2m ago' },
  { icon: Users2, text: 'Priya S. joined Bangalore Chapter', time: '8m ago' },
  { icon: Award, text: 'Team Nexus won 1st place at Hack the Flame', time: '1h ago' },
  { icon: Rocket, text: 'Rahul N. published a project: AI Resume Builder', time: '3h ago' },
  { icon: Users2, text: 'Sneha P. started organizing a Pune workshop', time: '5h ago' },
  { icon: UserPlus, text: 'Dev Collective registered for Agent Labs by Phinite', time: '1d ago' },
];

export default function LiveActivitySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="community" className="section-padding bg-secondary/30 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-14 items-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider block mb-4">
            06 / Live Activity
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            The Community <br />Never <em className="italic text-gradient">Sleeps</em>.
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mb-8">
            12,000 members are always building, joining, winning, and shipping.
          </p>
          <Button
            variant="default"
            size="lg"
            className="rounded-full"
            onClick={() => window.open('https://chat.whatsapp.com/HqqpmbtlbF7DESwKgd5Mc6', '_blank')}
          >
            Join the Community
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl bg-card border border-border/60 p-6 md:p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Activity Feed</span>
          </div>
          <ul className="space-y-5">
            {activity.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-4 w-4 text-primary" />
                </span>
                <div className="flex-1">
                  <p className="text-sm text-foreground leading-snug">{item.text}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
