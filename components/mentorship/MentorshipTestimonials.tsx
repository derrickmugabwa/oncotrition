'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { GridPattern } from '@/components/ui/grid-pattern';

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
  const supabase = createClient();

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
      <section className="relative w-full pt-10 pb-20 px-4">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12 w-3/4 mb-2" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full pt-10 pb-20 px-4">
      <div aria-hidden className="absolute inset-0 isolate z-0 contain-strict">
        <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 left-0 h-320 w-140 -translate-y-87.5 -rotate-45 rounded-full" />
        <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] -rotate-45 rounded-full" />
        <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 -translate-y-87.5 -rotate-45 rounded-full" />
      </div>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl xl:text-6xl xl:font-extrabold">
            {content?.title || 'Real Results, Real Voices'}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
            {content?.description || 'See how our mentorship program is transforming lives — real stories, real impact, real growth.'}
          </p>
        </div>
        <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map(({ id, name, role, company, content, image }, index) => (
            <motion.div
              initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
              whileInView={{
                filter: 'blur(0px)',
                translateY: 0,
                opacity: 1,
              }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index + 0.1, duration: 0.8 }}
              key={id}
              className="border-foreground/25 relative grid grid-cols-[auto_1fr] gap-x-3 overflow-hidden border border-dashed p-4"
            >
              <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
                <div className="from-foreground/5 to-foreground/2 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
                  <GridPattern
                    width={25}
                    height={25}
                    x={-12}
                    y={4}
                    strokeDasharray="3"
                    className="stroke-foreground/20 absolute inset-0 h-full w-full mix-blend-overlay"
                  />
                </div>
              </div>
              <img
                alt={name}
                src={image}
                loading="lazy"
                className="size-9 rounded-full"
              />
              <div>
                <div className="-mt-0.5 -space-y-0.5">
                  <p className="text-sm md:text-base">{name}</p>
                  <span className="text-muted-foreground block text-[11px] font-light tracking-tight">
                    {role} at {company}
                  </span>
                </div>
                <blockquote className="mt-3">
                  <p className="text-foreground text-sm font-light tracking-wide">
                    {content}
                  </p>
                </blockquote>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
