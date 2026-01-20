'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import confetti from 'canvas-confetti'

interface IntroBubbleProps {
  onExplode: () => void
}

export default function IntroBubble({ onExplode }: IntroBubbleProps) {
  const orbRef = useRef<HTMLDivElement>(null)
  const nebulaRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isExploding, setIsExploding] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Magnetic effect
  const orbX = useTransform(mouseX, [-200, 200], [-30, 30])
  const orbY = useTransform(mouseY, [-200, 200], [-30, 30])

  useEffect(() => {
    if (!orbRef.current) return

    // Breathing & Floating animation
    gsap.to(orbRef.current, {
      scale: 1.08,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    gsap.to(orbRef.current, {
      y: -15,
      duration: 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    // Morphing border-radius (liquid metal effect)
    gsap.to(orbRef.current, {
      borderRadius: '47% 53% 48% 52% / 52% 48% 52% 48%',
      duration: 6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    // Nebula rotation
    if (nebulaRef.current) {
      gsap.to(nebulaRef.current, {
        rotation: 360,
        duration: 20,
        ease: 'none',
        repeat: -1,
      })
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  const handleClick = async () => {
    if (isExploding) return
    setIsExploding(true)

    // Play pop sound
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err))
    }

    if (!orbRef.current) return

    // Stage 1: Implosion (0.3s)
    await gsap.to(orbRef.current, {
      scale: 0.5,
      filter: 'brightness(5) saturate(2)',
      duration: 0.3,
      ease: 'power4.in',
    })

    // Stage 2: Shockwave & Explosion (1.5s)
    // Create shockwave element
    const shockwave = document.createElement('div')
    shockwave.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 0 50px rgba(100, 200, 255, 0.8), 
                  inset 0 0 50px rgba(255, 100, 200, 0.6);
      pointer-events: none;
      z-index: 250;
    `
    document.body.appendChild(shockwave)

    // Shockwave expansion
    gsap.to(shockwave, {
      width: '200vw',
      height: '200vw',
      opacity: 0,
      duration: 1.5,
      ease: 'power2.out',
      onComplete: () => {
        shockwave.remove()
      }
    })

    // Chromatic aberration effect on orb
    gsap.to(orbRef.current, {
      scale: 3,
      opacity: 0,
      filter: 'blur(50px) hue-rotate(180deg)',
      duration: 1.2,
      ease: 'expo.out',
    })

    // Particle burst (enhanced confetti)
    const duration = 2000
    const animationEnd = Date.now() + duration

    const colors = ['#4A90E2', '#FFD700', '#9B59B6', '#E74C3C', '#1ABC9C']

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    // Multiple waves of particles
    const particleInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(particleInterval)
        return
      }

      const particleCount = 30

      // Omnidirectional burst
      confetti({
        particleCount,
        angle: randomInRange(0, 360),
        spread: randomInRange(50, 100),
        origin: { x: 0.5, y: 0.5 },
        colors: colors,
        ticks: 200,
        gravity: 0.5,
        scalar: randomInRange(1, 2),
        drift: randomInRange(-1, 1),
        shapes: ['circle', 'square'],
        startVelocity: randomInRange(30, 60),
      })
    }, 100)

    // Trigger callback after explosion
    setTimeout(() => {
      onExplode()
    }, 1000)
  }

  return (
    <>
      <audio ref={audioRef} preload="auto">
        <source src="/audio/pop.mp3" type="audio/mpeg" />
      </audio>

      <motion.div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Environmental Aura (pulsing glow) */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(100,150,255,0.3) 0%, rgba(150,100,255,0.2) 30%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: isHovered ? [1, 1.3, 1] : [1, 1.2, 1],
            opacity: isHovered ? [0.4, 0.7, 0.4] : [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: isHovered ? 2 : 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* The Orb */}
        <motion.div
          ref={orbRef}
          className="relative cursor-pointer group"
          style={{
            x: isHovered ? orbX : 0,
            y: isHovered ? orbY : 0,
            width: '320px',
            height: '320px',
          }}
          onClick={handleClick}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          data-cursor="hover"
        >
          {/* Glass shell with multi-layer shadows */}
          <div
            className="absolute inset-0 rounded-full backdrop-blur-2xl transition-all duration-700"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, rgba(100,150,255,0.2) 0%, transparent 50%),
                radial-gradient(circle, rgba(150,100,255,0.1) 0%, rgba(50,50,100,0.05) 100%)
              `,
              boxShadow: isHovered
                ? `
                  inset 0 0 80px rgba(255,255,255,0.3),
                  inset 0 0 40px rgba(100,150,255,0.4),
                  0 0 100px rgba(100,150,255,0.6),
                  0 0 200px rgba(150,100,255,0.4)
                `
                : `
                  inset 0 0 60px rgba(255,255,255,0.15),
                  inset 0 0 30px rgba(100,150,255,0.2),
                  0 0 60px rgba(100,150,255,0.3),
                  0 0 120px rgba(150,100,255,0.2)
                `,
              border: '2px solid rgba(255,255,255,0.1)',
            }}
          />

          {/* Light refraction overlay (rainbow effect) */}
          <div
            className="absolute inset-0 rounded-full opacity-40 mix-blend-overlay pointer-events-none transition-opacity duration-700"
            style={{
              background: `
                conic-gradient(
                  from 0deg at 50% 50%,
                  rgba(255,0,150,0.3) 0deg,
                  rgba(0,150,255,0.3) 120deg,
                  rgba(150,255,0,0.3) 240deg,
                  rgba(255,0,150,0.3) 360deg
                )
              `,
              filter: 'blur(20px)',
              opacity: isHovered ? 0.6 : 0.3,
            }}
          />

          {/* Inner nebula cloud */}
          <div
            ref={nebulaRef}
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              maskImage: 'radial-gradient(circle, black 60%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(circle, black 60%, transparent 100%)',
            }}
          >
            <motion.div
              className="absolute inset-[-50%]"
              style={{
                background: `
                  radial-gradient(circle at 20% 80%, rgba(255,100,200,0.4) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(100,150,255,0.4) 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, rgba(255,200,100,0.3) 0%, transparent 60%)
                `,
                filter: 'blur(30px)',
              }}
              animate={{
                scale: isHovered ? 1.3 : 1,
                rotate: isHovered ? [0, 360] : 0,
              }}
              transition={{
                scale: { duration: 0.5 },
                rotate: { duration: isHovered ? 4 : 20, ease: 'linear', repeat: Infinity },
              }}
            />
          </div>

          {/* Center energy core */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(100,150,255,0.4) 50%, transparent 100%)',
              filter: 'blur(10px)',
            }}
            animate={{
              scale: isHovered ? [1, 1.3, 1] : [1, 1.1, 1],
              opacity: isHovered ? [0.8, 1, 0.8] : [0.6, 0.8, 0.6],
            }}
            transition={{
              duration: isHovered ? 1 : 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Outer energy rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-white/20 pointer-events-none"
              animate={{
                scale: [1, 1.5 + i * 0.2, 1],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>

        {/* Hint text */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <p className="font-mono text-xs text-white/40 uppercase tracking-[0.4em] mb-2">
            点亮记忆
          </p>
          <motion.p
            className="font-hand text-sm text-white/20"
            animate={{
              opacity: isHovered ? [0.2, 0.4, 0.2] : 0.2,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            Click to unleash
          </motion.p>
        </motion.div>
      </motion.div>
    </>
  )
}
