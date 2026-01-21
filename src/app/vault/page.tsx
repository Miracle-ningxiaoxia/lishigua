'use client'

import { useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Dynamic import for FutureLetter component to reduce initial bundle size
const FutureLetter = dynamic(() => import('@/components/future/FutureLetter'), {
  loading: () => (
    <div className="relative w-full min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 font-mono text-sm uppercase tracking-wider">
          Loading Vault...
        </p>
      </div>
    </div>
  ),
  ssr: false, // Disable SSR for components with browser-only features
})

export default function VaultPage() {
  // Clean up ScrollTrigger on unmount to ensure page independence
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <main className="relative w-full min-h-screen bg-black selection:bg-white selection:text-black overflow-x-hidden">
      <Suspense fallback={
        <div className="relative w-full min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60 font-mono text-sm uppercase tracking-wider">
              Loading Vault...
            </p>
          </div>
        </div>
      }>
        <FutureLetter />
      </Suspense>
    </main>
  )
}
