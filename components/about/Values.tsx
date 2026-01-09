'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import FloatingImage from './FloatingImage';

interface VisionSection {
  title: string;
  description: string;
}

interface Vision {
  id: number;
  title: string;
  description: string;
  bullet_points: string[];
  sections?: VisionSection[];
}

interface ValuesImage {
  id: number;
  title: string;
  description: string;
  image_url: string;
  floating_image_url?: string;
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
  const [valuesImage, setValuesImage] = useState<ValuesImage | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch vision content
        const { data: visionData } = await supabase
          .from('values_vision')
          .select('*')
          .single();
  
        if (visionData) {
          setVision(visionData);
        }
      } catch (visionErr) {
        console.warn('Error fetching vision data:', visionErr);
      }

      try {
        // Fetch values image
        const { data: valuesImageData } = await supabase
          .from('values_image')
          .select('*')
          .single();
  
        if (valuesImageData) {
          setValuesImage(valuesImageData);
        }
      } catch (valuesErr) {
        console.warn('Error fetching values image data:', valuesErr);
        // Check if we have locally stored values image data
        const storedValuesImage = localStorage.getItem('values_image');
        if (storedValuesImage) {
          try {
            const parsedValuesImage = JSON.parse(storedValuesImage);
            setValuesImage(parsedValuesImage);
          } catch (e) {
            console.error('Error parsing stored values image:', e);
          }
        }
      }
    };

    fetchContent();
  }, []);

  if (!vision) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-gray-900">
      {/* Background removed for clean white look */}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Values Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 lg:p-10">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <h3 className="relative inline-block mb-6">
                  <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                    {valuesImage?.title || 'Our Values'}
                  </span>
                  <div className="absolute -bottom-1 left-0 w-1/3 h-1 bg-emerald-500 rounded-full"></div>
                </h3>
                
                {valuesImage?.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {renderTextWithLinks(valuesImage.description)}
                  </p>
                )}
                
                {valuesImage?.image_url && (
                  <motion.div 
                    className="relative w-full aspect-[16/12] rounded-xl shadow-lg mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <img 
                      src={valuesImage.image_url} 
                      alt="Our Values" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                    
                    {/* Floating image at bottom right - HIDDEN FOR NOW (uncomment to re-enable) */}
                    {/* {valuesImage.floating_image_url && (
                      <div className="absolute bottom-[-20px] right-[-80px] z-30">
                        <FloatingImage
                          position="relative"
                          imageUrl={valuesImage.floating_image_url}
                          altText="Healthy ingredients"
                          borderTrailColor="bg-emerald-500"
                        />
                      </div>
                    )} */}
                    

                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Vision Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
            <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 lg:p-10">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <h3 className="relative inline-block mb-8">
                  <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                    {vision.title}
                  </span>
                  <div className="absolute -bottom-1 left-0 w-1/3 h-1 bg-emerald-500 rounded-full"></div>
                </h3>
                
                {/* Vision Sections */}
                <div className="space-y-6">
                  {(vision.sections || []).map((section, idx: number) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      viewport={{ once: true }}
                      className="p-5 bg-white/70 dark:bg-gray-800/50 rounded-xl border border-gray-100/50 dark:border-gray-700/50 shadow-sm"
                    >
                      <h4 className="text-lg font-semibold mb-3 text-emerald-600 dark:text-emerald-400">
                        {section.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {renderTextWithLinks(section.description)}
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
