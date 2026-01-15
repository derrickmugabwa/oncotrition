'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface SlideContent {
  id: number;
  title: string;
  subtitle: string;
  tagline: string;
  background_image: string;
  cta_text?: string;
  cta_url?: string;
  order?: number;
}

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const slideVariants = {
  enter: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: {
      duration: 0.3,
    },
  },
};

const childVariants = {
  enter: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const defaultSlides: any[] = [];

export default function Hero() {
  const supabase = createClient();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<SlideContent[]>(defaultSlides);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data, error } = await supabase
          .from('smartspoon_slides')
          .select('*')
          .order('order');

        if (error) throw error;

        if (data && data.length > 0) {
          setSlides(data as any);
        }
      } catch (error: any) {
        console.error('Error fetching smartspoon slides:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();

    // Set up real-time subscription
    const channel = supabase
      .channel('smartspoon_slides_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'smartspoon_slides'
        },
        () => {
          fetchSlides();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (isLoading) {
    return (
      <div className="relative w-full h-[700px] bg-gray-100 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[700px] overflow-hidden bg-gray-900">
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image with Gradient Overlay */}
          <div className="relative w-full h-full">
            <div className="absolute inset-0 w-full h-full">
              <div className="relative w-full h-full">
                <Image
                  src={slide.background_image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            </div>
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Content Container */}
          <div className="absolute inset-0 container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              {index === currentSlide && (
                <motion.div
                  key={`content-${slide.id}`}
                  className="h-full flex flex-col justify-center items-center text-center mx-auto max-w-2xl"
                  variants={slideVariants}
                  initial="enter"
                  animate="visible"
                  exit="exit"
                >


                  <motion.h2
                    variants={childVariants}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight relative z-10"
                  >
                    {slide.title}
                  </motion.h2>

                  <motion.p
                    variants={childVariants}
                    className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed relative z-10"
                  >
                    {slide.subtitle}
                  </motion.p>

                  {slide.cta_text && slide.cta_url && (
                    <motion.div variants={childVariants} className="relative z-10">
                      <button 
                        onClick={() => router.push(slide.cta_url || '/')}
                        className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium inline-flex items-center group"
                      >
                        {slide.cta_text}
                        <svg
                          className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </button>
                    </motion.div>
                  )}

                  {/* Decorative Line */}
                  <motion.div
                    variants={childVariants}
                    className="w-24 h-1 mt-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mx-auto"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ))}

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm z-20"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm z-20"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-12 h-1 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white w-16'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}


    </div>
  );
}
