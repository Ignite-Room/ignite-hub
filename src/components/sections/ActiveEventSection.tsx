import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Flame } from 'lucide-react'

export default function ActiveEventSection() {
  const ref = useRef<HTMLDivElement | null>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section
      id="active-event"
      className="relative section-padding bg-background overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Red Label */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 mb-6"
          >
            <Flame className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary font-semibold text-xs uppercase tracking-widest">
              Active Event
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight"
          >
            Conquer The{' '}
            <span className="text-gradient">Break</span>
          </motion.h2>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-primary/80 font-medium mb-4 max-w-2xl mx-auto"
          >
            Ignite Room presents an exclusive fireside chat with{' '}
            <span className="text-primary font-semibold">Piyush Sharma</span>{' '}
            <span className="text-muted-foreground">(@trickymanofficial)</span>
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            A high-impact session designed to help students plan internships,
            projects, skills, and strategy for their summer break.
          </motion.p>
        </motion.div>

        {/* Luma Embed Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative rounded-md border border-primary/25 overflow-hidden bg-gradient-card shadow-[0_0_60px_hsl(345_100%_59%_/_0.08)]"
        >
          {/* Top accent bar */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

          {/* Iframe wrapper — preserves 16px border-radius on mobile */}
          <div className="w-full overflow-hidden">
            <iframe
              src="https://lu.ma/embed/event/evt-8fdmyuCPECKcpqg/simple"
              width="100%"
              height="600"
              frameBorder="0"
              style={{ borderRadius: '0 0 16px 16px', display: 'block' }}
              title="Conquer The Break: Luma Event"
              allowFullScreen
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
