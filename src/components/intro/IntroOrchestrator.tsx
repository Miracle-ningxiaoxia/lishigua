'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import IntroTitle from './IntroTitle'
import MemberShowcase from './MemberShowcase'

interface IntroOrchestratorProps {
  onMusicStart: () => void
}

export default function IntroOrchestrator({ onMusicStart }: IntroOrchestratorProps) {
  const [stage, setStage] = useState<'title' | 'showcase'>('title')

  const handleEnter = () => {
    // Start music
    onMusicStart()
    
    // Move to showcase stage
    setTimeout(() => {
      setStage('showcase')
    }, 100)
  }

  return (
    <AnimatePresence mode="wait">
      {stage === 'title' && (
        <IntroTitle key="title" onEnter={handleEnter} />
      )}
      
      {stage === 'showcase' && (
        <motion.div
          key="showcase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <MemberShowcase />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
