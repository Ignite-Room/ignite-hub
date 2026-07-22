import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { MapPin } from 'lucide-react'

type Chapter = {
  city: string
  tag: string
}

const chapters: Chapter[] = [
  { city: 'Delhi', tag: 'HQ · Grand Finale' },
  { city: 'Chandigarh', tag: 'Zonal Chapter' },
  { city: 'Mumbai', tag: 'Zonal Chapter' },
  { city: 'Hyderabad', tag: 'Zonal Chapter' },
  { city: 'Bangalore', tag: 'Zonal Chapter' },
  { city: 'Kolkata', tag: 'Zonal Chapter' },
]

export default function ChaptersSection() {
  const headerRef = useRef<HTMLDivElement | null>(null)
  const isHeaderInView = useInView(headerRef, { once: true })
  const gridRef = useRef(null)
  const isGridInView = useInView(gridRef, { once: true, margin: '-100px' })

  return (
    <section
      id="chapters"
      className="relative section-padding bg-background overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider block mb-4">
            Across India
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Our City Chapters
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            IgniteRoom's community spans 6 cities nationwide, born out of the
            HackArena 2.0 zonal rounds, with Delhi hosting the national Grand Finale.
          </p>
        </motion.div>

        <div
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.city}
              initial={{ opacity: 0, y: 20 }}
              animate={isGridInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative rounded-2xl bg-gradient-card border border-border/60 p-6 text-center hover:border-primary/40 transition-all"
            >
              <div className="flex items-center justify-center mb-3">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold group-hover:text-gradient transition-all">
                {chapter.city}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{chapter.tag}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
