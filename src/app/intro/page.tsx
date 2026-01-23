'use client'

import IntroOrchestrator from '@/components/intro/IntroOrchestrator'
import { useApp } from '@/components/providers/AppProvider'

export default function IntroPage() {
  const { musicPlayerRef } = useApp()

  const handleMusicStart = async () => {
    if (musicPlayerRef?.current) {
      await musicPlayerRef.current.startMusic()
    }
  }

  return (
    <IntroOrchestrator 
      onMusicStart={handleMusicStart}
    />
  )
}
