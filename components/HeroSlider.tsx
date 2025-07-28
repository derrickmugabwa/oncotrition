'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface SliderImage {
  id: number
  title: string
  description: string
  image_url: string
  cta_text: string
  cta_url: string
  order: number
}

const defaultSlides = [
  {
    id: 1,
    title: 'Welcome to SmartSpoon+',
    description: 'Your personal nutrition tracking assistant',
    image_url: '/images/default-hero.jpg',
    cta_text: 'Get Started',
    cta_url: '/',
    order: 0
  }
]

const slideVariants = {
  enter: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: {
      duration: 0.3,
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
  const supabase = createClientComponentClient()
  const router = useRouter()

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
        }
      } catch (error) {
        console.error('Error fetching slides:', error)
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
  }, [supabase])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    const timer = setInterval(nextSlide, 7000)
    return () => clearInterval(timer)
  }, [slides.length])



  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-gray-900">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image with Gradient Overlay */}
          <div className="relative w-full h-full">
            <div className="absolute right-0 w-[75%] h-full">
              <div className="relative w-full h-full">
                <Image
                  src={slide.image_url}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover rounded-l-[40px]"
                  sizes="(max-width: 768px) 100vw, 75vw"
                />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/60 to-transparent" />
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
                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight relative z-10"
                  >
                    {slide.title}
                  </motion.h2>

                  <motion.p
                    variants={childVariants}
                    className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed relative z-10"
                  >
                    {slide.description}
                  </motion.p>

                  <motion.div variants={childVariants} className="relative z-10">
                    <button 
                      onClick={() => router.push(slide.cta_url || '/')}
                      className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium inline-flex items-center group"
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
                    </button>
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
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>

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
