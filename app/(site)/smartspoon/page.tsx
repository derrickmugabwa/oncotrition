'use client'

import Hero from '@/components/smartspoon/Hero'
import Steps from '@/components/steps/Steps'
import SmartSpoonPricing from '@/components/smartspoon/SmartSpoonPricing'
import Users from '@/components/smartspoon/Users'
import { usePageLoading } from '@/hooks/usePageLoading'

export default function SmartSpoon() {
  usePageLoading()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Content */}
      <div className="relative animate-fade-in">
        <Hero />
        <Users />
        <Steps />
        <SmartSpoonPricing />
      </div>
    </div>
  )
}