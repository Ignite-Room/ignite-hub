import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Handshake } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/use-seo';

const partners = [
  { name: 'Physics Wallah', logo: 'pw.png' },
  { name: 'Google Developer Groups', logo: 'gdg.png' },
  { name: 'GeeksforGeeks', logo: 'gfg.png' },
  { name: 'GitHub', logo: 'github.png' },
  { name: 'MLH', logo: 'mlh.png' },
  { name: 'DevFolio', logo: 'dev.png' },
  { name: 'Daytona', logo: 'daytona.png' },
  { name: "Master's Union", logo: 'mastersunion.png' },
  { name: 'v0 by Vercel', logo: 'v0vercel.png' },
  { name: 'Para AI', logo: 'paraai.jpeg' },
  { name: 'Mozilla AI', logo: 'mozillaai.jpeg' },
  { name: 'Trae AI', logo: 'traeai.png' },
];

const benefits = [
  {
    title: 'Reach 12,000+ builders',
    description: 'Get in front of a national, highly engaged community of student developers and hackers.',
  },
  {
    title: 'Co-branded events',
    description: 'Sponsor or co-host hackathons, workshops, and zonal rounds across our 15+ city chapters.',
  },
  {
    title: 'Direct hiring pipeline',
    description: 'Connect with the Ambassador Program and top hackathon performers for internships and roles.',
  },
];

export default function PartnersPage() {
  useSEO({
    title: 'Partners & Collaborations',
    description: 'Ignite Room partners with organizations, platforms, and communities to bring hackathons, mentorship, and opportunities to student builders nationwide.',
    path: '/partners',
  });

  const gridRef = useRef(null);
  const isGridInView = useInView(gridRef, { once: true, margin: '-100px' });

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />

      <main className="relative z-10">
        {/* Hero */}
        <section className="section-padding pb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block"
            >
              Company & Partnerships
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
            >
              Building the ecosystem <span className="text-gradient">together</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto"
            >
              We work with platforms, communities, and organizations who share our mission:
              giving student developers real opportunities to learn, build, and get hired.
            </motion.p>
          </div>
        </section>

        {/* Logo grid */}
        <section className="section-padding pt-0">
          <div className="max-w-7xl mx-auto">
            <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isGridInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="group"
                >
                  <div className="aspect-square rounded-2xl bg-secondary/50 border border-border/50 flex items-center justify-center hover:bg-secondary hover:border-primary/30 transition-all duration-300">
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <img
                        src={`/partners/${partner.logo}`}
                        alt={partner.name}
                        loading="lazy"
                        decoding="async"
                        style={{ imageOrientation: 'from-image' }}
                        className="block mx-auto max-h-[66%] max-w-[66%] object-contain object-center transform-none transition-all"
                      />
                      <p className="text-sm mt-2 opacity-0 group-hover:opacity-100 text-foreground transition-opacity">
                        {partner.name}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why partner */}
        <section className="section-padding bg-secondary/30 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block">
                Why Partner With Us
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                What partners get
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-2xl bg-card border border-border/60 p-8"
                >
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Handshake className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Interested in partnering with Ignite Room?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Tell us about your organization and what you have in mind. We reply within 24 hours.
            </p>
            <Button asChild variant="default" size="lg" className="group rounded-full">
              <Link to="/contact">
                Get in touch
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
