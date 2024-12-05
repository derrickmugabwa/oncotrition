'use client'

import Link from 'next/link'
import HeroSlider from '@/components/HeroSlider'
import Statistics from '@/components/Statistics'
import Features from '@/components/Features'
import Testimonials from '@/components/Testimonials'
import { usePageLoading } from '@/hooks/usePageLoading'

export default function Home() {
  usePageLoading()
  return (
    <main>
      <HeroSlider />
      <Features />
      <Statistics />
      <Testimonials />
    </main>
  )
}