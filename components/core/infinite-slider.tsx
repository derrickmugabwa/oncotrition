'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface InfiniteSliderProps {
  children: React.ReactNode;
  gap?: number;
  reverse?: boolean;
}

export function InfiniteSlider({ children, gap = 16, reverse = false }: InfiniteSliderProps) {
  const [width, setWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sliderRef.current && containerRef.current) {
      const scrollWidth = sliderRef.current.scrollWidth / 2; // Divide by 2 because we duplicate content
      setWidth(scrollWidth);
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [children]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]"
    >
      <motion.div
        ref={sliderRef}
        className="flex items-center"
        style={{ gap }}
        animate={{
          x: reverse ? [-width / 2, -width] : [-width, -width / 2],
        }}
        transition={{
          x: {
            duration: 30,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop"
          },
        }}
      >
        {/* Original items */}
        {children}
        {/* Duplicate items for seamless loop */}
        {children}
        {/* Another duplicate to ensure no gaps */}
        {children}
      </motion.div>
    </div>
  );
}
