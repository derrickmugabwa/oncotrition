'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

interface Brand {
  id: number;
  name: string;
  logo_url: string;
  order_index: number;
}

interface BrandContent {
  title: string;
}

export function BrandSlider() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [title, setTitle] = useState('Our partners and Compliance');
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
    }
  };

  const fetchTitle = async () => {
    try {
      const { data, error } = await supabase
        .from('brands_content')
        .select('title')
        .limit(1)
        .single<BrandContent>();

      if (error) throw error;
      if (data) setTitle(data.title);
    } catch (error) {
      console.error('Error fetching title:', error);
    }
  };

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="relative py-12 pt-8 bg-background">
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
        <h2 className="text-2xl font-bold text-center mb-12 text-foreground">
          {title}
        </h2>
        <div className="flex flex-wrap justify-center gap-16 max-w-6xl mx-auto">
          {brands.map((brand) => (
            <Card 
              key={brand.id} 
              className="relative h-[140px] w-[280px] flex items-center justify-center bg-card/90 backdrop-blur-sm p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-card border-border/50 hover:border-primary/30"
            >
              {brand.logo_url && (
                <Image
                  src={brand.logo_url}
                  alt={`${brand.name} logo`}
                  fill
                  className="object-contain p-3"
                />
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
