'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import IntroBubble from './IntroBubble'
import MemberShowcase from './MemberShowcase'

interface IntroOrchestratorProps {
  onComplete: () => void
  onMusicStart: () => void
}

export default function IntroOrchestrator({ onComplete, onMusicStart }: IntroOrchestratorProps) {
  const [stage, setStage] = useState<'bubble' | 'showcase' | 'complete'>('bubble')

  const handleBubbleExplode = () => {
    // Start music
    onMusicStart()
    
    // Move to showcase stage
    setTimeout(() => {
      setStage('showcase')
    }, 100)
  }

  const handleShowcaseComplete = () => {
    setStage('complete')
    
    // Notify parent that intro is complete
    setTimeout(() => {
      onComplete()
    }, 800)
  }

  if (stage === 'complete') {
    return null
  }

  return (
    <AnimatePresence mode="wait">
      {stage === 'bubble' && (
        <IntroBubble key="bubble" onExplode={handleBubbleExplode} />
      )}
      
      {stage === 'showcase' && (
        <motion.div
          key="showcase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.8 }}
        >
          <MemberShowcase onComplete={handleShowcaseComplete} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
