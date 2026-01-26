'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import ParticleBackground from '@/components/ui/ParticleBackground'
import { useApp } from '@/components/providers/AppProvider'

interface MenuItem {
  id: string
  title: string
  chinese: string
  subtitle: string
  route: string
  previewImage?: string
  color: string
}

const menuItems: MenuItem[] = [
  {
    id: 'intro',
    title: 'Introduction',
    chinese: '启',
    subtitle: '时间之锚，故事之始',
    route: '/intro',
    previewImage: '/images/crew/intro/couple-4.jpg',
    color: '#8B5CF6', // purple
  },
  {
    id: 'crew',
    title: 'The Crew',
    chinese: '众',
    subtitle: '群星汇聚，温暖如初',
    route: '/crew',
    previewImage: '/images/crew/couples/couple-1.jpg',
    color: '#EC4899', // pink
  },
  {
    id: 'vault',
    title: 'The Vault',
    chinese: '境',
    subtitle: '未来的回音，此刻的期许',
    route: '/vault',
    previewImage: '/images/crew/intro/cgz.jpg',
    color: '#06B6D4', // cyan
  },
  {
    id: 'footprints',
    title: 'Footprints',
    chinese: '迹',
    subtitle: '走过的每一个地方',
    route: '/footprints',
    previewImage: '/images/crew/intro/couple-5.jpg',
    color: '#F59E0B', // amber
  },
]

export default function HomePage() {
  const router = useRouter()
  const { musicPlayerRef } = useApp()
  const [hoveredItem, setHoveredItem] = useState<MenuItem | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const titleRefs = useRef<(HTMLDivElement | null)[]>([])
  const previewRef = useRef<HTMLDivElement>(null)

  // Start music ONLY on first visit to homepage (not on returns from sub-pages)
  useEffect(() => {
    const hasAutoPlayed = sessionStorage.getItem('hasAutoPlayedMusic')
    
    // Only auto-play once per session, and only if not already playing
    if (!hasAutoPlayed) {
      const timer = setTimeout(() => {
        if (musicPlayerRef?.current && !musicPlayerRef.current.isPlaying()) {
          console.log('First visit to homepage - auto-starting music')
          musicPlayerRef.current.startMusic()
          sessionStorage.setItem('hasAutoPlayedMusic', 'true')
        }
      }, 1000)

      return () => clearTimeout(timer)
    } else {
      console.log('Returning to homepage - respecting user preference')
    }
  }, [musicPlayerRef])

  // Magnetic effect for menu items
  useEffect(() => {
    const handleMouseMove = (index: number) => (e: MouseEvent) => {
      const element = titleRefs.current[index]
      if (!element) return

      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      // Apply magnetic pull effect
      gsap.to(element, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.6,
        ease: 'power2.out',
      })
    }

    const handleMouseLeave = (index: number) => () => {
      const element = titleRefs.current[index]
      if (!element) return

      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.3)',
      })
    }

    const listeners: { element: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }[] = []

    titleRefs.current.forEach((element, index) => {
      if (element) {
        const moveHandler = handleMouseMove(index)
        const leaveHandler = handleMouseLeave(index)

        element.addEventListener('mousemove', moveHandler)
        element.addEventListener('mouseleave', leaveHandler)

        listeners.push({ element, move: moveHandler, leave: leaveHandler })
      }
    })

    return () => {
      listeners.forEach(({ element, move, leave }) => {
        element.removeEventListener('mousemove', move)
        element.removeEventListener('mouseleave', leave)
      })
    }
  }, [])

  // Handle navigation with transition
  const handleNavigate = (item: MenuItem) => {
    if (item.route === '#') return

    setIsNavigating(true)
    
    // Simple fade out and navigate
    setTimeout(() => {
      router.push(item.route)
    }, 300)
  }

  // Preview image animation
  useEffect(() => {
    if (hoveredItem && previewRef.current) {
      gsap.fromTo(
        previewRef.current,
        {
          scale: 0.8,
          opacity: 0,
          filter: 'blur(20px)',
        },
        {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power3.out',
        }
      )
    }
  }, [hoveredItem])

  return (
    <main className="relative w-full min-h-screen overflow-hidden">
      <ParticleBackground />

      {/* Main Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-10"
      >
        <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-white/40 mb-2">
          Memory Archive
        </h1>
        <h2 className="text-4xl md:text-5xl font-light text-white/90 tracking-wider">
          拾光纪
        </h2>
      </motion.div>

      {/* Navigation Menu */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full max-w-4xl px-8">
          {/* Menu Items */}
          <div className="space-y-8 md:space-y-12">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                ref={(el) => {
                  titleRefs.current[index] = el
                }}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 + index * 0.15 }}
                className={`relative cursor-pointer group ${
                  index % 2 === 0 ? 'text-left pl-0 md:pl-12' : 'text-right pr-0 md:pr-12'
                }`}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleNavigate(item)}
                data-cursor="hover"
              >
                {/* Chinese Character */}
                <div className="relative inline-block">
                  <motion.div
                    className="absolute -inset-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle, ${item.color}40 0%, transparent 70%)`,
                    }}
                  />
                  
                  <h3
                    className="relative text-7xl md:text-8xl lg:text-9xl font-light text-white/90 tracking-wider transition-all duration-500 group-hover:text-white"
                    style={{
                      textShadow: hoveredItem?.id === item.id 
                        ? `0 0 30px ${item.color}80, 0 0 60px ${item.color}40`
                        : 'none',
                    }}
                  >
                    {item.chinese}
                  </h3>
                </div>

                {/* English Title & Subtitle */}
                <motion.div
                  className={`mt-2 ${index % 2 === 0 ? 'text-left' : 'text-right'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.15 }}
                >
                  <p className="font-mono text-sm uppercase tracking-[0.2em] text-white/50 group-hover:text-white/80 transition-colors duration-300">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-white/30 group-hover:text-white/60 transition-colors duration-300">
                    {item.subtitle}
                  </p>
                </motion.div>

                {/* Decorative Line */}
                <motion.div
                  className={`absolute top-1/2 ${
                    index % 2 === 0 ? '-right-8' : '-left-8'
                  } w-6 h-[1px] bg-gradient-to-${
                    index % 2 === 0 ? 'r' : 'l'
                  } from-white/0 via-white/30 to-white/0 origin-${
                    index % 2 === 0 ? 'left' : 'right'
                  }`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.8 + index * 0.15 }}
                />

                {/* Coming Soon Badge for Footprints */}
                {item.route === '#' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.15 }}
                    className="absolute -top-4 right-0 md:right-auto md:left-0"
                  >
                    <span className="inline-block px-3 py-1 text-[10px] font-mono uppercase tracking-wider bg-white/10 border border-white/20 rounded-full text-white/50 backdrop-blur-sm">
                      Coming Soon
                    </span>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Image (Center) */}
      <AnimatePresence>
        {hoveredItem && hoveredItem.previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
          >
            <div
              ref={previewRef}
              className="relative w-64 h-64 md:w-96 md:h-96 rounded-full overflow-hidden"
              style={{
                boxShadow: `0 0 100px 40px ${hoveredItem.color}30`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/60" />
              <img
                src={hoveredItem.previewImage}
                alt={hoveredItem.title}
                className="w-full h-full object-cover opacity-40"
              />
              
              {/* Light ring effect */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 opacity-40"
                style={{ borderColor: hoveredItem.color }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.2, 0.4],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
      >
        <p className="font-mono text-xs text-white/20 uppercase tracking-[0.3em]">
          Navigate the echoes of friendship
        </p>
      </motion.div>

      {/* Overlay during navigation */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </main>
  )
}
