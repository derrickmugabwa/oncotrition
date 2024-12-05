'use client';

import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <motion.div
        className="relative w-16 h-16"
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="absolute w-full h-full border-4 border-primary/20 rounded-full" />
        <div className="absolute w-full h-full border-4 border-transparent border-t-primary rounded-full animate-spin" />
      </motion.div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
