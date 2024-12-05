'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { 
  FaHeartbeat, 
  FaChartLine, 
  FaAppleAlt, 
  FaBrain,
  FaRunning,
  FaUserFriends
} from 'react-icons/fa';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const ICONS = {
  FaHeartbeat,
  FaChartLine,
  FaAppleAlt,
  FaBrain,
  FaRunning,
  FaUserFriends
};

interface Feature {
  id: number;
  title: string;
  description: string;
  icon_name: string;
  gradient: string;
  display_order: number;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const FeatureCard = ({ feature }: { feature: Feature }) => {
  const Icon = ICONS[feature.icon_name as keyof typeof ICONS];
  
  if (!Icon) {
    return null;
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ 
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      className="relative group"
    >
      <div className="relative z-10 overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 h-full shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
        {/* Gradient Orb */}
        <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-10 dark:opacity-20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500`} />
        
        {/* Icon Container */}
        <div className={`relative inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 dark:bg-opacity-20 mb-4`}>
          <Icon className="w-6 h-6 text-gray-900 dark:text-white" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {feature.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
};

export default function FeaturesGrid() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchFeatures() {
      const { data, error } = await supabase
        .from('features_grid')
        .select('*')
        .order('display_order');
      
      if (error) {
        console.error('Error fetching features:', error);
        return;
      }

      setFeatures(data || []);
      setIsLoading(false);
    }

    fetchFeatures();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <section className="py-12 md:py-20">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
