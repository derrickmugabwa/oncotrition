'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiUser, FiUsers, FiClipboard, FiBarChart2, FiHeart, FiActivity, FiCreditCard, FiCalendar, FiMessageCircle, FiTarget, FiAward, FiShoppingBag, FiBookOpen, FiCoffee, FiGift, FiPieChart, FiThumbsUp, FiTrendingUp } from 'react-icons/fi';
import { GiWeightScale, GiMeal, GiFruitBowl, GiCook, GiMedicines, GiSportMedal } from 'react-icons/gi';
import { MdOutlineFoodBank, MdOutlineLocalGroceryStore, MdOutlineHealthAndSafety } from 'react-icons/md';
import { createClient } from '@/utils/supabase/client';

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

interface StepsSettings {
  background_image?: string;
  title?: string;
  subtitle?: string;
  description?: string;
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

// New scroll animation variants
const scrollFadeIn = {
  hidden: { opacity: 0, y: 100 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.1, 0.25, 0.3, 1],
    },
  }),
};

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "mirror" as const,
      ease: "easeInOut",
    },
  },
};

const connectingLineAnimation = {
  hidden: { width: 0, opacity: 0 },
  visible: {
    width: '100%',
    opacity: 1,
    transition: {
      delay: 0.5,
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

export default function Steps() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [settings, setSettings] = useState<StepsSettings>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  
  // Ref for in-view animations
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

  useEffect(() => {
    fetchSteps();
    fetchSettings();

    // Add CSS variable for primary color RGB values
    const style = document.documentElement.style;
    style.setProperty('--primary-rgb', '79, 70, 229'); // Indigo-600 RGB values
  }, []);
  
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('smartspoon_steps_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is the error code for no rows returned
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching steps settings:', error);
    }
  };

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
    <section 
      ref={sectionRef}
      className={`py-16 md:py-24 overflow-hidden relative ${!settings.background_image ? 'bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800' : ''}`}
      style={{
        backgroundImage: settings.background_image ? `url(${settings.background_image})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better text readability when background image is present */}
      {settings.background_image && (
        <div className="absolute inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-[2px] z-0"></div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-20"
        >
          <motion.p
            variants={fadeInUp}
            className={`text-sm font-semibold tracking-wide uppercase mb-3 ${
              settings.background_image 
                ? 'text-primary-300 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]' 
                : 'text-primary'
            }`}
          >
            {settings.subtitle || 'FAST SOLUTION'}
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className={`text-4xl md:text-5xl font-bold ${
              settings.background_image
                ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                : 'bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300'
            }`}
          >
            {settings.title || 'Step by step to get started'}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className={`mt-4 text-lg max-w-2xl mx-auto ${
              settings.background_image
                ? 'text-gray-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            {settings.description || "Get started with our easy-to-follow process. We've simplified nutrition management into four straightforward steps to help you achieve your health goals."}
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 relative"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT/0.05),transparent_70%)] pointer-events-none" />
          
          {/* Scroll Progress Path */}
          <div className="absolute hidden lg:block top-1/2 left-0 right-0 h-px bg-primary/10 transform -translate-y-1/2 z-0" />
          
          {steps.map((step, index) => {
            const IconComponent = iconMap[step.icon as keyof typeof iconMap];
            
            return (
              <motion.div
                key={step.id}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px 0px" }}
                variants={scrollFadeIn}
                whileHover="hover"
                className="relative group"
              >
                <motion.div
                  variants={cardHover}
                  initial="rest"
                  whileHover="hover"
                  className="h-full p-8 bg-white dark:bg-gray-800/80 rounded-2xl shadow-xl dark:shadow-gray-900/30 backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 relative z-10 transition-all duration-500"
                >
                  <motion.div 
                    className="relative flex flex-col items-center"
                  >
                    {/* Step Number */}
                    <div className="absolute -top-4 left-0 rounded-full px-3 py-1 bg-primary/10 transition-colors duration-500">
                      <span className="text-sm font-semibold text-primary">
                        Step {index + 1}
                      </span>
                    </div>

                    {/* Icon */}
                    <motion.div
                      variants={iconHover}
                      className="relative mb-5 w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center transition-all duration-500 shadow-lg shadow-primary/5 overflow-hidden"
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
                              opacity: 0.7
                            }
                          })}
                        </div>
                      )}
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-center mb-2 text-gray-900 dark:text-white transition-colors duration-500">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-center text-xs leading-relaxed">
                      {step.description}
                    </p>

                    {/* Decorative Elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Connecting Lines (only for non-last items) */}
                    {index < steps.length - 1 && (
                      <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={connectingLineAnimation}
                        className="hidden lg:block absolute top-1/2 -right-8 w-16 h-px bg-gradient-to-r from-primary to-transparent transform -translate-y-1/2 z-10"
                      />
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
