'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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

const TESTIMONIALS_PER_PAGE = 6;

export default function MentorshipTestimonials() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<TestimonialsContent | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver>();
  const lastTestimonialRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();

  const loadMoreTestimonials = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const from = page * TESTIMONIALS_PER_PAGE;
      const to = from + TESTIMONIALS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('mentorship_testimonials')
        .select('*')
        .order('order_index')
        .range(from, to);

      if (error) throw error;

      if (data) {
        if (data.length < TESTIMONIALS_PER_PAGE) {
          setHasMore(false);
        }
        if (page === 0) {
          setTestimonials(data);
        } else {
          setTestimonials(prev => [...prev, ...data]);
        }
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more testimonials:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore, supabase]);

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

        // Reset pagination state
        setPage(0);
        setHasMore(true);
        setTestimonials([]);

        // Fetch initial testimonials
        await loadMoreTestimonials();
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreTestimonials();
        }
      },
      { threshold: 0.1 }
    );

    if (lastTestimonialRef.current) {
      observer.observe(lastTestimonialRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, loadingMore, loadMoreTestimonials]);

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

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              ref={index === testimonials.length - 1 ? lastTestimonialRef : null}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % TESTIMONIALS_PER_PAGE) * 0.1 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm relative"
            >
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
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
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
            </motion.div>
          ))}
        </div>

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </section>
  );
}
