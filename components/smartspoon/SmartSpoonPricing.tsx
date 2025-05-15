'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

interface Package {
  id: number;
  name: string;
  price: number;
  features: string[];
  recommended: boolean;
  gradient: string;
  order_number: number;
  duration_type: 'day' | 'week' | 'month' | 'year';
  show_price: boolean;
}

interface PackagesSettings {
  id?: number;
  title?: string;
  subtitle?: string;
  description?: string;
}

export default function SmartSpoonPricing() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [settings, setSettings] = useState<PackagesSettings>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPackages();
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('smartspoon_packages_settings')
        .select('*')
        .order('id', { ascending: false })
        .limit(1);

      console.log('Fetch settings response:', { data, error });
      
      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log('Settings loaded:', data[0]);
        setSettings(data[0]);
      } else {
        console.log('No settings found');
      }
    } catch (error) {
      console.error('Error fetching packages settings:', error);
    }
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('smartspoon_packages')
        .select('*')
        .order('order_number');

      if (error) {
        console.error('Error fetching packages:', error);
        return;
      }

      if (data) {
        setPackages(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1),transparent_70%)]"></div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-4"
          >
            {settings.title || 'Choose the Right Plan for Your Practice'}
          </motion.h2>
          {settings.description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-gray-600 dark:text-gray-300"
            >
              {settings.description}
            </motion.p>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {packages.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={`h-full backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl overflow-hidden
                  ${plan.recommended ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                  shadow-lg hover:shadow-2xl transition-all duration-300`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-50`}></div>
                
                {/* Popular badge */}
                {plan.recommended && (
                  <div className="absolute top-0 right-0 mt-4 mr-4">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium px-3 py-1 rounded-full shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="relative p-6 lg:p-5 xl:p-6">
                  {/* Plan name */}
                  <h3 className="text-xl lg:text-lg xl:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                    {plan.name}
                  </h3>
                  {/* Price */}
                  {plan.show_price && (
                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        KES {plan.price.toLocaleString()}
                      </span>
                      <span className="text-xs lg:text-xs xl:text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-400">
                        /{plan.duration_type}
                      </span>
                    </div>
                  )}
                  
                  {/* Features list */}
                  <ul className="space-y-3 my-4 min-h-[180px] lg:min-h-[200px]">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + featureIndex * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start text-sm lg:text-xs xl:text-sm text-gray-700 dark:text-gray-300"
                      >
                        <svg className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative mt-auto"
                  >
                    <Link
                      href="https://smartspoonplus.com/professionals/account/login"
                      className={`block w-full py-2 lg:py-2 xl:py-2.5 px-4 text-center text-sm lg:text-xs xl:text-sm rounded-xl font-medium transition-all duration-300
                        ${plan.recommended
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
                          : 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-white hover:shadow-lg dark:hover:shadow-gray-900/25'
                        }`}
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
