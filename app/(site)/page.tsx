'use client'

import Link from 'next/link'
import HeroSlider from '@/components/HeroSlider'
import Statistics from '@/components/Statistics'
import Features from '@/components/Features'
import Testimonials from '@/components/Testimonials'
import HomepageMentorship from '@/components/HomepageMentorship'
import { usePageLoading } from '@/hooks/usePageLoading'

export default function Home() {
  usePageLoading()
  return (
    <main>
      <HeroSlider />
      <Features />
      <Statistics />
      <HomepageMentorship />
      <Testimonials />
    </main>
  )
}