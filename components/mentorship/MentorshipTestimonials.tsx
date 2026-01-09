'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface TestimonialsContent {
  id: string;
  title: string;
  description: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  image: string;
  order_index: number;
}

export default function MentorshipTestimonials() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<TestimonialsContent | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const supabase = createClient();
  const marqueeRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch section content
        const { data: contentData, error: contentError } = await supabase
          .from('mentorship_testimonials_content')
          .select('*')
          .single();

        if (contentError) throw contentError;
        setContent(contentData);

        // Fetch all testimonials
        const { data, error } = await supabase
          .from('mentorship_testimonials')
          .select('*')
          .order('order_index');

        if (error) throw error;
        setTestimonials(data || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);



  if (loading) {
    return (
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          {/* Loading state for heading */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Skeleton className="h-10 w-2/3 mx-auto mb-4" />
            <Skeleton className="h-20 w-full mx-auto" />
          </div>

          {/* Loading state for testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
                {/* Rating skeleton */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="w-5 h-5 mr-1" />
                  ))}
                </div>
                {/* Content skeleton */}
                <div className="space-y-2 mb-6">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                {/* Author skeleton */}
                <div className="flex items-center">
                  <Skeleton className="w-10 h-10 rounded-full mr-4" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Function to create a testimonial card
  const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm relative min-w-[350px] max-w-[350px] mx-4 flex-shrink-0">
      {/* Quote marks */}
      <div className="absolute top-6 right-8 text-gray-200 dark:text-gray-700">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.5,3C4.8,3,1,6.8,1,11.5c0,2.8,1.3,5.2,3.4,6.8c-0.3,1.3-1.2,2.7-2.4,3.5c-0.2,0.1-0.3,0.4-0.2,0.6
            c0.1,0.2,0.3,0.3,0.5,0.3c2.2-0.1,4.4-1.2,5.8-2.9c0.5,0.1,0.9,0.1,1.4,0.1c4.7,0,8.5-3.8,8.5-8.5C18,6.8,14.2,3,9.5,3z"/>
        </svg>
      </div>

      {/* Rating */}
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < testimonial.rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed h-[120px] overflow-hidden">
        {testimonial.content}
      </p>

      {/* Author */}
      <div className="flex items-center">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-10 h-10 rounded-full object-cover mr-4"
        />
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {testimonial.name}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {testimonial.role} @ {testimonial.company}
          </p>
        </div>
      </div>
    </div>
  );

  // For the marquee effect, we need enough items to create a continuous scroll
  // We'll duplicate just enough to make the marquee work
  const createMarqueeItems = () => {
    if (testimonials.length === 0) return [];
    return [...testimonials];
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Heading Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            {content?.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {content?.description}
          </p>
        </motion.div>

        {/* Marquee Container */}
        <div 
          className="relative w-full overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Single Row Marquee */}
          <div 
            ref={marqueeRef}
            className="flex py-4 animate-marquee"
            style={{ 
              animationPlayState: isHovered ? 'paused' : 'running',
              animationDuration: '30s'
            }}
          >
            {testimonials.length > 0 && createMarqueeItems().map((testimonial, index) => (
              <TestimonialCard key={`${testimonial.id}-${index}`} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
