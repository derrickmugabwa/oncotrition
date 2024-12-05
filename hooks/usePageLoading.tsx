'use client'

import { useEffect } from 'react'
import { useLoading } from '@/providers/LoadingProvider'

export function usePageLoading() {
  const { setIsLoading } = useLoading()

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800) // slightly shorter duration for better UX

    return () => clearTimeout(timer)
  }, [setIsLoading])
}
