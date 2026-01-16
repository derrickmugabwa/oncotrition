'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatsCard from './StatsCard';
import ConversationCard from './ConversationCard';
import MealPlanCard from './MealPlanCard';

interface MissionContent {
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
}

export default function Mission() {
  const [content, setContent] = useState<MissionContent | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('mission_content')
          .select('*')
          .single();

        if (error) {
          console.warn('Error fetching mission content:', error);
        } else if (data) {
          setContent(data);
        }
      } catch (err) {
        console.warn('Error fetching mission content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <section className="relative pt-0 pb-2 -mt-16 overflow-hidden bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative pt-32 sm:pt-32 md:pt-20 lg:pt-16">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-12">
            <div className="w-full lg:w-[45%] space-y-6 lg:space-y-8 order-2 lg:order-1">
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              <div className="h-6 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              <div className="h-24 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            </div>
            <div className="w-full lg:w-[55%] order-1 lg:order-2">
              <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <section className="relative pt-0 pb-2 -mt-16 overflow-hidden bg-white dark:bg-gray-900">
      {/* Background removed for clean white look */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative pt-32 sm:pt-32 md:pt-20 lg:pt-16">
        {/* Increased padding significantly since floating cards removed - more breathing room */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-12">
          {/* Content Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="w-full lg:w-[45%] space-y-6 lg:space-y-8 relative order-2 lg:order-1"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-6 text-sm px-4 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0 shadow-md font-outfit">
                About Us
              </Badge>
              <h2 className="text-3xl font-bold text-primary mb-6 font-outfit">
                {content.title}
              </h2>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <p className="text-base font-semibold text-teal-600 dark:text-teal-400 mb-6 font-outfit">
                {content.subtitle}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <p className="text-base leading-relaxed text-muted-foreground font-outfit">
                {content.description}
              </p>
            </motion.div>
          </motion.div>

          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 50 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="w-full lg:w-[55%] order-1 lg:order-2"
          >
            <div className="relative">
              {/* Meal Plan Card - HIDDEN FOR NOW (uncomment to re-enable) */}
              {/* <div className="hidden md:block">
                <MealPlanCard
                  position="absolute top-36 -left-32 lg:-left-32 xl:-left-32"
                  title="Daily Meal Plan"
                  subtitle="Weight Management"
                  borderTrailColor="bg-emerald-500"
                  meals={[
                    { time: '8:00', name: 'Protein Smoothie', calories: '320' },
                    { time: '11:00', name: 'Quinoa Salad', calories: '280' },
                    { time: '14:00', name: 'Salmon & Greens', calories: '450' },
                    { time: '17:00', name: 'Nut Mix & Fruit', calories: '210' }
                  ]}
                />
              </div> */}
              
              {/* Conversation Card - HIDDEN FOR NOW (uncomment to re-enable) */}
              {/* <div className="hidden md:block absolute bottom-4 -left-64 lg:-left-64 xl:-left-64 z-30 w-full max-w-sm">
                <ConversationCard
                  position="relative"
                  className="shadow-xl"
                  messages={[
                    { 
                      sender: 'mentor', 
                      text: "How's client progress this week?" 
                    },
                    { 
                      sender: 'mentee', 
                      text: "Improving! Struggling with meal plans." 
                    }
                  ]}
                />
              </div> */}
              
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-border bg-gray-100">
                {content.image_url ? (
                  <Image
                    src={content.image_url}
                    alt="Mission"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <span className="text-muted-foreground">Image loading...</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
