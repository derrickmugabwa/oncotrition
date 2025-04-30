'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import {
  HeartIcon,
  ScaleIcon,
  ChartBarIcon,
  BeakerIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface HomepageSmartspoon {
  id: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  image_url: string;
  services: Service[];
}

type HomepageSmartspoonRow = Database['public']['Tables']['homepage_smartspoon']['Row'];

const iconMap = {
  HeartIcon,
  ScaleIcon,
  ChartBarIcon,
  BeakerIcon,
  ClockIcon,
  SparklesIcon
};

const defaultServices: Service[] = [
  {
    id: 1,
    title: "Smart Meal Tracking",
    description: "Automatically track your meals and portions with our intelligent spoon",
    icon: "ClockIcon"
  },
  {
    id: 2,
    title: "Real-time Analytics",
    description: "Get instant nutritional insights as you eat with advanced sensors",
    icon: "ChartBarIcon"
  },
  {
    id: 3,
    title: "Nutrient Detection",
    description: "Advanced technology that detects macro and micronutrients in your food",
    icon: "BeakerIcon"
  },
  {
    id: 4,
    title: "Smart Recommendations",
    description: "Receive personalized dietary suggestions based on your eating habits",
    icon: "SparklesIcon"
  }
];

const ServiceCard = ({ service, index }: { service: Service; index: number }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true });
  const Icon = iconMap[service.icon as keyof typeof iconMap] || SparklesIcon;

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
      className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg transition-all duration-300 h-full flex flex-col cursor-pointer border border-emerald-100 dark:border-emerald-900/20"
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
            <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Icon className="w-6 h-6" />
            </div>
          </motion.div>
          <motion.h3 
            whileHover={{ scale: 1.05 }}
            className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent"
          >
            {service.title}
          </motion.h3>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
          className="text-gray-600 dark:text-gray-300 flex-grow"
        >
          {service.description}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default function HomepageSmartspoon() {
  const [smartspoonData, setSmartspoonData] = useState<HomepageSmartspoon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchSmartspoonData();
  }, []);

  const fetchSmartspoonData = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_smartspoon')
        .select('*')
        .single();

      console.log('Fetched data:', data);

      if (error) {
        console.error('Error fetching smartspoon data:', error);
        return;
      }

      if (data) {
        // Convert the services array from jsonb[] to Service[]
        const parsedServices = data.services && Array.isArray(data.services) && data.services.length > 0 
          ? data.services.map((service: any) => ({
              id: service.id,
              title: service.title,
              description: service.description,
              icon: service.icon
            }))
          : defaultServices;

        console.log('Parsed services:', parsedServices);

        const smartspoonData = {
          id: data.id,
          title: data.title || 'Smart Spoon Technology',
          description: data.description || 'Experience the future of nutrition tracking with our innovative smart spoon that helps you make informed dietary decisions in real-time.',
          button_text: data.button_text || 'Learn More About Smart Spoon',
          button_link: data.button_link || '/smart-spoon',
          image_url: data.image_url || '/smartspoon.jpg',
          services: parsedServices
        };

        console.log('Setting smartspoon data:', smartspoonData);
        setSmartspoonData(smartspoonData);
      }
    } catch (error) {
      console.error('Error fetching smartspoon data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Current smartspoon data:', smartspoonData);
  }, [smartspoonData]);

  const services = smartspoonData?.services || defaultServices;
  const title = smartspoonData?.title || 'Smart Spoon Technology';
  const description = smartspoonData?.description || 'Experience the future of nutrition tracking with our innovative smart spoon that helps you make informed dietary decisions in real-time.';
  const buttonText = smartspoonData?.button_text || 'Learn More About Smart Spoon';
  const buttonLink = smartspoonData?.button_link || '/smart-spoon';
  const imageUrl = smartspoonData?.image_url || '/smartspoon.jpg';

  console.log('Rendered values:', { title, description, services });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <section className="relative py-12 overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/10">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-200/30 via-white/40 to-teal-200/30 dark:from-emerald-500/10 dark:via-gray-900/40 dark:to-teal-500/10 pointer-events-none"></div>
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-teal-500/20 to-transparent rounded-full"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Title and Description */}
        <div
          className="text-center max-w-4xl mx-auto mb-12 relative z-20"
        >
          <h2 
            className="text-4xl font-bold mb-6 text-emerald-600 dark:text-emerald-400"
          >
            {title || 'Smart Spoon Technology'}
          </h2>
          <p 
            className="text-gray-800 dark:text-gray-200 text-lg mx-auto"
          >
            {description || 'Experience the future of nutrition tracking with our innovative smart spoon that helps you make informed dietary decisions in real-time.'}
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
              />
            ))}
          </div>

          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src={imageUrl}
              alt="Smart Spoon Technology"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
              <motion.a
                href={buttonLink}
                className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {buttonText}
                <svg
                  className="ml-2 -mr-1 w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
