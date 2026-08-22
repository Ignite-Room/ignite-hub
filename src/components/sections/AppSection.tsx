import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Smartphone, Users, Calendar, Bell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Users,
    title: 'Connect with Mentors',
    description: 'Access to industry professionals for guidance and career advice.',
  },
  {
    icon: Calendar,
    title: 'Event Access',
    description: 'Register for hackathons, workshops, and exclusive meetups.',
  },
  {
    icon: Bell,
    title: 'Real-time Updates',
    description: 'Never miss an opportunity with instant notifications.',
  },
];

export default function AppSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="app" className="section-padding bg-secondary/30 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                05 / Ignite Room App
              </span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
                Your Community,
                <br />
                <span className="text-gradient">In Your Pocket</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Stay connected with the Ignite Room community wherever you go.
                Access mentorship, manage events, and unlock exclusive opportunities,
                all from one powerful app.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Download Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button asChild variant="hero" size="lg" className="group">
                <Link to="/app">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  App Store
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="heroOutline" size="lg" className="group">
                <Link to="/app">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
                  </svg>
                  Play Store
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50, y: 20 }}
            animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/30 blur-[80px] rounded-full scale-75" />

              {/* Phone frame */}
              <div className="relative w-72 h-[580px] bg-gradient-to-b from-muted to-background rounded-[3rem] border-4 border-border p-3 shadow-2xl animate-float">
                <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-7 bg-background rounded-b-2xl z-10" />

                  {/* Screen content */}
                  <div className="w-full h-full bg-gradient-to-b from-secondary to-background p-6 pt-12">
                    <div className="flex items-center gap-3 mb-8">
                      <Smartphone className="w-8 h-8 text-primary" />
                      <span className="font-heading font-bold text-lg text-foreground">Ignite Room</span>
                    </div>

                    <div className="space-y-4">
                      <div className="h-20 bg-primary/20 rounded-xl animate-pulse" />
                      <div className="h-16 bg-muted rounded-xl" />
                      <div className="h-16 bg-muted rounded-xl" />
                      <div className="h-24 bg-primary/10 rounded-xl border border-primary/30" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
