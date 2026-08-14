import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Linkedin, Github } from 'lucide-react';
import { team } from '../../lib/team';

function TeamMember({ member, index }: { member: typeof team[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/40 transition-all duration-500">
        {/* Image */}
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-60" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-heading text-xl font-bold text-foreground">{member.name}</h3>
          <p className="text-primary font-medium text-sm">{member.role}</p>

          {/* Social Links - appear on hover */}
          <div className="flex items-center gap-3 mt-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <a
              href={member.linkedin}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={member.github}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TeamSection() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section id="team" className="section-padding bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block">
            Meet the Team
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            The People Behind Ignite
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Passionate developers driving innovation and building a community
            that empowers the next generation of tech leaders.
          </p>
        </motion.div>

        {/* Team Grid (show first 3 on main page) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.slice(0, 3).map((member, index) => (
            <TeamMember key={member.name} member={member} index={index} />
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="/team"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium shadow-sm hover:brightness-95 transition"
          >
            View full team
          </a>
        </div>
      </div>
    </section>
  );
}
