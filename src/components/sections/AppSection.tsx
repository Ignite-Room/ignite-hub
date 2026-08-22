import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Users, Calendar, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import appPhoneMockup from '@/assets/figma/app-phone-mockup.png';
import appStoreBadge from '@/assets/figma/app-store-badge.png';
import googlePlayBadge from '@/assets/figma/google-play-badge.png';

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
              <Link to="/app" className="transition-transform hover:scale-[1.03]">
                <img src={appStoreBadge} alt="Download on the App Store" className="h-11 w-auto" />
              </Link>
              <Link to="/app" className="transition-transform hover:scale-[1.03]">
                <img src={googlePlayBadge} alt="Get it on Google Play" className="h-11 w-auto" />
              </Link>
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
              <div className="absolute inset-0 bg-primary/30 blur-[80px] rounded-full scale-75" />
              <img
                src={appPhoneMockup}
                alt="Ignite Room app preview"
                className="relative w-72 drop-shadow-2xl animate-float"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
