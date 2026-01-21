'use client'

import { useEffect } from 'react'
import IntroOrchestrator from '@/components/intro/IntroOrchestrator'
import { useApp } from '@/components/providers/AppProvider'

export default function IntroPage() {
  const { musicPlayerRef } = useApp()

  const handleMusicStart = async () => {
    if (musicPlayerRef?.current) {
      await musicPlayerRef.current.startMusic()
    }
  }

  // Mark intro as visited when component mounts
  useEffect(() => {
    localStorage.setItem('hasVisitedIntro', 'true')
  }, [])

  return (
    <IntroOrchestrator 
      onMusicStart={handleMusicStart}
    />
  )
}
