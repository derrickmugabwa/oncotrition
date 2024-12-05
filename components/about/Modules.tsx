'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Module {
  id: number;
  title: string;
  icon_svg: string;
  features: string[];
  display_order: number;
}

export default function Modules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchModules() {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('display_order');
      
      if (error) {
        console.error('Error fetching modules:', error);
        return;
      }

      setModules(data || []);
      setLoading(false);
    }

    fetchModules();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-950 dark:to-gray-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Our Modules
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
            Comprehensive solutions designed to transform your nutrition journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transform transition-all duration-300 group-hover:shadow-xl"></div>
              <motion.div 
                className="relative p-8 h-full"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="mb-6">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
                    whileHover={{ rotate: index === 1 ? -5 : 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: module.icon_svg }} />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{module.title}</h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  {module.features.map((feature, featureIndex) => (
                    <motion.li 
                      key={featureIndex}
                      className="flex items-center space-x-2"
                    >
                      <span>•</span>
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
