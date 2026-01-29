'use client'

import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import gsap from 'gsap'

interface CrewMember {
  id: string
  name: string
  nickname: string
  role: string
  quote: string
  avatarUrl: string
  color: string
  size: 'small' | 'medium' | 'large'
}

interface CrewCardProps {
  member: CrewMember
  index: number
  isAnyHovered: boolean
  isActivated?: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
  onClick?: () => void
}

export default function CrewCard({ 
  member, 
  index, 
  isAnyHovered, 
  isActivated = false,
  onHoverStart, 
  onHoverEnd,
  onClick 
}: CrewCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const auraRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Calculate rotation based on mouse position
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5])

  // GSAP Aura Animation
  useEffect(() => {
    if (!auraRef.current) return

    if (isHovered) {
      gsap.to(auraRef.current, {
        x: '+=20',
        y: '+=15',
        duration: 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    } else {
      gsap.killTweensOf(auraRef.current)
      gsap.to(auraRef.current, {
        x: 0,
        y: 0,
        duration: 0.5,
      })
    }

    return () => {
      gsap.killTweensOf(auraRef.current)
    }
  }, [isHovered])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Normalize to -0.5 to 0.5 range
    const x = (e.clientX - centerX) / rect.width
    const y = (e.clientY - centerY) / rect.height

    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const handleHoverStart = () => {
    setIsHovered(true)
    onHoverStart()
  }

  const handleHoverEnd = () => {
    setIsHovered(false)
    handleMouseLeave()
    onHoverEnd()
  }

  // Determine if card should be dimmed
  const isDimmed = isAnyHovered && !isHovered

  // Height mapping based on size (no row span needed for react-masonry-css)
  const heightClasses = {
    small: 'h-[420px]',
    medium: 'h-[480px]',
    large: 'h-[540px]',
  }

  return (
    <motion.div
      ref={cardRef}
      className="relative group"
      layoutId={`crew-card-${member.id}`}
      initial={{ 
        opacity: 0, 
        y: -30,
        scale: 0.9,
        filter: 'blur(10px)'
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        scale: 1,
        filter: 'blur(0px)'
      }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
        opacity: { duration: 0.6, delay: index * 0.12 },
        y: { 
          type: "spring",
          stiffness: 100,
          damping: 15,
          mass: 0.8
        },
        scale: { duration: 0.5, delay: index * 0.12 + 0.1 },
        filter: { duration: 0.4, delay: index * 0.12 }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleHoverEnd}
      onHoverStart={handleHoverStart}
      style={{
        perspective: '1000px',
      }}
      data-crew={member.name}
    >
      <motion.div
        className={`relative ${heightClasses[member.size]} w-full rounded-3xl overflow-hidden backdrop-blur-md bg-white/[0.02] border border-white/10 p-6 flex flex-col items-center cursor-pointer`}
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
          borderColor: isActivated ? member.color : 'rgba(255,255,255,0.1)',
          boxShadow: isActivated 
            ? `0 0 40px ${member.color}60, 0 0 80px ${member.color}30`
            : '0 0 0px transparent',
        }}
        animate={{
          opacity: isDimmed ? 0.4 : 1,
          scale: isHovered ? 1.05 : isActivated ? 1.03 : 1,
          y: isHovered ? -10 : isActivated ? -5 : 0,
          filter: isDimmed ? 'grayscale(0.5)' : 'grayscale(0)',
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={onClick}
        data-cursor="hover"
      >
        {/* Dynamic Radial Gradient Aura (replaces background text) */}
        <motion.div
          ref={auraRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none blur-3xl"
          style={{
            background: `radial-gradient(circle, ${member.color}40 0%, ${member.color}20 30%, transparent 70%)`,
            opacity: 0,
          }}
          animate={{
            opacity: isHovered || isActivated ? 0.2 : 0,
          }}
          transition={{ duration: 0.6 }}
        />

        {/* Activated Indicator */}
        <AnimatePresence>
          {isActivated && (
            <motion.div
              className="absolute top-4 right-4 z-20"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xl"
                style={{
                  background: `${member.color}90`,
                  boxShadow: `0 0 20px ${member.color}80`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="text-white text-lg">✓</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center h-full">
          {/* Avatar Circle (The Core) */}
          <motion.div
            className="relative w-36 h-36 rounded-full overflow-hidden mb-6 mt-4 bg-black/30"
            animate={{
              scale: isHovered ? 1.08 : 1,
            }}
            transition={{ duration: 0.4 }}
          >
            {/* Breathing Border with Drop Shadow */}
            <motion.div
              className="absolute inset-0 rounded-full z-10"
              style={{
                border: `1.5px solid ${member.color}`,
                filter: `drop-shadow(0 0 8px ${member.color}60)`,
              }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Avatar Image */}
            <motion.div
              className="absolute inset-0"
              animate={{
                filter: isHovered ? 'grayscale(0%)' : 'grayscale(100%)',
              }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={member.avatarUrl}
                alt={member.name}
                fill
                className="object-contain"
                sizes="144px"
                loading={index < 4 ? "eager" : "lazy"}
              />
            </motion.div>
          </motion.div>

          {/* Name with Letter Spacing */}
          <h3 className="text-2xl font-bold text-white mb-2 text-center tracking-wider">
            {member.name}
          </h3>

          {/* Nickname */}
          <p className="font-hand text-lg text-white/50 mb-4">
            &ldquo;{member.nickname}&rdquo;
          </p>

          {/* Role Tag with Letter Spacing */}
          <motion.div
            className="backdrop-blur-sm bg-white/5 border border-white/20 rounded-full px-5 py-2 mb-6"
            style={{
              borderColor: isHovered ? member.color : 'rgba(255,255,255,0.2)',
            }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm font-mono text-white/70 tracking-widest">
              {member.role}
            </span>
          </motion.div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Quote (handwritten style, appears on hover) */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-full"
              >
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="font-hand text-xs text-white/60 text-center leading-relaxed italic">
                    {member.quote}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
