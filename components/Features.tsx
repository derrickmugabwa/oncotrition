'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  BeakerIcon, ChartBarIcon, ClockIcon, CogIcon, 
  CurrencyDollarIcon, DocumentTextIcon, HeartIcon, 
  LightBulbIcon, ScaleIcon, SparklesIcon, UserGroupIcon,
  ShieldCheckIcon, StarIcon, TrophyIcon, FireIcon,
  BoltIcon, GlobeAltIcon, PresentationChartLineIcon,
  AcademicCapIcon, HandThumbUpIcon
} from '@heroicons/react/24/outline';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon_name: string;
  order: number;
}

const featureIcons = {
  beaker: BeakerIcon,
  chart: ChartBarIcon,
  clock: ClockIcon,
  cog: CogIcon,
  dollar: CurrencyDollarIcon,
  document: DocumentTextIcon,
  heart: HeartIcon,
  bulb: LightBulbIcon,
  scale: ScaleIcon,
  sparkles: SparklesIcon,
  users: UserGroupIcon,
  shield: ShieldCheckIcon,
  star: StarIcon,
  trophy: TrophyIcon,
  fire: FireIcon,
  bolt: BoltIcon,
  globe: GlobeAltIcon,
  presentation: PresentationChartLineIcon,
  academic: AcademicCapIcon,
  thumbUp: HandThumbUpIcon,
};

const defaultFeatures = [
  {
    id: 1,
    title: "Personalized Nutrition Plans",
    description: "Get customized meal plans tailored to your specific goals, preferences, and dietary requirements.",
    icon_name: "scale",
    order: 0
  },
  {
    id: 2,
    title: "Expert Guidance",
    description: "Access to certified nutritionists and health experts who provide professional guidance and support.",
    icon_name: "academic",
    order: 1
  },
  {
    id: 3,
    title: "Progress Tracking",
    description: "Monitor your health journey with our advanced tracking tools and detailed analytics dashboard.",
    icon_name: "chart",
    order: 2
  },
  {
    id: 4,
    title: "Community Support",
    description: "Join our vibrant community of health enthusiasts and share experiences, tips, and success stories.",
    icon_name: "users",
    order: 3
  }
];

const FeatureCard = ({ title, description, icon_name, index }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true });
  const IconComponent = featureIcons[icon_name] || featureIcons.scale;

  return (
    <motion.div 
      ref={cardRef}
      initial={{ opacity: 0, x: 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ 
        scale: 1.03,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        transition: { type: "spring", stiffness: 400, damping: 17 }
      }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg transition-all duration-300 h-full flex flex-col cursor-pointer"
    >
      <div className="flex flex-col h-full">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
          className="flex items-start space-x-4 mb-4"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="flex-shrink-0"
          >
            <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl text-primary">
              <IconComponent className="w-6 h-6" />
            </div>
          </motion.div>
          <motion.h3 
            whileHover={{ scale: 1.05 }}
            className="text-xl font-semibold text-gray-800 dark:text-white"
          >
            {title}
          </motion.h3>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
          className="text-gray-600 dark:text-gray-300 flex-grow"
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default function Features() {
  const [features, setFeatures] = useState<Feature[]>(defaultFeatures);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchFeatures = async () => {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .order('order');

      if (error) {
        console.error('Error fetching features:', error);
        return;
      }

      if (data && data.length > 0) {
        setFeatures(data);
      }
    };

    fetchFeatures();

    // Subscribe to changes
    const channel = supabase
      .channel('features_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'features'
        },
        () => {
          fetchFeatures();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-purple-100 via-indigo-100/70 to-blue-100 dark:from-purple-900/30 dark:via-indigo-900/20 dark:to-blue-900/30">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-200/30 via-white/40 to-blue-200/30 dark:from-purple-500/10 dark:via-gray-900/40 dark:to-blue-500/10 pointer-events-none"></div>
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-full animate-drift"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-secondary/20 to-transparent rounded-full animate-drift-reverse"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side content */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Nutrition software for professionals and their clients
              </span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
            >
              We systematically collect the feedback of thousands of our users (your peers) to learn how to eliminate the biggest pains in running their practices/businesses. Whether you are a 
              nutritionist, personal trainer, or coach, Smartspoon can work for you.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex space-x-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
              >
                Get Started
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right side features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.id} {...feature} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
