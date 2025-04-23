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
  duration_type: string;
}

export default function MentorshipCards() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mentorship_packages')
        .select('*')
        .order('price');

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
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
                
                <div className="relative p-8">
                  {/* Plan name */}
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {plan.name}
                  </h3>
                  
                  {/* Price and duration */}
                  <div className="mt-8 flex items-baseline justify-center gap-x-2">
                    <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                      KES {plan.price.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-400">
                      /{plan.duration_type}
                    </span>
                  </div>
                  
                  {/* Features list */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + featureIndex * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center text-gray-700 dark:text-gray-300"
                      >
                        <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="relative"
                  >
                    <Link
                      href="https://www.nutripreneurship.com/auth/signup"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('events-section')?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }}
                      className={`inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl transition duration-300 ease-in-out ${
                        plan.recommended
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-700 hover:to-indigo-700'
                          : 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-white hover:shadow-lg dark:hover:shadow-gray-900/25'
                        }`}
                    >
                      Register
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
