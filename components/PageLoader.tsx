'use client';

import { useLoading } from '@/providers/LoadingProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageLoader() {
  const { isLoading } = useLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-gray-900"
        >
          <div className="relative">
            {/* Main loader circle */}
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>
            
            {/* Loading text */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600 dark:text-gray-300">
              Loading...
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
