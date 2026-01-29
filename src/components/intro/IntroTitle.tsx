'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface IntroTitleProps {
  onEnter: () => void
}

// 生成固定的粒子位置（避免 hydration mismatch）
const generateParticles = () => 
  Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 3 + Math.random() * 2,
    delay: Math.random() * 2,
  }))

export default function IntroTitle({ onEnter }: IntroTitleProps) {
  // 使用 state 存储粒子位置，只在客户端生成一次（避免 SSR/CSR 不一致）
  const [particles, setParticles] = useState<Array<{
    id: number
    left: number
    top: number
    duration: number
    delay: number
  }>>([])

  // 仅在客户端生成粒子位置
  useEffect(() => {
    setParticles(generateParticles())
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
        {/* Decorative Top Text */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-8"
        >
          <p className="font-mono text-xs uppercase tracking-[0.5em] text-white/40">
            Welcome to
          </p>
        </motion.div>

        {/* Main Title - 时光快递驿站 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
          className="text-center mb-6"
        >
          <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-light text-white tracking-[0.15em] relative">
            时光快递驿站
            {/* Glow effect */}
            <span className="absolute inset-0 text-8xl md:text-9xl lg:text-[12rem] blur-2xl opacity-30 text-white">
              时光快递驿站
            </span>
          </h1>
        </motion.div>

        {/* English Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mb-4"
        >
          <p className="font-mono text-sm md:text-base uppercase tracking-[0.4em] text-white/60">
            Moments Collected
          </p>
        </motion.div>

        {/* Decorative Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
          className="w-32 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent mb-12"
        />

        {/* Poetic Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="max-w-2xl text-center mb-16"
        >
          <p className="font-hand text-xl md:text-2xl text-white/70 leading-relaxed">
            时光的碎片，友谊的印记
          </p>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/30 mt-2">
            Fragments of Time, Marks of Friendship
          </p>
        </motion.div>

        {/* Enter Button */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 255, 255, 0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onEnter}
          className="group relative px-12 py-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full overflow-hidden transition-all duration-500 hover:bg-white/15 hover:border-white/40"
          data-cursor="hover"
        >
          {/* Button glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          
          <div className="relative flex items-center gap-3">
            <span className="font-mono text-sm uppercase tracking-[0.3em] text-white">
              Enter
            </span>
            <ArrowRight className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </motion.button>

        {/* Bottom Decorative Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/20">
            Click to Begin Your Journey
          </p>
        </motion.div>

        {/* Floating Particles Effect - 仅在客户端渲染，避免 hydration mismatch */}
        {particles.length > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  delay: particle.delay,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
