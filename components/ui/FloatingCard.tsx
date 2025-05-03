'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { BorderTrail } from './border-trail';

interface FloatingCardProps {
  title: string;
  icon?: ReactNode;
  position?: string;
  className?: string;
  children: ReactNode;
  showBorderTrail?: boolean;
  borderTrailColor?: string;
}

export default function FloatingCard({
  title,
  icon,
  position = 'absolute -top-6 -left-16',
  className = '',
  children,
  showBorderTrail = true,
  borderTrailColor = 'bg-emerald-500'
}: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      viewport={{ once: true }}
      className={`${position} z-20 bg-white/95 dark:bg-gray-800/95 rounded-3xl shadow-xl
                backdrop-blur-sm border border-white/50 dark:border-gray-700/50 overflow-hidden
                relative ${className}`}
    >
      {showBorderTrail && (
        <BorderTrail className={borderTrailColor} size={12} />
      )}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
              {icon}
            </div>
          )}
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h4>
        </div>
        <div className="space-y-3">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
