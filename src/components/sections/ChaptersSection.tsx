import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import indiaMapLight from '@/assets/figma/india-map-light.png'
import indiaMapDark from '@/assets/figma/india-map-dark.png'

const chapters = [
  'Delhi', 'Chandigarh', 'Mumbai', 'Hyderabad', 'Bangalore', 'Kolkata',
]

export default function ChaptersSection() {
  const headerRef = useRef<HTMLDivElement | null>(null)
  const isHeaderInView = useInView(headerRef, { once: true })

  return (
    <section
      id="chapters"
      className="relative section-padding bg-background overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 30 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider block mb-4">
              04 / Across India
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              One community.<br /><em className="italic">Many</em> rooms.
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mb-8">
              Ignite Room&apos;s community spans 6 cities nationwide, born out of the
              HackArena 2.0 zonal rounds, with Delhi hosting the national Grand Finale.
            </p>
            <div className="flex flex-wrap gap-2">
              {chapters.map((city) => (
                <span
                  key={city}
                  className="rounded-full border border-border/60 bg-card px-4 py-1.5 text-sm font-medium text-foreground"
                >
                  {city}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={isHeaderInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <img src={indiaMapLight} alt="Ignite Room chapters across India" className="w-full dark:hidden" />
            <img src={indiaMapDark} alt="Ignite Room chapters across India" className="w-full hidden dark:block" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
