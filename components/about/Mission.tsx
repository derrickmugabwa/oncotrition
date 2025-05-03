'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import StatsCard from './StatsCard';
import ConversationCard from './ConversationCard';
import MealPlanCard from './MealPlanCard';

interface MissionContent {
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
}

export default function Mission() {
  const [content, setContent] = useState<MissionContent>({
    title: 'Our Mission',
    subtitle: 'Empowering Health Through Nutrition',
    description: 'We are dedicated to providing personalized nutrition guidance for cancer patients, combining scientific expertise with compassionate care.',
    image_url: ''
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('mission_content')
        .select('*')
        .single();

      if (!error && data) {
        setContent(data);
      }
    };

    fetchContent();
  }, []);

  return (
    <section className="relative pt-0 pb-4 -mt-16 overflow-hidden bg-white dark:bg-gray-900">
      {/* Background removed for clean white look */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative pt-28 sm:pt-28 md:pt-16 lg:pt-0">
        {/* Adjusted padding: increased for mobile/small screens, reduced for desktop */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Content Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="lg:w-1/2 space-y-10 relative z-10"
          >
            <div className="space-y-6 relative">
              <div className="absolute -left-6 -top-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl"></div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-block"
              >
                <h2 className="relative inline-block">
                  <span className="text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500">
                    {content.title}
                  </span>
                  <div className="absolute -bottom-2 left-0 w-1/3 h-1.5 bg-emerald-500 rounded-full"></div>
                </h2>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-2xl font-medium text-emerald-700 dark:text-emerald-300 drop-shadow-sm"
              >
                {content.subtitle}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 tracking-wide mb-8"
              >
                {content.description}
              </motion.p>
              
            </div>
          </motion.div>

          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 50 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="relative">
              {/* Meal Plan Card */}
              <div className="hidden md:block">
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
              </div>
              
              {/* Conversation Card */}
              {/* Conversation Card - Hidden on mobile, visible on medium screens and up */}
              <div className="hidden md:block absolute bottom-4 -left-64 lg:-left-64 xl:-left-64 z-30 w-full max-w-sm">
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
              </div>
              
              {/* Mobile version of cards - only visible on small screens */}
              <div className="md:hidden mt-8 space-y-6">
                <MealPlanCard
                  position="relative"
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
              </div>
              
              <motion.div 
                className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl 
                           bg-gradient-to-br from-white/10 to-white/30 dark:from-white/5 dark:to-white/10 
                           backdrop-blur-sm border border-white/20 dark:border-white/10
                           before:absolute before:inset-0 before:z-10 before:border-4 before:border-emerald-200/20 before:rounded-3xl
                           after:absolute after:inset-0 after:z-0 after:bg-gradient-to-tr after:from-emerald-500/10 after:to-transparent"
              >
              {content.image_url ? (
                <Image
                  src={content.image_url}
                  alt="Mission"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <span className="text-gray-400 dark:text-gray-500">Image loading...</span>
                </div>
              )}
            </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
