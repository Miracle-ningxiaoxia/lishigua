'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [cursorText, setCursorText] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { stiffness: 500, damping: 28 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    // Check if device is mobile/touch
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    checkMobile()

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInteractive = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('a') !== null ||
        target.closest('button') !== null ||
        target.hasAttribute('data-cursor') ||
        target.closest('[data-cursor]') !== null

      setIsHovering(isInteractive)

      // Check for special cursor text (e.g., data-cursor="open")
      const cursorAttr = target.getAttribute('data-cursor') || target.closest('[data-cursor]')?.getAttribute('data-cursor')
      if (cursorAttr === 'open') {
        setCursorText('Open')
      } else {
        setCursorText('')
      }
    }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [cursorX, cursorY])

  // Hide on mobile
  if (isMobile) return null

  return (
    <>
      {/* Main cursor ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <motion.div
          className="relative -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: isHovering ? 2.5 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Outer ring */}
          <div 
            className={`w-5 h-5 rounded-full border transition-all duration-300 flex items-center justify-center ${
              isHovering 
                ? 'border-white/70 backdrop-blur-sm bg-white/10' 
                : 'border-white/50 bg-transparent'
            }`}
          >
            {/* Cursor Text */}
            {cursorText && (
              <motion.span
                className="font-mono text-[8px] text-white uppercase tracking-wider whitespace-nowrap"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {cursorText}
              </motion.span>
            )}
          </div>
          
          {/* Center dot */}
          <motion.div 
            className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-white -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: isHovering ? 0 : 1,
              opacity: isHovering ? 0 : 1,
            }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
      </motion.div>
    </>
  )
}
