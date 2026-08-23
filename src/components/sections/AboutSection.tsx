import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Target, Users, Lightbulb, Rocket } from 'lucide-react';

const goals = [
  {
    icon: Target,
    title: 'Our Goal',
    description: 'To support students at every stage of their tech journey through learning, collaboration, mentorship, and real-world exposure.',
  },
  {
    icon: Users,
    title: 'Our Space',
    description: 'A vibrant community where learners, builders, and innovators come together to share knowledge and grow collectively.',
  },
  {
    icon: Lightbulb,
    title: 'Our Vision',
    description: 'Creating a collaborative innovation ecosystem that bridges the gap between academic learning and industry readiness.',
  },
  {
    icon: Rocket,
    title: 'Our Impact',
    description: 'Helping students turn ideas into execution through hackathons, workshops, and direct connections with industry mentors.',
  },
];

function GoalCard({ goal, index }: { goal: typeof goals[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="info-block group relative p-8 h-full"
    >
      <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
        <goal.icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="font-heading text-xl font-semibold text-foreground mb-3">{goal.title}</h3>
      <p className="text-muted-foreground leading-relaxed">{goal.description}</p>
    </motion.div>
  );
}

export default function AboutSection() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section id="about" className="section-padding bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-body text-primary font-bold text-xs uppercase tracking-[0.15em] mb-4 block">
            01 / Who We Are
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            Igniting the Next Generation
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ignite Room is a student-driven technology community focused on empowering learners, 
            innovators, and builders through collaborative experiences.
          </p>
        </motion.div>

        {/* Goals Grid */}
        <div className="info-section grid grid-cols-1 lg:grid-cols-4 divide-y divide-x-0 lg:divide-y-0 lg:divide-x divide-border/60">
          {goals.map((goal, index) => (
            <GoalCard key={goal.title} goal={goal} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
