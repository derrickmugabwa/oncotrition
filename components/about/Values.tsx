'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FloatingImage from './FloatingImage';

interface VisionSection {
  title: string;
  description: string;
  image_url?: string;
}

interface Vision {
  id: number;
  title: string;
  description: string;
  bullet_points: string[] | any;
  sections?: VisionSection[] | any;
}

interface ValuesImage {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  floating_image_url?: string | null;
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
        const { data: visionData, error: visionError } = await supabase
          .from('values_vision')
          .select('*')
          .single();
  
        if (visionError) {
          console.warn('Error fetching vision data:', visionError);
        } else if (visionData) {
          setVision(visionData);
        }
      } catch (visionErr) {
        console.warn('Error fetching vision data:', visionErr);
      }

      try {
        // Fetch values image
        const { data: valuesImageData, error: valuesError } = await supabase
          .from('values_image')
          .select('*')
          .single();
  
        if (valuesError) {
          console.warn('Error fetching values image data:', valuesError);
        } else if (valuesImageData) {
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

  if (!vision) {
    return (
      <section className="relative py-20 bg-background">
        <div className="container relative mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Loading values...</p>
          </div>
        </div>
      </section>
    );
  }

  // Create cards array from vision sections and values
  const cards = [
    // Main values card
    {
      id: 'values',
      title: valuesImage?.title || 'Our Values',
      description: valuesImage?.description || '',
      imageUrl: valuesImage?.image_url || '',
      isPrimary: true
    },
    // Vision sections as cards with uploaded images
    ...(vision.sections || []).map((section: any, idx: number) => ({
      id: `vision-${idx}`,
      title: section.title,
      description: section.description,
      imageUrl: section.image_url || '', // Use uploaded images from database
      isPrimary: false
    }))
  ];

  return (
    <section className="relative py-20 bg-background overflow-hidden">
      <div className="container relative mx-auto px-4">
        {/* Background label - hidden on mobile to prevent overflow */}
        <span className="hidden md:block absolute -top-10 -z-50 select-none text-[250px] font-extrabold leading-[1] text-foreground/[0.025] lg:text-[400px] md:-left-[18%]">
          Values
        </span>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-bold text-primary mb-6 font-outfit"
        >
          {vision.title}
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center text-base text-muted-foreground mb-8 w-full px-4 sm:px-6 lg:px-8 font-outfit"
        >
          {vision.description}
        </motion.p>
      
      <div className="grid h-auto grid-cols-1 gap-5 md:h-[650px] md:grid-cols-2 lg:grid-cols-[1fr_0.5fr]">
        {cards.map((card, index) => {
          const isPrimary = card.isPrimary;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              style={{ backgroundImage: card.imageUrl ? `url(${card.imageUrl})` : 'none' }}
              className={`group relative row-span-1 flex size-full cursor-pointer flex-col justify-end overflow-hidden rounded-[20px] bg-cover bg-center bg-no-repeat p-6 text-white max-md:h-[300px] transition-all duration-300 hover:scale-[0.98] hover:rotate-[0.3deg] ${
                isPrimary ? 'col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-1' : ''
              } ${!card.imageUrl ? 'bg-gradient-to-br from-teal-500 to-emerald-600' : ''}`}
            >
              <div className="absolute inset-0 -z-0 h-[130%] w-full bg-gradient-to-t from-black/80 to-transparent transition-all duration-500 group-hover:h-full" />
              
              <article className="relative z-0 flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <h3 className={`font-semibold font-outfit ${isPrimary ? 'text-3xl md:text-4xl' : 'text-base md:text-lg'}`}>
                    {card.title}
                  </h3>
                  {card.description && (
                    <p className="text-sm md:text-base text-white/90 leading-relaxed font-outfit">
                      {renderTextWithLinks(card.description)}
                    </p>
                  )}
                  {isPrimary && (
                    <Badge className="w-fit text-sm px-3 py-1 bg-white/30 text-white border-0 backdrop-blur-md font-outfit">
                      Our Foundation
                    </Badge>
                  )}
                </div>
              </article>
            </motion.div>
          );
        })}
      </div>
      </div>
    </section>
  );
}
