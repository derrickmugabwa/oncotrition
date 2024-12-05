'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiUsers, FiClipboard, FiBarChart2 } from 'react-icons/fi';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const iconMap = {
  FiUser,
  FiUsers,
  FiClipboard,
  FiBarChart2,
};

interface Step {
  id: number;
  icon: string;
  title: string;
  description: string;
  order_number: number;
}

const fadeInUp = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.2 } },
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.05, 
    y: -5,
    transition: { duration: 0.3, ease: "easeOut" }
  },
};

const iconHover = {
  rest: { rotate: 0, scale: 1 },
  hover: { 
    rotate: 10,
    scale: 1.1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
};

export default function Steps() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    try {
      const { data, error } = await supabase
        .from('smartspoon_steps')
        .select('*')
        .order('order_number');

      if (error) throw error;
      if (data) setSteps(data);
    } catch (error) {
      console.error('Error fetching steps:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p
            variants={fadeInUp}
            className="text-sm font-semibold tracking-wide text-primary uppercase mb-3"
          >
            FAST SOLUTION
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300"
          >
            Step by step to get started
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Get started with our easy-to-follow process. We've simplified nutrition management
            into four straightforward steps to help you achieve your health goals.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step, index) => {
            const IconComponent = iconMap[step.icon as keyof typeof iconMap];
            
            return (
              <motion.div
                key={step.id}
                variants={fadeInUp}
                initial="rest"
                whileHover="hover"
                className="relative group"
              >
                <motion.div
                  variants={cardHover}
                  className="h-full p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/30 backdrop-blur-sm border border-gray-100 dark:border-gray-700"
                >
                  <div className="relative flex flex-col items-center">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-0 bg-primary/10 rounded-full px-3 py-1">
                      <span className="text-sm font-semibold text-primary">
                        Step {index + 1}
                      </span>
                    </div>

                    {/* Icon */}
                    <motion.div
                      variants={iconHover}
                      className="mb-6 w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-colors duration-300"
                    >
                      {IconComponent && (
                        <div className="w-8 h-8 text-primary">
                          {React.createElement(IconComponent)}
                        </div>
                      )}
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3 group-hover:text-primary transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-center text-sm leading-relaxed">
                      {step.description}
                    </p>

                    {/* Decorative Elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
