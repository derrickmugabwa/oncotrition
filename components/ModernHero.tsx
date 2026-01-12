'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline'
import { ChartBarIcon, HeartIcon, UserGroupIcon } from '@heroicons/react/24/solid'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

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

// Keywords to highlight in green (your theme color)
const highlightKeywords = [
  'connect', 'patients', 'nutrition', 'health', 'smartspoon', 'track', 
  'monitor', 'wellness', 'care', 'treatment', 'recovery', 'prevention',
  'diet', 'meal', 'food', 'cancer', 'therapy', 'support', 'community',
  'nutriprenuership', 'one stop'
]

// Function to highlight keywords in text
const highlightText = (text: string) => {
  if (!text) return text

  let highlightedText = text
  
  highlightKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi')
    highlightedText = highlightedText.replace(
      regex, 
      `<span class="text-green-600 font-bold">$1</span>`
    )
  })
  
  return highlightedText
}

// Animation variants for smooth transitions
const slideVariants = {
  enter: {
    opacity: 0,
    x: -30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    x: 30,
    transition: {
      duration: 0.4,
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
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
    },
  },
}

export default function ModernHero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<SliderImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentStat, setCurrentStat] = useState(0)
  const supabase = createClient()
  const router = useRouter()

  const stats = [
    { label: 'Active Users', value: '12,847', change: '+23.4%', trend: 'up' },
    { label: 'Meals Tracked', value: '847,392', change: '+18.7%', trend: 'up' },
    { label: 'Health Score', value: '94.2%', change: '+5.2%', trend: 'up' },
  ]

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
        } else {
          // Use default slides only if no data from database
          setSlides(defaultSlides)
        }
      } catch (error) {
        console.error('Error fetching slides:', error)
        // Use default slides on error
        setSlides(defaultSlides)
      } finally {
        setIsLoading(false)
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [stats.length])

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [slides.length])

  const currentSlideData = slides[currentSlide] || defaultSlides[0]

  // Don't render until data is loaded to prevent flash
  if (isLoading || slides.length === 0) {
    return (
      <div className={`relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden ${poppins.className}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden ${poppins.className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0">
        {/* Geometric shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-100 rounded-full opacity-30"></div>
        <div className="absolute top-40 right-40 w-16 h-16 bg-blue-200 rounded-full opacity-40"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-blue-100 rounded-full opacity-25"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Large background circles */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-gray-100 to-blue-100 rounded-full opacity-15 blur-3xl"></div>
      </div>



      <div className="relative z-10 container mx-auto px-6 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
          {/* Left Content */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${currentSlideData.id}`}
                variants={slideVariants}
                initial="enter"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <motion.h1 
                  variants={childVariants}
                  className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight"
                  dangerouslySetInnerHTML={{ __html: highlightText(currentSlideData.title) }}
                />

                <motion.p 
                  variants={childVariants}
                  className="text-lg text-gray-600 leading-relaxed max-w-lg"
                >
                  {currentSlideData.description}
                </motion.p>

                <motion.div 
                  variants={childVariants}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(currentSlideData.cta_url || '/')}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                  >
                    {currentSlideData.cta_text}
                    <ArrowRightIcon className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Content - Slider Images */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main Image Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
              {/* Main Image */}
              <div className="relative w-full h-80 rounded-xl overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`image-${currentSlideData.id}`}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={currentSlideData.image_url}
                      alt={currentSlideData.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>



              {/* Slide Indicators */}
              {slides.length > 1 && (
                <div className="flex justify-center gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? 'bg-purple-600 w-6'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Floating Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Health Score</div>
                  <div className="text-xs text-gray-500">+12% this week</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Community</div>
                  <div className="text-xs text-gray-500">2.4k members</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
