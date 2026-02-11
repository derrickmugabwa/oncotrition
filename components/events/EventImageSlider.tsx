'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { EventImage } from '@/types/events';

interface EventImageSliderProps {
  images: EventImage[];
  eventTitle: string;
  autoPlayInterval?: number; // milliseconds
}

export default function EventImageSlider({ 
  images, 
  eventTitle,
  autoPlayInterval = 5000 
}: EventImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Sort images by display_order
  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === sortedImages.length - 1 ? 0 : prevIndex + 1
    );
  }, [sortedImages.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? sortedImages.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false); // Stop autoplay when user manually navigates
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || sortedImages.length <= 1) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, autoPlayInterval, goToNext, sortedImages.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext]);

  // If no images, show placeholder
  if (sortedImages.length === 0) {
    return (
      <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#009688] to-blue-500 flex items-center justify-center">
          <Calendar className="w-24 h-24 text-white/30" />
        </div>
      </div>
    );
  }

  // If only one image, show it without controls
  if (sortedImages.length === 1) {
    return (
      <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800">
        <Image
          src={sortedImages[0].image_url}
          alt={sortedImages[0].caption || eventTitle}
          fill
          className="object-contain"
          priority
          unoptimized
        />
      </div>
    );
  }

  return (
    <div 
      className="relative h-96 rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800 group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Images */}
      <div className="relative h-full w-full">
        {sortedImages.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image.image_url}
              alt={image.caption || `${eventTitle} - Image ${index + 1}`}
              fill
              className="object-contain"
              priority={index === 0}
              unoptimized
            />
            
            {/* Caption overlay */}
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <p className="text-white text-sm md:text-base font-medium">
                  {image.caption}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {sortedImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'w-8 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Image Counter */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
        {currentIndex + 1} / {sortedImages.length}
      </div>
    </div>
  );
}
