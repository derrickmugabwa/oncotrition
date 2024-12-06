'use client';

import { useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

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

const StatCard = ({ stat, index }: StatCardProps) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:via-green-900/10 dark:to-teal-900/20 p-8 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      <motion.h3 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
        className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent"
      >
        {stat.number}
      </motion.h3>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
        className="text-emerald-800 dark:text-emerald-200"
      >
        {stat.label}
      </motion.p>
    </motion.div>
  );
};

const Header = () => {
  const headingRef = useRef(null);
  const isHeadingInView = useInView(headingRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={headingRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isHeadingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <motion.h2 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isHeadingInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-3xl md:text-4xl font-bold mb-4"
      >
        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
          Trusted by Health Professionals Worldwide
        </span>
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={isHeadingInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-gray-600 dark:text-gray-300 max-w-4xl mx-auto text-lg"
      >
        Join thousands of nutritionists, dietitians, and health coaches who trust SmartSpoon+ to streamline their practice 
        and deliver exceptional results to their clients. Our platform is designed to help you work smarter, not harder.
      </motion.p>
    </motion.div>
  );
};

export default function Statistics() {
  const [statistics, setStatistics] = useState<Statistic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Check Supabase initialization
    if (!supabase) {
      console.error('Supabase client not initialized')
      setError('Database connection error')
      setIsLoading(false)
      return
    }

    // Verify we can access the statistics table
    const verifyAccess = async () => {
      try {
        const { error } = await supabase
          .from('statistics')
          .select('count')
          .single()

        if (error) {
          console.error('Error accessing statistics table:', error)
          setError('Error accessing statistics data')
          setIsLoading(false)
          return
        }

        // If we can access the table, fetch the statistics
        fetchStatistics()
      } catch (error) {
        console.error('Error verifying database access:', error)
        setError('Database access error')
        setIsLoading(false)
      }
    }

    verifyAccess()
  }, [])

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
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('Statistics state updated:', statistics)
  }, [statistics])

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/30 dark:to-gray-900"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header is now a separate component */}
        <Header />

        {error ? (
          <div className="text-center text-red-600 dark:text-red-400 mb-8">
            {error}
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : statistics.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400">
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
