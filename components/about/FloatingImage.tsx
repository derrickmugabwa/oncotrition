'use client';

import { motion } from 'framer-motion';
import { BorderTrail } from '../ui/border-trail';

interface FloatingImageProps {
  position?: string;
  className?: string;
  imageUrl: string;
  altText?: string;
  borderTrailColor?: string;
  useBorderTrail?: boolean;
}

export default function FloatingImage({
  position = 'absolute',
  className = '',
  imageUrl,
  altText = 'Floating image',
  borderTrailColor = 'bg-emerald-500',
  useBorderTrail = true
}: FloatingImageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      viewport={{ once: true }}
      className={`${position} z-20 bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl
                backdrop-blur-sm border border-white/50 dark:border-gray-700/50 overflow-hidden
                w-full max-w-[240px] relative ${className}`}
    >
      {useBorderTrail && <BorderTrail className={borderTrailColor} size={8} />}
      <div className="p-2">
        <div className="overflow-hidden rounded-xl h-[160px]">
          <img 
            src={imageUrl} 
            alt={altText} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          />
        </div>
      </div>
    </motion.div>
  );
}
