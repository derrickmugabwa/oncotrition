'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AboutAnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function AboutAnimatedSection({ 
  children, 
  className = "", 
  delay = 0 
}: AboutAnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ 
        duration: 0.8,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
