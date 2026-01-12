'use client';

import { useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent } from '@/components/ui/card';

interface Statistic {
  id: number
  number: string
  label: string
  display_order: number
}

interface StatCardProps {
  stat: Statistic
  index: number
}

interface HeaderContent {
  heading: string
  paragraph: string
}

const StatCard = ({ stat, index }: StatCardProps) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="h-full"
    >
      <Card className="group relative bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 dark:from-teal-950/30 dark:via-emerald-950/30 dark:to-cyan-950/30 border-2 border-teal-200 dark:border-teal-800 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-teal-400 dark:hover:border-teal-600 h-full overflow-hidden">
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
        
        <CardContent className="p-8 relative z-10">
          <motion.h3 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent"
          >
            {stat.number}
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
            className="text-teal-700 dark:text-teal-300 font-medium"
          >
            {stat.label}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Header = ({ headerContent }: { headerContent: HeaderContent }) => {
  const headingRef = useRef(null);
  const isHeadingInView = useInView(headingRef, { once: true, margin: "-50px" });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-16"
    >
      <motion.h2 
        ref={headingRef}
        initial={{ y: 20, opacity: 0 }}
        animate={isHeadingInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="text-2xl md:text-3xl font-bold mb-4 text-primary"
      >
        {headerContent.heading}
      </motion.h2>
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={isHeadingInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-muted-foreground max-w-4xl mx-auto text-base"
      >
        {headerContent.paragraph}
      </motion.p>
    </motion.div>
  );
};

export default function Statistics() {
  const [statistics, setStatistics] = useState<Statistic[]>([])
  const [headerContent, setHeaderContent] = useState<HeaderContent>({
    heading: '',
    paragraph: ''
  })
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    checkDatabaseAccess()
  }, [])

  const checkDatabaseAccess = async () => {
    try {
      setError(null)

      const { error: accessError } = await supabase
        .from('statistics')
        .select('count')
        .single()

      if (accessError) {
        if (accessError.code === 'PGRST116') {
          console.log('Table exists but is empty')
        } else {
          throw accessError
        }
      }

      fetchStatistics()
      fetchHeaderContent()
    } catch (error) {
      console.error('Error verifying database access:', error)
      setError('Database access error')
    }
  }

  const fetchHeaderContent = async () => {
    try {
      const { data, error } = await supabase
        .from('statistics_header')
        .select('*')
        .single()

      if (error) throw error

      if (data) {
        setHeaderContent(data)
      }
    } catch (error) {
      console.error('Error fetching header content:', error)
      // Don't show error toast as this is not critical
    }
  }

  const fetchStatistics = async () => {
    try {
      setError(null)
      console.log('Fetching statistics...')
      
      // First check if we can connect to Supabase
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      // Log the query we're about to make
      console.log('Making Supabase query to statistics table...')
      
      const { data, error, status } = await supabase
        .from('statistics')
        .select('*')
        .order('display_order')

      // Log the response
      console.log('Supabase response:', { data, error, status })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (!data) {
        console.warn('No data returned from Supabase')
        setStatistics([])
        return
      }

      console.log('Successfully fetched statistics:', data)
      console.log('Number of statistics:', data.length)
      
      // Log each statistic
      data.forEach((stat, index) => {
        console.log(`Statistic ${index}:`, stat)
      })

      setStatistics(data)
    } catch (error: any) {
      console.error('Error in fetchStatistics:', error)
      setError(error.message || 'Failed to load statistics')
      // Add stack trace for debugging
      if (error.stack) {
        console.error('Error stack:', error.stack)
      }
    }
  }

  useEffect(() => {
    console.log('Statistics state updated:', statistics)
  }, [statistics])

  if (error) {
    return (
      <div className="text-center text-destructive">
        {error}
      </div>
    )
  }

  return (
    <section className="py-12 bg-background">
      {/* Header with dynamic content */}
      <Header headerContent={headerContent} />
      
      {/* Keep existing statistics section */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {error ? (
          <div className="text-center text-destructive mb-8">
            {error}
          </div>
        ) : statistics.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No statistics available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {statistics.map((stat, index) => (
              <StatCard key={stat.id} stat={stat} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
