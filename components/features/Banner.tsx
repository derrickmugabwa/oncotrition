'use client';

import { motion as m, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { createClient } from '@/utils/supabase/client';

interface BannerContent {
  title: string;
  subtitle: string;
  heading: string;
  bullet_points: string[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export default function Banner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [content, setContent] = useState<BannerContent | null>(null);
  const supabase = createClient();
  
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });

  useEffect(() => {
    async function fetchContent() {
      const { data, error } = await supabase
        .from('features_banner')
        .select('*')
        .single();

      if (!error && data) {
        setContent(data);
      }
    }

    fetchContent();
  }, []);

  if (!content) {
    return null;
  }

  return (
    <m.section 
      ref={containerRef}
      className="relative py-16 overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background Elements */}
      <m.div 
        className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200"
        animate={{ opacity: isInView ? 1 : 0.5 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: theme === 'dark' 
            ? `radial-gradient(circle at 50% 50%, rgba(96,165,250,0.05) 0%, transparent 50%)`
            : `radial-gradient(circle at 50% 50%, rgba(59,130,246,0.05) 0%, transparent 50%)`,
          backgroundSize: '100% 100%'
        }}></div>
      </m.div>

      {/* Decorative Elements */}
      <div className="absolute inset-0">
        <m.div
          className="absolute right-0 top-0 w-96 h-96 bg-blue-100/20 dark:bg-blue-400/5 rounded-full blur-3xl transition-colors duration-200"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <m.div
          className="absolute left-0 bottom-0 w-96 h-96 bg-indigo-100/20 dark:bg-indigo-400/5 rounded-full blur-3xl transition-colors duration-200"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 mb-6 rounded-full border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 transition-colors duration-200"
            >
              <m.span 
                className="text-sm text-blue-600 dark:text-blue-400 font-medium inline-block transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {content.title}
              </m.span>
            </m.div>
            
            <m.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent transition-colors duration-200"
            >
              {content.heading}
            </m.h2>
          </div>

          <m.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {content.bullet_points.map((point, index) => (
              <m.div
                key={index}
                variants={item}
                className="relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <m.div 
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800 p-6 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {/* Hover Effect Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 to-indigo-100/0 group-hover:from-blue-100/50 group-hover:to-indigo-100/50 dark:group-hover:from-blue-900/20 dark:group-hover:to-indigo-900/20 transition-all duration-300"></div>
                  
                  <div className="relative flex items-start gap-4">
                    <m.div 
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 flex items-center justify-center shadow-lg transition-colors duration-200"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <m.svg 
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                      >
                        <m.path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.8 }}
                        />
                      </m.svg>
                    </m.div>
                    <m.p 
                      className="text-lg text-gray-700 dark:text-gray-300 pt-1 transition-colors duration-200"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      {point}
                    </m.p>
                  </div>

                  {/* Decorative corner gradient */}
                  <m.div 
                    className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-200/40 to-indigo-200/40 dark:from-blue-400/10 dark:to-indigo-400/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-colors duration-200"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.2, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </m.div>
              </m.div>
            ))}
          </m.div>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <m.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400/20 dark:bg-blue-400/10 rounded-full transition-colors duration-200"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </m.section>
  );
}
