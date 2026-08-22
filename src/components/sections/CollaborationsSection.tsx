import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

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

export default function CollaborationsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block">
            06 / Our Partners
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Trusted Collaborations
          </h2>
          <Link
            to="/partners"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-4 group"
          >
            See all partnerships
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
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
                  <p className="text-xs mt-2 opacity-0 group-hover:opacity-100 text-white transition-opacity">
                    {partner.name}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
