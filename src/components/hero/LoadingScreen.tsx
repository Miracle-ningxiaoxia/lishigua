'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [showText, setShowText] = useState(true)

  useEffect(() => {
    // Sequence:
    // 0s: Start
    // 0-1.5s: Text fade in
    // 3.5s: Text fade out starts
    // 4.5s: Iris wipe starts (onComplete triggers layout change in Hero)
    
    const textExitTimer = setTimeout(() => {
      setShowText(false)
    }, 2500) 

    const completeTimer = setTimeout(() => {
        // We actually want the clip-path animation to happen ON the black overlay.
        // So we signal completion to the parent to start "revealing" OR we animate the overlay here.
        // To keep logic clean, let's animate the "exit" of this component using the custom clipPath.
        onComplete()
    }, 3500)

    return () => {
      clearTimeout(textExitTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <motion.div
      key="loading-screen"
      className="absolute inset-0 z-[100] h-full w-full flex items-center justify-center bg-black pointer-events-none"
      initial={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ 
        clipPath: 'circle(0% at 50% 50%)',
        transition: { duration: 1.5, ease: [0.76, 0, 0.24, 1] } // Custom easing for dramatic effect
      }}
    >
        {/* Note: The "Exit" animation above is actually "Closing" the iris. 
            The requirement is "Iris Wipe" to REVEAL the background.
            So we actually want the black screen to have a hole growing in it.
            
            Approach: Use an inverted clip path or a mask-image.
            Or easier: The Hero component handles the "reveal".
            
            Let's change strategy: This component just fades out text.
            The actual black overlay transition should be handled by the parent
            or this component should animate `clipPath` from full to empty?
            
            Actually, `clipPath: circle(0% ...)` means visible area is 0. So it disappears.
            Wait, if the bg is black, we want the visible area of THIS black div to shrink to 0?
            Yes, that would reveal the video behind it.
        */}
      <motion.p
        className="font-hand text-3xl md:text-5xl text-white tracking-widest absolute"
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ 
          opacity: showText ? 1 : 0, 
          filter: showText ? 'blur(0px)' : 'blur(10px)',
          scale: showText ? 1 : 1.1
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        有些瞬间，注定成为永恒
      </motion.p>
    </motion.div>
  )
}
