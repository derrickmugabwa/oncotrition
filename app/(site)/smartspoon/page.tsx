'use client'

import LoginHero from '@/components/login/LoginHero'
import Steps from '@/components/steps/Steps'
import SmartSpoonPricing from '@/components/smartspoon/SmartSpoonPricing'
import { motion } from 'framer-motion'
import { usePageLoading } from '@/hooks/usePageLoading'

export default function SmartSpoon() {
  usePageLoading()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Small particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative animate-fade-in">
        <LoginHero />
        <Steps />
        <SmartSpoonPricing />
      </div>
    </div>
  )
}