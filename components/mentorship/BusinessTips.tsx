'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight } from 'lucide-react';

interface BusinessTipsContent {
  id: string;
  title: string;
  description: string;
}

interface BusinessTip {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  order_index: number;
}

export default function BusinessTips() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<BusinessTipsContent | null>(null);
  const [tips, setTips] = useState<BusinessTip[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch section content
        const { data: contentData, error: contentError } = await supabase
          .from('mentorship_business_tips_content')
          .select('*')
          .single();

        if (contentError) throw contentError;
        setContent(contentData);

        // Fetch business tips
        const { data: tipsData, error: tipsError } = await supabase
          .from('mentorship_business_tips')
          .select('*')
          .order('order_index');

        if (tipsError) throw tipsError;
        setTips(tipsData || []);
      } catch (error) {
        console.error('Error fetching business tips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          {/* Loading state for heading */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Skeleton className="h-10 w-2/3 mx-auto mb-4" />
            <Skeleton className="h-20 w-full mx-auto" />
          </div>

          {/* Loading state for tips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
                {/* Image skeleton */}
                <Skeleton className="w-full h-48 mb-6" />
                {/* Title skeleton */}
                <Skeleton className="h-6 w-3/4 mb-4" />
                {/* Description skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        {/* Section Header */}
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

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tips.map((tip, index) => (
            <Link
              key={tip.id}
              href={tip.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
              onClick={(e) => {
                if (!tip.url) {
                  e.preventDefault();
                  console.warn('No URL provided for business tip:', tip.title);
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative group-hover:-translate-y-1 ${!tip.url ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                <div className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div className="relative w-full h-48 mb-6">
                  <Image
                    src={tip.image || '/images/mentorship/placeholder.svg'}
                    alt={tip.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors duration-300">
                  {tip.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {tip.description}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
