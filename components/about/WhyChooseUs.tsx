'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon_path: string;
  display_order: number;
}

interface SectionContent {
  heading: string;
  description: string;
  background_image?: string;
}

export default function WhyChooseUs() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [sectionContent, setSectionContent] = useState<SectionContent>({
    heading: 'Why Choose Us',
    description: 'Experience excellence in nutrition management with our comprehensive platform',
    background_image: ''
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // Function to go to the next slide
  const nextSlide = useCallback(() => {
    if (features.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length);
  }, [features.length]);

  // Function to go to the previous slide
  const prevSlide = useCallback(() => {
    if (features.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + features.length) % features.length);
  }, [features.length]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && features.length > 1) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 5000); // Change slide every 5 seconds
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, features.length, nextSlide]);

  // Pause auto-play on hover
  const pauseAutoPlay = () => setIsAutoPlaying(false);
  const resumeAutoPlay = () => setIsAutoPlaying(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch features
        const { data: featuresData, error: featuresError } = await supabase
          .from('why_choose_us_features')
          .select('*')
          .order('display_order');
        
        if (featuresError) throw featuresError;
        if (featuresData) {
          setFeatures(featuresData);
        }

        // Fetch section content
        const { data: sectionData, error: sectionError } = await supabase
          .from('page_sections')
          .select('*')
          .eq('section_id', 'why_choose_us')
          .single();

        if (sectionError) {
          console.error('Error fetching section content:', sectionError);
        } else if (sectionData) {
          setSectionContent({
            heading: sectionData.heading,
            description: sectionData.description,
            background_image: sectionData.background_image || ''
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  const renderIcon = (path: string) => (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );

  return (
    <section 
      className="relative overflow-hidden bg-cover bg-center bg-no-repeat py-32 md:py-40"
      style={{
        backgroundImage: sectionContent.background_image 
          ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${sectionContent.background_image})` 
          : 'linear-gradient(to right, #1e3a8a, #3b82f6)'
      }}
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-4 text-white font-outfit"
          >
            {sectionContent.heading}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-gray-200 font-outfit"
          >
            {sectionContent.description}
          </motion.p>
        </div>

        {/* Slider Container */}
        <div className="max-w-4xl mx-auto relative">
          {/* Feature Slides */}
          <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm p-1">
            <div className="h-[340px] md:h-[300px] relative overflow-hidden rounded-lg">
              <AnimatePresence mode="wait">
                {features.length > 0 && (
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 p-8 flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                      {renderIcon(features[currentIndex].icon_path)}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white font-outfit">
                      {features[currentIndex].title}
                    </h3>
                    <p className="text-gray-200 max-w-2xl font-outfit">
                      {features[currentIndex].description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation Controls */}
          {features.length > 1 && (
            <div className="flex justify-center items-center mt-8 gap-8">
              <button 
                onClick={prevSlide}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors duration-200"
                aria-label="Previous slide"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              
              {/* Dots Indicator */}
              <div className="flex space-x-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              
              <button 
                onClick={nextSlide}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors duration-200"
                aria-label="Next slide"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
