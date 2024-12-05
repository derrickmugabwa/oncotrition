'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}

interface Feature {
  id: number;
  title: string;
  description: string;
  icon_path: string;
  display_order: number;
}

const FeatureCard = ({ title, description, icon, delay }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <motion.div 
      className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-2xl"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
    <motion.div
      className="relative"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div 
        className="w-14 h-14 mb-6 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {icon}
      </motion.div>
      <motion.h3 
        className="text-xl font-semibold mb-3 text-gray-800 dark:text-white"
        whileHover={{ scale: 1.05, x: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {title}
      </motion.h3>
      <motion.p 
        className="text-gray-600 dark:text-gray-300"
        initial={{ opacity: 0.8 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {description}
      </motion.p>
    </motion.div>
  </motion.div>
);

export default function WhyChooseUs() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchFeatures = async () => {
      const { data, error } = await supabase
        .from('why_choose_us_features')
        .select('*')
        .order('display_order');
      
      if (!error && data) {
        setFeatures(data);
      }
    };

    fetchFeatures();
  }, []);

  const renderIcon = (path: string) => (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-950 dark:to-blue-950/30"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Why Choose Us
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Experience excellence in nutrition management with our comprehensive platform
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={renderIcon(feature.icon_path)}
              delay={index * 0.2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
