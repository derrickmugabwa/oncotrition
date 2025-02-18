'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Vision {
  id: number;
  title: string;
  description: string;
  bullet_points: string[];
}

interface Value {
  id: number;
  title: string;
  description: string;
  display_order: number;
}

// Helper function to render text with hyperlinks
const renderTextWithLinks = (text: string) => {
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Add the link
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
      >
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
};

export default function Values() {
  const [vision, setVision] = useState<Vision | null>(null);
  const [values, setValues] = useState<Value[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchContent = async () => {
      // Fetch vision content
      const { data: visionData } = await supabase
        .from('values_vision')
        .select('*')
        .single();

      if (visionData) {
        setVision(visionData);
      }

      // Fetch values list
      const { data: valuesData } = await supabase
        .from('values_list')
        .select('*')
        .order('display_order');

      if (valuesData) {
        setValues(valuesData);
      }
    };

    fetchContent();
  }, []);

  if (!vision) return null;

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-blue-50/30 dark:from-gray-950 dark:to-blue-950/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Vision Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
            <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 lg:p-10">
              <motion.div
                initial={{ scale: 0.95 }}
                whileHover={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <h3 className="text-3xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {vision.title}
                  </span>
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {renderTextWithLinks(vision.description)}
                </p>
                <ul className="space-y-4">
                  {vision.bullet_points.map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-3 text-gray-600 dark:text-gray-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>{renderTextWithLinks(item)}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 lg:p-10">
              <motion.div
                initial={{ scale: 0.95 }}
                whileHover={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <h3 className="text-3xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Our Values
                  </span>
                </h3>
                <div className="space-y-6">
                  {values.map((value, index) => (
                    <motion.div
                      key={value.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="group"
                    >
                      <motion.h4 
                        className="text-lg font-semibold mb-2 text-gray-800 dark:text-white"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        {value.title}
                      </motion.h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed pl-4 border-l-2 border-indigo-500/30 group-hover:border-indigo-500 transition-colors duration-300">
                        {value.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
