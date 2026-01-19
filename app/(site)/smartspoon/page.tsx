import Hero from '@/components/smartspoon/Hero'
import Steps from '@/components/steps/Steps'
import SmartSpoonPricing from '@/components/smartspoon/SmartSpoonPricing'
import Users from '@/components/smartspoon/Users'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Smartspoon PLus',
  description: 'Experience the future of nutrition tracking with our innovative smart spoon technology.',
  keywords: 'Smartspoon, nutrition tracking, meal planning, health technology, personalized nutrition',
  openGraph: {
    title: 'Smartspoon PLus',
    description: 'Experience the future of nutrition tracking with our innovative smart spoon technology.',
    type: 'website',
  },
}

export default function SmartSpoon() {
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