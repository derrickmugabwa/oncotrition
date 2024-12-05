'use client';

import { motion } from 'framer-motion';

export default function Banner() {
  return (
    <section className="py-20 relative overflow-hidden bg-white dark:bg-gray-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_70%)]"></div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Plans That Scale With Your Goals
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Whether you're just starting your nutrition journey or looking to take it to the next level,
            we have the perfect plan for you. All plans include our core features with additional
            benefits as you grow.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
