'use client'

import { useState, useRef } from 'react'
import IntroOrchestrator from './intro/IntroOrchestrator'
import MusicPlayer, { MusicPlayerRef } from './ui/MusicPlayer'

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const [introComplete, setIntroComplete] = useState(false)
  const musicPlayerRef = useRef<MusicPlayerRef>(null)

  const handleMusicStart = async () => {
    if (musicPlayerRef.current) {
      await musicPlayerRef.current.startMusic()
    }
  }

  const handleIntroComplete = () => {
    setIntroComplete(true)
  }

  return (
    <>
      <MusicPlayer ref={musicPlayerRef} />
      
      {!introComplete && (
        <IntroOrchestrator 
          onComplete={handleIntroComplete} 
          onMusicStart={handleMusicStart}
        />
      )}

      {/* Main content - visible after intro */}
      <div style={{ display: introComplete ? 'block' : 'none' }}>
        {children}
      </div>
    </>
  )
}
