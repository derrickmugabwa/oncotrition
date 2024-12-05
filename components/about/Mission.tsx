'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

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
    <section className="relative py-32 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/90 dark:from-blue-950/30 dark:via-gray-900 dark:to-indigo-950/30"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)] animate-pulse"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(99,102,241,0.15),transparent_60%)] animate-pulse [animation-delay:2s]"></div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative"
      >
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Content Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="lg:w-1/2 space-y-10"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-block"
              >
                <h2 className="text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  {content.title}
                </h2>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-2xl font-medium text-gray-700 dark:text-gray-200"
              >
                {content.subtitle}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-lg leading-relaxed text-gray-600 dark:text-gray-300"
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
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl 
                         bg-gradient-to-br from-white/10 to-white/30 dark:from-white/5 dark:to-white/10 
                         backdrop-blur-sm border border-white/20 dark:border-white/10"
            >
              {content.image_url ? (
                <Image
                  src={content.image_url}
                  alt="Mission"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <span className="text-gray-400 dark:text-gray-500">Image loading...</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
