import Hero from '@/components/smartspoon/Hero'
import Steps from '@/components/steps/Steps'
import SmartSpoonPricing from '@/components/smartspoon/SmartSpoonPricing'
import Users from '@/components/smartspoon/Users'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SmartSpoon - AI-Powered Nutrition Tracking | Oncotrition',
  description: 'Discover SmartSpoon, our revolutionary AI-powered nutrition tracking device. Get personalized meal recommendations, track your nutrition intake, and improve your health with cutting-edge technology.',
  keywords: 'smart spoon, AI nutrition, nutrition tracking, meal planning, health technology, personalized nutrition',
  openGraph: {
    title: 'SmartSpoon - AI-Powered Nutrition Tracking',
    description: 'Revolutionary AI-powered nutrition tracking device for personalized health management.',
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