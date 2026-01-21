'use client'

import { useEffect } from 'react'
import Crew from '@/components/crew/Crew'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function CrewPage() {
  // Clean up ScrollTrigger on unmount to ensure page independence
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <main className="relative w-full min-h-screen bg-black selection:bg-white selection:text-black overflow-x-hidden">
      <Crew />
    </main>
  )
}
