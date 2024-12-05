'use client';

import Hero from '@/components/features/Hero';
import Banner from '@/components/features/Banner';
import FeaturesGrid from '@/components/features/FeaturesGrid';
import { motion } from 'framer-motion';

export default function Features() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
    >
      <Hero />
      <Banner />
      <FeaturesGrid />
    </motion.div>
  );
}
