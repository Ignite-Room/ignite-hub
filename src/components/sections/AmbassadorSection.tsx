import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Award, Target, Rocket, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const perks = [
  {
    icon: Rocket,
    title: 'Lead & Innovate',
    description: 'Spearhead events, workshops, and initiatives on your campus.',
  },
  {
    icon: Users,
    title: 'Exclusive Network',
    description: 'Connect with top students, mentors, and industry experts.',
  },
  {
    icon: Award,
    title: 'Earn Rewards',
    description: 'Gain access to exclusive merch, certificates, and premium resources.',
  },
  {
    icon: Target,
    title: 'Career Growth',
    description: 'Add a prestigious role to your resume with real-world impact.',
  }
];

export default function AmbassadorSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="ambassador" className="section-padding relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/20 blur-[80px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <span className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block">
                Campus Ambassador Program
              </span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Become the Voice of <br />
                <span className="text-gradient">Ignite Room</span> on Your Campus
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Step up as a student leader. Build vibrant communities, organize tech events, 
                and unlock exclusive opportunities that will accelerate your career journey.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button asChild variant="hero" size="lg" className="group">
                <Link to="/ambassador">
                  Join the Program
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Visual Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {perks.map((perk, index) => (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="bg-background/40 backdrop-blur-md border border-border/50 p-6 rounded-2xl hover:bg-background/60 transition-colors duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <perk.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                    {perk.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {perk.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Decorative element */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-primary/20 to-secondary/20 blur-[60px] rounded-full scale-110" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
