import { useRef, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}

/** Shared fade-and-rise-on-scroll wrapper, matching the motion language used across section components. */
export default function RevealOnScroll({ children, className = '', delay = 0, y = 30, once = true }: RevealOnScrollProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
