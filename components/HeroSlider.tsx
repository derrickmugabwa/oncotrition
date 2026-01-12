'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface SliderImage {
  id: number
  title: string
  description: string
  image_url: string
  cta_text: string
  cta_url: string
  order: number
}

const defaultSlides: SliderImage[] = []

const slideVariants = {
  enter: {
    opacity: 0,
    x: -30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3, // Faster animation
      staggerChildren: 0.1, // Faster stagger
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: 30,
    transition: {
      duration: 0.2, // Faster exit
      ease: "easeIn",
    },
  },
}

const childVariants = {
  enter: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
}

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<SliderImage[]>(defaultSlides)
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set())
  const supabase = createClient()
  const router = useRouter()

  // Preload images for faster loading
  const preloadImage = useCallback((src: string) => {
    if (typeof window !== 'undefined' && !imagesLoaded.has(src)) {
      const img = new window.Image()
      img.onload = () => {
        setImagesLoaded(prev => new Set([...prev, src]))
      }
      img.src = src
    }
  }, [imagesLoaded])

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data, error } = await supabase
          .from('slider_images')
          .select('*')
          .order('order')

        if (error) throw error

        if (data && data.length > 0) {
          setSlides(data)
          // Preload all images immediately
          data.forEach(slide => preloadImage(slide.image_url))
        } else {
          // Preload default image
          defaultSlides.forEach(slide => preloadImage(slide.image_url))
        }
      } catch (error) {
        console.error('Error fetching slides:', error)
        // Preload default images on error
        defaultSlides.forEach(slide => preloadImage(slide.image_url))
      }
    }

    fetchSlides()

    const channel = supabase
      .channel('slider_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'slider_images'
        },
        () => {
          fetchSlides()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, preloadImage])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    // Only start auto-slide when we have slides and images are loading
    if (slides.length > 1) {
      const timer = setInterval(nextSlide, 5000) // Reduced from 7000ms to 5000ms for faster transitions
      return () => clearInterval(timer)
    }
  }, [slides.length])



  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-background">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-300 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Full-Width Background Image with Gradient Overlay */}
          <div className="relative w-full h-full">
            {slide.image_url && (
              <Image
                src={slide.image_url}
                alt={slide.title}
                fill
                priority={index <= 1} // Prioritize first two images
                className="object-cover transition-opacity duration-300"
                sizes="100vw"
                quality={90} // High quality for hero images
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                onLoad={() => {
                  // Mark image as loaded for smoother transitions
                  setImagesLoaded(prev => new Set([...prev, slide.image_url]))
                }}
              />
            )}
            {/* Dark gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </div>

          {/* Content Container */}
          <div className="absolute inset-0 container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              {index === currentSlide && (
                <motion.div
                  key={`content-${slide.id}`}
                  className="h-full flex flex-col justify-center max-w-lg"
                  variants={slideVariants}
                  initial="enter"
                  animate="visible"
                  exit="exit"
                >
                  <motion.h2
                    variants={childVariants}
                    className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight relative z-10 drop-shadow-lg"
                  >
                    {slide.title}
                  </motion.h2>

                  <motion.p
                    variants={childVariants}
                    className="text-base md:text-lg lg:text-xl text-white/90 mb-8 leading-relaxed relative z-10 drop-shadow-md"
                  >
                    {slide.description}
                  </motion.p>

                  <motion.div variants={childVariants} className="relative z-10">
                    <Button 
                      onClick={() => router.push(slide.cta_url || '/')}
                      size="lg"
                      className="px-8 py-4 text-base font-medium inline-flex items-center group"
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
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ))}

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          <Button
            onClick={prevSlide}
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </Button>
          <Button
            onClick={nextSlide}
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </Button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-8 flex gap-3">
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
  )
}
