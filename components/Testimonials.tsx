'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  rating: number;
  image: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Fitness Enthusiast",
    quote: "SmartSpoon+ completely transformed my approach to healthy eating. The personalized meal plans and tracking features made it so easy to stay on track.",
    rating: 5,
    image: "/testimonials/sarah.jpg"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Marathon Runner",
    quote: "As an athlete, proper nutrition is crucial. This platform helped me optimize my diet for peak performance. The results have been incredible!",
    rating: 5,
    image: "/testimonials/michael.jpg"
  },
  {
    id: 3,
    name: "Emma Davis",
    role: "Wellness Coach",
    quote: "I recommend SmartSpoon+ to all my clients. It's comprehensive, user-friendly, and delivers real results. The best nutrition platform I've used.",
    rating: 5,
    image: "/testimonials/emma.jpg"
  }
];

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        transition: { type: "spring", stiffness: 400, damping: 17 }
      }}
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg transition-all duration-300 cursor-pointer flex flex-col min-h-[400px]"
    >
      <div className="mb-6">
        <motion.div 
          className="flex space-x-1"
          whileHover={{ scale: 1.1, transition: { type: "spring", stiffness: 400 } }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.svg
              key={i}
              className={`w-6 h-6 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 + i * 0.1 }}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </motion.svg>
          ))}
        </motion.div>
      </div>

      <motion.p
        className="text-gray-600 dark:text-gray-300 mb-8 flex-grow text-lg italic leading-relaxed"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
      >
        "{testimonial.quote}"
      </motion.p>

      <div className="flex items-center mt-auto pt-6 border-t border-gray-100 dark:border-gray-700">
        <div className="relative w-14 h-14 mr-4">
          <motion.div
            whileHover={{ scale: 1.15, rotate: 10 }}
            className="w-full h-full rounded-full overflow-hidden ring-2 ring-primary/20"
          >
            <Image
              src={testimonial.image}
              alt={testimonial.name}
              fill
              className="rounded-full object-cover"
            />
          </motion.div>
        </div>
        <div>
          <motion.h4
            whileHover={{ scale: 1.05 }}
            className="font-semibold text-gray-800 dark:text-white text-lg"
          >
            {testimonial.name}
          </motion.h4>
          <motion.p
            whileHover={{ scale: 1.05 }}
            className="text-primary dark:text-primary/80"
          >
            {testimonial.role}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

const Testimonials: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setTestimonials(data);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, [supabase]);

  return (
    <section className="relative py-20 bg-gradient-to-b from-blue-100 via-indigo-200/80 to-violet-200 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-violet-900/30">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-200/30 via-white/40 to-violet-200/30 dark:from-blue-500/10 dark:via-gray-900/40 dark:to-violet-500/10 pointer-events-none"></div>
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-70">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-full animate-drift"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-secondary/20 to-transparent rounded-full animate-drift-reverse"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              What Our Users Say
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of satisfied users who have transformed their lives with SmartSpoon+
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
