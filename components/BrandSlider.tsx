'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Inter } from 'next/font/google';

const ranade = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

interface Brand {
  id: number;
  name: string;
  logo_url: string;
  order_index: number;
}

export function BrandSlider() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [title, setTitle] = useState('Our partners and Compliance');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchBrands();
    fetchTitle();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTitle = async () => {
    try {
      const { data, error } = await supabase
        .from('brands_content')
        .select('title')
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) setTitle(data[0].title);
    } catch (error) {
      console.error('Error fetching title:', error);
    }
  };

  if (loading) {
    return (
      <section className={`relative py-24 bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${ranade.className}`}>
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-64 mx-auto mb-12" />
          <div className="flex flex-wrap justify-center gap-16 max-w-6xl mx-auto">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-[140px] w-[280px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className={`relative py-24 bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${ranade.className}`}>
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Content */}
      <div className="relative container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          {title}
        </h2>
        <div className="flex flex-wrap justify-center gap-16 max-w-6xl mx-auto">
          {brands.map((brand) => (
            <div 
              key={brand.id} 
              className="relative h-[140px] w-[280px] flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-white dark:hover:bg-gray-800"
            >
              <Image
                src={brand.logo_url}
                alt={`${brand.name} logo`}
                fill
                className="object-contain p-3"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
