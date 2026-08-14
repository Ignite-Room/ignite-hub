import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, MapPin } from 'lucide-react'

type Chapter = {
  city: string
  tag: string
  top: string
  left: string
}

const chapters: Chapter[] = [
  { city: 'Delhi', tag: 'HQ · Grand Finale', top: '18%', left: '52%' },
  { city: 'Chandigarh', tag: 'Zonal Chapter', top: '10%', left: '44%' },
  { city: 'Mumbai', tag: 'Zonal Chapter', top: '58%', left: '28%' },
  { city: 'Hyderabad', tag: 'Zonal Chapter', top: '64%', left: '46%' },
  { city: 'Bangalore', tag: 'Zonal Chapter', top: '78%', left: '40%' },
  { city: 'Kolkata', tag: 'Zonal Chapter', top: '40%', left: '68%' },
]

// Decorative silhouette suggesting India's outline, not a literal cartographic trace.
const INDIA_CLIP =
  'polygon(50% 2%, 58% 5%, 63% 9%, 71% 11%, 79% 17%, 83% 23%, 80% 30%, 86% 36%, 89% 43%, 83% 49%, 79% 56%, 74% 63%, 68% 71%, 62% 81%, 56% 91%, 50% 99%, 46% 91%, 42% 82%, 38% 74%, 33% 67%, 27% 60%, 21% 52%, 17% 44%, 14% 36%, 18% 28%, 23% 20%, 29% 14%, 35% 10%, 40% 6%)'

export default function ChaptersSection() {
  const headerRef = useRef<HTMLDivElement | null>(null)
  const isHeaderInView = useInView(headerRef, { once: true })

  return (
    <section
      id="chapters"
      className="relative section-padding bg-background overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-14 items-center">
        {/* Copy */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider block mb-4">
            05 / Near You
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            One community. <br /><em className="italic text-gradient">Many</em> rooms.
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mb-8">
            Find your local ignition point, or start the next one. Ignite Room&apos;s chapters span 6 cities nationwide, with Delhi hosting the national Grand Finale.
          </p>
          <a
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Explore chapters <ArrowRight className="w-4 h-4" />
          </a>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-10">
            {chapters.map((chapter) => (
              <div key={chapter.city} className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-sm text-foreground font-medium">{chapter.city}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Map visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative aspect-square max-w-md mx-auto w-full rounded-[2rem] bg-gradient-card border border-border/60 p-6"
        >
          <div className="absolute inset-0 bg-primary/5 rounded-[2rem] blur-2xl pointer-events-none" />
          <div className="relative h-full w-full">
            <div
              className="absolute inset-6 bg-primary/15"
              style={{ clipPath: INDIA_CLIP }}
            />
            <div
              className="absolute inset-6 border-2 border-dashed border-primary/40"
              style={{ clipPath: INDIA_CLIP }}
            />

            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter.city}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ top: chapter.top, left: chapter.left }}
              >
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                </span>
                <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-card border border-border/60 px-2.5 py-1 text-[11px] font-medium text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {chapter.city}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
