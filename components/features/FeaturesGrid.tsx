'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { 
  FaHeartbeat, 
  FaAppleAlt,
  FaWeight,
  FaRunning,
  FaUserMd,
  FaUserFriends,
  FaChartLine,
  FaBrain,
  FaCarrot,
  FaLeaf,
  FaPrescriptionBottle,
  FaStethoscope,
  FaDumbbell,
  FaBed,
  FaClock,
  FaCalendarAlt,
  FaChartBar,
  FaChartPie,
  FaUtensils,
  FaGlassWhiskey,
  FaBookMedical,
  FaMedkit,
  FaHospital,
  FaNotesMedical
} from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client';

const ICONS: { [key: string]: IconType } = {
  FaHeartbeat,
  FaAppleAlt,
  FaWeight,
  FaRunning,
  FaUserMd,
  FaUserFriends,
  FaChartLine,
  FaBrain,
  FaCarrot,
  FaLeaf,
  FaPrescriptionBottle,
  FaStethoscope,
  FaDumbbell,
  FaBed,
  FaClock,
  FaCalendarAlt,
  FaChartBar,
  FaChartPie,
  FaUtensils,
  FaGlassWhiskey,
  FaBookMedical,
  FaMedkit,
  FaHospital,
  FaNotesMedical
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

const itemVariants: any = {
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
  const Icon = ICONS[feature.icon_name];
  
  if (!Icon) {
    console.warn(`Icon ${feature.icon_name} not found`);
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
          <Icon className="w-7 h-7 text-gray-900 dark:text-white" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {feature.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300">
          {feature.description}
        </p>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 dark:from-gray-800/0 dark:to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
      </div>
    </motion.div>
  );
};

export default function FeaturesGrid() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

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
