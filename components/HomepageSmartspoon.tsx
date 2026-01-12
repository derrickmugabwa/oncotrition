'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/types/supabase';
import { Button } from '@/components/ui/button';
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

const defaultServices: Service[] = [];

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
      className="group relative rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 dark:from-teal-950/30 dark:via-emerald-950/30 dark:to-cyan-950/30 dark:border-teal-800 p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-teal-400 dark:hover:border-teal-600 h-full flex flex-col cursor-pointer overflow-hidden"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/3 via-transparent to-emerald-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Decorative circle */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
      <div className="flex flex-col h-full relative z-10">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
          className="mb-3"
        >
          <div className="w-12 h-12 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-card-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
            {service.title}
          </h3>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
          className="text-gray-600 dark:text-gray-300 flex-grow text-sm"
        >
          {service.description}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default function HomepageSmartspoon() {
  const [smartspoonData, setSmartspoonData] = useState<HomepageSmartspoon | null>(null);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const supabase = createClient();

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
          title: data.title || '',
          description: data.description || '',
          button_text: data.button_text || '',
          button_link: data.button_link || '',
          image_url: data.image_url || '',
          services: parsedServices
        };

        console.log('Setting smartspoon data:', smartspoonData);
        setSmartspoonData(smartspoonData);
      }
    } catch (error) {
      console.error('Error fetching smartspoon data:', error);
    }
  };

  useEffect(() => {
    console.log('Current smartspoon data:', smartspoonData);
  }, [smartspoonData]);

  const services = smartspoonData?.services || defaultServices;
  const title = smartspoonData?.title || '';
  const description = smartspoonData?.description || '';
  const buttonText = smartspoonData?.button_text || '';
  const buttonLink = smartspoonData?.button_link || '/smart-spoon';
  const imageUrl = smartspoonData?.image_url || null;

  console.log('Rendered values:', { title, description, services });


  return (
    <section className="relative py-12 overflow-hidden bg-background">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20">
        <motion.div 
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full"
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
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/10 to-transparent rounded-full"
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
            className="text-3xl font-bold mb-6 text-primary"
          >
            {title}
          </h2>
          <p 
            className="text-gray-800 dark:text-gray-200 text-base mx-auto"
          >
            {description}
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

          {imageUrl && (
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={imageUrl}
                alt="Smart Spoon Technology"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <a href={buttonLink}>
                    <Button className="rounded-full">
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
                    </Button>
                  </a>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
