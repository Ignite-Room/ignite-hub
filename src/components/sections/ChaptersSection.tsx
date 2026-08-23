import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import indiaMapLight from '@/assets/figma/india-map-light.png'
import indiaMapDark from '@/assets/figma/india-map-dark.png'

const chapters = [
  'Delhi', 'Chandigarh', 'Mumbai', 'Hyderabad', 'Bangalore', 'Kolkata',
]

export default function ChaptersSection() {
  const headerRef = useRef<HTMLDivElement | null>(null)
  const isHeaderInView = useInView(headerRef, { once: true })
  const navigate = useNavigate()

  const [portal, setPortal] = useState<{ city: string; x: number; y: number } | null>(null)

  const openChapter = (city: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPortal({ city, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    window.setTimeout(() => navigate(`/chapters/${city.toLowerCase()}`), 620)
  }

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
            <div className="flex flex-wrap gap-2.5">
              {chapters.map((city) => (
                <motion.button
                  key={city}
                  type="button"
                  onClick={(e) => openChapter(city, e)}
                  whileHover="hover"
                  whileTap={{ scale: 0.94 }}
                  initial="rest"
                  animate="rest"
                  className="group relative overflow-hidden rounded-full border border-border/60 bg-card px-4 py-1.5 text-sm font-medium text-foreground cursor-pointer"
                >
                  <motion.span
                    variants={{ rest: { x: '-101%' }, hover: { x: 0 } }}
                    transition={{ duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
                    className="absolute inset-0 rounded-full bg-primary"
                  />
                  <span className="relative z-10 inline-flex items-center gap-1 group-hover:text-primary-foreground transition-colors duration-200">
                    {city}
                    <motion.span
                      variants={{ rest: { opacity: 0, x: -4, width: 0 }, hover: { opacity: 1, x: 0, width: 14 } }}
                      transition={{ duration: 0.25 }}
                      className="inline-flex overflow-hidden"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
                    </motion.span>
                  </span>
                </motion.button>
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

      {/* Portal transition: the clicked chip expands into a full-bleed reveal before the route changes */}
      <AnimatePresence>
        {portal && (
          <motion.div
            key="chapter-portal"
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center bg-primary"
            style={{ originX: 0.5, originY: 0.5 }}
            initial={{
              clipPath: `circle(0px at ${portal.x}px ${portal.y}px)`,
            }}
            animate={{
              clipPath: `circle(150% at ${portal.x}px ${portal.y}px)`,
            }}
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35 }}
              className="text-center text-primary-foreground"
            >
              <span className="block text-xs uppercase tracking-[0.3em] mb-3 opacity-80">Entering chapter</span>
              <span className="font-heading text-5xl md:text-6xl font-bold">{portal.city}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
