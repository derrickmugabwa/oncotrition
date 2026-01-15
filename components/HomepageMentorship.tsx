'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import type { Database } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MentorshipData {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string | null;
  button_text: string;
  button_link: string;
  features: string[] | any;
}

const defaultMentorshipData: MentorshipData = {
  title: "",
  subtitle: "",
  description: "",
  image_url: "",
  button_text: "",
  button_link: "",
  features: []
};

export default function HomepageMentorship() {
  const [mentorshipData, setMentorshipData] = useState<MentorshipData>(defaultMentorshipData);
  const [error, setError] = useState<string | null>(null);

  // Simple animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  useEffect(() => {
    const fetchMentorshipData = async () => {
      try {
        setError(null);
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from('homepage_mentorship')
          .select('*')
          .single();

        if (error) {
          console.error('Error fetching mentorship data:', error);
          setError(error.message);
          return;
        }

        if (data) {
          const features = Array.isArray(data.features) ? data.features : defaultMentorshipData.features;
          
          const newData = {
            id: data.id,
            title: data.title || '',
            subtitle: data.subtitle || '',
            description: data.description || '',
            image_url: data.image_url || '',
            button_text: data.button_text || '',
            button_link: data.button_link || '',
            features: features
          };

          setMentorshipData(newData);
        }
      } catch (error) {
        console.error('Error in fetchMentorshipData:', error);
        setError('An unexpected error occurred');
      }
    };

    fetchMentorshipData();
  }, []);

  return (
    <motion.section 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative overflow-hidden bg-background py-16 pb-12"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          {mentorshipData.image_url && (
            <motion.div
              className="relative h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-muted"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="absolute inset-0">
                <Image
                  src={mentorshipData.image_url}
                  alt="Nutrition Mentorship"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  onError={(e) => {
                    console.error('Image failed to load:', mentorshipData.image_url);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
              </div>
            </motion.div>
          )}

          {/* Content Section */}
          <div className="relative h-[400px] lg:h-[600px] flex flex-col">
            <Badge className="mb-6 text-sm px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all duration-300">
              {mentorshipData.subtitle}
            </Badge>

            <motion.h2
              className="text-xl lg:text-2xl font-bold mb-6 text-primary"
            >
              {mentorshipData.title}
            </motion.h2>

            <motion.p
              className="text-muted-foreground text-base mb-8 leading-relaxed"
            >
              {mentorshipData.description}
            </motion.p>

            <div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={mentorshipData.button_link}>
                  <Button size="lg" className="group px-8 py-6 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40 transition-all duration-300 text-base">
                    {mentorshipData.button_text}
                    <svg 
                      className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Feature Pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              {mentorshipData.features.map((feature: string) => (
                <motion.div key={feature} whileHover={{ scale: 1.05 }}>
                  <Badge className="px-6 py-2 text-sm rounded-full bg-white dark:bg-gray-800 text-teal-700 dark:text-teal-300 border-2 border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:border-teal-500 dark:hover:border-teal-500 shadow-sm hover:shadow-md transition-all duration-300 font-medium">
                    {feature}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
