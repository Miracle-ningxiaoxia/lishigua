'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import InfiniteMoments from './InfiniteMoments'
import Noise from '../ui/Noise'
import { ArrowDown } from 'lucide-react'

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Use window scroll instead of target to avoid Lenis conflict
  const { scrollY } = useScroll()
  
  // Manually calculate progress based on Hero section position
  const scale = useTransform(scrollY, [0, 1000], [1, 1.1])
  const blur = useTransform(scrollY, [0, 1000], ["blur(0px)", "blur(10px)"])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])

  // Content
  const title = "ECHOES | 拾光纪"
  
  return (
    <section 
      ref={containerRef} 
      id="home-section"
      className="relative min-h-[100vh] h-screen w-full overflow-hidden bg-black"
      style={{ marginTop: 0, paddingTop: 0 }}
    >
      {/* Background Layer */}
      <motion.div 
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ scale, filter: blur }}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute top-0 left-0 h-[100vh] w-full object-cover"
          style={{ minHeight: '100vh', minWidth: '100vw' }}
        >
          {/* 请确保将您的视频文件命名为 hero-bg.mp4 并放入 public 文件夹 */}
          <source src="/hero-bg.mp4" type="video/mp4" />
          {/* Fallback */}
          <div className="h-full w-full bg-neutral-900" />
        </video>
        
        {/* Cinematic Overlays */}
        {/* 1. Deep Space Grey Overlay for text readability */}
        <div className="absolute inset-0 bg-neutral-900/40 mix-blend-overlay" />
        
        {/* 2. Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,black_90%)]" />
      </motion.div>

      <Noise />

      {/* Content Layer */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div className="overflow-hidden mb-6">
                <h1 
                    className="flex flex-wrap justify-center text-5xl md:text-7xl lg:text-8xl font-bold tracking-[0.2em] uppercase text-white"
                    style={{
                        textShadow: "0 0 40px rgba(255,255,255,0.5)" // Breathing glow base
                    }}
                >
                  <motion.span
                     animate={{ textShadow: ["0 0 40px rgba(255,255,255,0.3)", "0 0 60px rgba(255,255,255,0.6)", "0 0 40px rgba(255,255,255,0.3)"] }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                      {title}
                  </motion.span>
                </h1>
              </div>

              <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="font-hand text-xl md:text-3xl text-neutral-300/80 tracking-wide mt-4"
              >
                A collection of shared pulses and timeless echoes.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
              >
                <InfiniteMoments />
              </motion.div>
            </motion.div>
            
            {/* Scroll Indicator */}
            <motion.div 
              style={{ opacity }}
              className="absolute bottom-10 flex flex-col items-center gap-2 text-neutral-500 mix-blend-difference"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
              <ArrowDown className="h-4 w-4" />
            </motion.div>
        </div>
    </section>
  )
}
