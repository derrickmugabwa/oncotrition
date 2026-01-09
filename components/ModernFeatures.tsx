'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { Poppins } from 'next/font/google'
import { 
  BeakerIcon, ChartBarIcon, ClockIcon, CogIcon, 
  CurrencyDollarIcon, DocumentTextIcon, HeartIcon, 
  LightBulbIcon, ScaleIcon, SparklesIcon, UserGroupIcon,
  ShieldCheckIcon, StarIcon, TrophyIcon, FireIcon,
  BoltIcon, GlobeAltIcon, PresentationChartLineIcon,
  AcademicCapIcon, HandThumbUpIcon, CakeIcon,
  BookOpenIcon, BellAlertIcon, CalendarIcon,
  ChatBubbleLeftRightIcon, ClipboardDocumentCheckIcon,
  RocketLaunchIcon, UserIcon, DocumentCheckIcon,
  DocumentChartBarIcon, DocumentMagnifyingGlassIcon,
  CloudArrowUpIcon, ArrowPathIcon, LinkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
})

interface Feature {
  id: number
  title: string
  description: string
  icon_name: string
  order: number
}

interface HeaderContent {
  heading: string
  paragraph: string
  button_text: string
  button_url: string
}

const featureIcons = {
  beaker: BeakerIcon,
  chart: ChartBarIcon,
  clock: ClockIcon,
  cog: CogIcon,
  dollar: CurrencyDollarIcon,
  document: DocumentTextIcon,
  heart: HeartIcon,
  bulb: LightBulbIcon,
  scale: ScaleIcon,
  sparkles: SparklesIcon,
  users: UserGroupIcon,
  shield: ShieldCheckIcon,
  star: StarIcon,
  trophy: TrophyIcon,
  fire: FireIcon,
  bolt: BoltIcon,
  globe: GlobeAltIcon,
  presentation: PresentationChartLineIcon,
  academic: AcademicCapIcon,
  thumbUp: HandThumbUpIcon,
  cake: CakeIcon,
  book: BookOpenIcon,
  bell: BellAlertIcon,
  calendar: CalendarIcon,
  chat: ChatBubbleLeftRightIcon,
  clipboard: ClipboardDocumentCheckIcon,
  rocket: RocketLaunchIcon,
  user: UserIcon,
  supplements: BeakerIcon,
  cardio: HeartIcon,
  metabolism: FireIcon,
  bodyComp: ScaleIcon,
  mealTime: ClockIcon,
  immune: ShieldCheckIcon,
  performance: BoltIcon,
  wellness: SparklesIcon,
  healthyChoice: HandThumbUpIcon,
  personalHealth: UserIcon,
  healthRecords: DocumentCheckIcon,
  healthAnalytics: DocumentChartBarIcon,
  healthInsights: DocumentMagnifyingGlassIcon,
  sync: CloudArrowUpIcon,
  update: ArrowPathIcon,
  connect: LinkIcon,
  search: MagnifyingGlassIcon,
} as const

type IconName = keyof typeof featureIcons





// Keywords to highlight with green gradient
const highlightKeywords = (text: string) => {
  const keywords = ['ultimate', 'nutrition', 'health', 'wellness', 'smart', 'personalized', 'expert', 'community']
  
  let highlightedText = text
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi')
    highlightedText = highlightedText.replace(regex, (match) => {
      return `<span class="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent font-bold">${match}</span>`
    })
  })
  
  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

const FeatureCard = ({ feature, index }: { feature: Feature; index: number }) => {
  const iconName = (feature.icon_name as IconName) in featureIcons 
    ? (feature.icon_name as IconName) 
    : 'scale'
  
  const IconComponent = featureIcons[iconName]
  
  // Gradient colors for each card
  const gradients = [
    'from-teal-400 to-cyan-500',
    'from-green-400 to-emerald-500', 
    'from-purple-400 to-violet-500',
    'from-pink-400 to-rose-500'
  ]
  
  const gradient = gradients[index % gradients.length]



  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="group relative min-h-[300px] w-full"
    >
      {/* Glassmorphism card */}
      <div className="relative h-full min-h-[280px] p-8 rounded-2xl bg-white/80 border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
        {/* Gradient background overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 rounded-2xl group-hover:opacity-20 transition-opacity duration-300`} />
        
        {/* Icon container */}
        <div className="relative mb-6 z-10">
          <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
            {feature.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function ModernFeatures() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [headerContent, setHeaderContent] = useState<HeaderContent | null>(null)
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      // Fetch features
      const { data: featuresData, error: featuresError } = await supabase
        .from('features')
        .select('*')
        .order('order')

      if (featuresError) {
        console.error('Error fetching features:', featuresError)
      } else if (featuresData && featuresData.length > 0) {
        setFeatures(featuresData)
      }

      // Fetch header content
      const { data: headerData, error: headerError } = await supabase
        .from('features_header')
        .select('*')
        .single()

      if (headerError) {
        console.error('Error fetching header content:', headerError)
      } else if (headerData) {
        setHeaderContent(headerData)
      }
    }

    fetchData()

    // Subscribe to real-time changes
    const featuresChannel = supabase
      .channel('modern_features_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'features'
        },
        () => {
          fetchData()
        }
      )
      .subscribe()

    const headerChannel = supabase
      .channel('modern_header_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'features_header'
        },
        () => {
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(featuresChannel)
      supabase.removeChannel(headerChannel)
    }
  }, [supabase])





  return (
    <section className={`relative py-20 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden ${poppins.className}`} style={{ fontFamily: poppins.style.fontFamily }}>
      {/* Background elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-teal-200 to-cyan-200 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full opacity-15 blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative container mx-auto px-6">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          
          {/* Left column - Content */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              {/* Tagline */}
              <div className="mb-4">
                <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 text-sm font-medium rounded-full">
                  ✨ Transform Your Health Journey
                </span>
              </div>
              
              {headerContent && (
                <>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {highlightKeywords(headerContent.heading)}
                  </h2>
                  <p className="text-base text-gray-600 leading-relaxed mb-8">
                    {headerContent.paragraph}
                  </p>
                </>
              )}
              
              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Explore Features
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          {/* Right column - Feature cards in 2x2 grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-6"
          >
            {features.slice(0, 4).map((feature, index) => (
              <div key={feature.id} className="w-full">
                <FeatureCard
                  feature={feature}
                  index={index}
                />
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  )
}
