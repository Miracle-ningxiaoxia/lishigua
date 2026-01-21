'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Kill all existing ScrollTriggers on route change
    ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      smoothTouch: false, // Disable on mobile for better performance
    })

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', () => {
      ScrollTrigger.update()
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const rafId = requestAnimationFrame(raf)

    // Update ScrollTrigger on resize
    const handleResize = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      // Clean up on unmount or route change
      cancelAnimationFrame(rafId)
      lenis.destroy()
      window.removeEventListener('resize', handleResize)
      
      // Kill all ScrollTriggers for this page
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      ScrollTrigger.clearScrollMemory()
    }
  }, [pathname]) // Re-run on route change

  return <>{children}</>
}
