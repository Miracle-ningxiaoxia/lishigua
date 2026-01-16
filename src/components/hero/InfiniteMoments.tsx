'use client'

import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function InfiniteMoments() {
  const [targetValue, setTargetValue] = useState(0)
  
  // Spring physics for smooth counting
  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
    mass: 1,
    duration: 3 // Longer duration for the "count up" feel
  })

  // Format number with commas
  const displayValue = useTransform(springValue, (current) => 
    Math.round(current).toLocaleString('en-US')
  )

  useEffect(() => {
    // Trigger the count up animation after mount
    const timer = setTimeout(() => {
      setTargetValue(86400) // Target number
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    springValue.set(targetValue)
  }, [targetValue, springValue])

  return (
    <div className="flex flex-col items-center mt-12">
      <motion.div 
        className="font-mono text-4xl md:text-6xl font-bold tracking-tight text-white/90"
        style={{
            textShadow: "0 0 20px rgba(255,255,255,0.3)"
        }}
      >
        {displayValue}
      </motion.div>
      <div className="flex items-center gap-3 mt-3">
        <div className="h-[1px] w-12 bg-white/30" />
        <span className="font-sans text-sm md:text-base uppercase tracking-[0.3em] text-neutral-400">
          Infinite Moments
        </span>
        <div className="h-[1px] w-12 bg-white/30" />
      </div>
      <p className="mt-2 font-hand text-neutral-500 text-lg">Captured Memories</p>
    </div>
  )
}
