'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiUsers, FiClipboard, FiBarChart2, FiHeart, FiActivity, FiCreditCard, FiCalendar, FiMessageCircle, FiTarget, FiAward, FiShoppingBag, FiBookOpen, FiCoffee, FiGift, FiPieChart, FiThumbsUp, FiTrendingUp } from 'react-icons/fi';
import { GiWeightScale, GiMeal, GiFruitBowl, GiCook, GiMedicines, GiSportMedal } from 'react-icons/gi';
import { MdOutlineFoodBank, MdOutlineLocalGroceryStore, MdOutlineHealthAndSafety } from 'react-icons/md';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const iconMap = {
  // User & Profile Icons
  FiUser,
  FiUsers,
  
  // Health & Wellness Icons
  FiHeart,
  FiActivity,
  GiWeightScale,
  MdOutlineHealthAndSafety,
  GiMedicines,
  
  // Nutrition & Food Icons
  GiMeal,
  GiFruitBowl,
  GiCook,
  MdOutlineFoodBank,
  MdOutlineLocalGroceryStore,
  FiCoffee,
  
  // Progress & Goals Icons
  FiBarChart2,
  FiTarget,
  FiPieChart,
  FiTrendingUp,
  GiSportMedal,
  FiAward,
  
  // Planning & Management Icons
  FiClipboard,
  FiCalendar,
  FiBookOpen,
  FiShoppingBag,
  
  // Communication & Rewards
  FiMessageCircle,
  FiThumbsUp,
  FiGift,
  
  // Payment Icons
  FiCreditCard,
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
  rest: { 
    scale: 1, 
    y: 0,
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
  },
  hover: { 
    scale: 1.02, 
    y: -5,
    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    transition: { 
      duration: 0.3, 
      ease: "easeOut" 
    }
  },
};

const iconHover = {
  rest: { 
    rotate: 0, 
    scale: 1,
    y: 0
  },
  hover: { 
    rotate: [0, -10, 10, -5, 5, 0],
    scale: 1.1,
    y: -5,
    transition: { 
      duration: 0.6,
      ease: "easeOut",
      rotate: {
        duration: 0.8,
        ease: "easeInOut",
        times: [0, 0.2, 0.4, 0.6, 0.8, 1]
      }
    }
  },
};

export default function Steps() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSteps();

    // Add CSS variable for primary color RGB values
    const style = document.documentElement.style;
    style.setProperty('--primary-rgb', '79, 70, 229'); // Indigo-600 RGB values
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
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-20"
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
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 relative"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT/0.05),transparent_70%)] pointer-events-none" />
          
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
                  className="h-full p-8 bg-white dark:bg-gray-800/80 rounded-2xl shadow-xl dark:shadow-gray-900/30 backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 relative z-10"
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
                      className="relative mb-5 w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 shadow-lg shadow-primary/5 group-hover:shadow-primary/10 overflow-hidden"
                    >
                      {/* Background glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50" />
                      
                      {IconComponent && (
                        <div className="relative w-10 h-10 text-primary transform group-hover:scale-110 transition-transform duration-300" style={{
                          filter: 'drop-shadow(0 0 8px rgba(var(--primary-rgb), 0.3))',
                        }}>
                          {React.createElement(IconComponent, {
                            size: 40,
                            style: { 
                              strokeWidth: IconComponent.toString().includes('Fi') ? 1.5 : undefined,
                              width: '100%',
                              height: '100%',
                              color: 'rgb(var(--primary-rgb))',
                              opacity: 0.9
                            }
                          })}
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
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

                    {/* Connecting Lines (only for non-last items) */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-12 w-24 h-px bg-gradient-to-r from-primary/30 to-transparent transform -translate-y-1/2" />
                    )}
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
