'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import { Inter } from 'next/font/google';

const ranade = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

interface MentorshipData {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  button_text: string;
  button_link: string;
  features: string[];
}

const defaultMentorshipData: MentorshipData = {
  title: "Transform Your Practice with Expert Guidance",
  subtitle: "Premium Mentorship Program",
  description: "Join our exclusive mentorship program and gain access to personalized guidance, advanced nutrition strategies, and a supportive community of healthcare professionals. Elevate your practice and make a greater impact on your clients' lives.",
  image_url: "/mentorship-banner.jpg",
  button_text: "Learn More",
  button_link: "/mentorship",
  features: ['1:1 Coaching', 'Weekly Workshops', 'Resource Library', 'Community Access']
};

export default function HomepageMentorship() {
  const [mentorshipData, setMentorshipData] = useState<MentorshipData>(defaultMentorshipData);
  const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(true);
        setError(null);
        const supabase = createClientComponentClient<Database>();
        
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
            title: data.title || defaultMentorshipData.title,
            subtitle: data.subtitle || defaultMentorshipData.subtitle,
            description: data.description || defaultMentorshipData.description,
            image_url: data.image_url || defaultMentorshipData.image_url,
            button_text: data.button_text || defaultMentorshipData.button_text,
            button_link: data.button_link || defaultMentorshipData.button_link,
            features: features
          };

          setMentorshipData(newData);
        }
      } catch (error) {
        console.error('Error in fetchMentorshipData:', error);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentorshipData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <motion.div 
          className="h-12 w-12 rounded-full border-t-2 border-b-2 border-emerald-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <motion.section 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/10 py-24 ${ranade.className}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <motion.div
            className="relative h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-emerald-50"
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
                  e.currentTarget.src = '/mentorship-banner.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 to-transparent" />
            </div>
          </motion.div>

          {/* Content Section */}
          <div className="relative">
            <motion.span
              className="inline-block px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-lg font-medium mb-6"
            >
              {mentorshipData.subtitle}
            </motion.span>

            <motion.h2
              className="text-xl lg:text-2xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent"
            >
              {mentorshipData.title}
            </motion.h2>

            <motion.p
              className="text-gray-600 dark:text-gray-300 text-xs mb-8 leading-relaxed"
            >
              {mentorshipData.description}
            </motion.p>

            <div>
              <motion.div
                className="inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={mentorshipData.button_link}
                  className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  <span className="flex items-center">
                    {mentorshipData.button_text}
                    <svg 
                      className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              </motion.div>
            </div>

            {/* Feature Pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              {mentorshipData.features.map((feature) => (
                <motion.span
                  key={feature}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 text-emerald-800 dark:text-emerald-200 text-xs font-medium shadow-sm backdrop-blur-sm"
                >
                  {feature}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
