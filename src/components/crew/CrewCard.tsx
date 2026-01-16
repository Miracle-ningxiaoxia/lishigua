'use client'

import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useState, useRef } from 'react'
import Image from 'next/image'

interface CrewMember {
  id: string
  name: string
  nickname: string
  role: string
  quote: string
  avatarUrl: string
  color: string
}

interface CrewCardProps {
  member: CrewMember
  index: number
  isAnyHovered: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
}

export default function CrewCard({ 
  member, 
  index, 
  isAnyHovered, 
  onHoverStart, 
  onHoverEnd 
}: CrewCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Calculate rotation based on mouse position
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5])

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

  return (
    <motion.div
      ref={cardRef}
      className="relative group"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut" 
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
        className="relative h-[480px] w-full md:w-[280px] rounded-3xl overflow-hidden backdrop-blur-md bg-white/[0.03] border border-white/10 p-6 flex flex-col items-center"
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          opacity: isDimmed ? 0.4 : 1,
          scale: isHovered ? 1.05 : 1,
          y: isHovered ? -10 : 0,
          filter: isDimmed ? 'grayscale(0.5)' : 'grayscale(0)',
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        data-cursor="hover"
      >
        {/* Background Initial Letter */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] font-bold pointer-events-none select-none"
          style={{
            color: member.color,
            opacity: 0.05,
            zIndex: 0,
          }}
          animate={{
            opacity: isHovered ? 0.1 : 0.05,
          }}
        >
          {member.name.charAt(0)}
        </motion.div>

        {/* Accent Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${member.color}20 0%, transparent 70%)`,
          }}
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center h-full">
          {/* Avatar */}
          <motion.div
            className="relative w-32 h-32 rounded-full overflow-hidden mb-6 mt-4"
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.4 }}
          >
            {/* Breathing border */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${member.color}`,
                opacity: 0.3,
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Avatar placeholder */}
            <div 
              className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white/20"
              style={{
                background: `linear-gradient(135deg, ${member.color}30, transparent)`,
              }}
            >
              {member.name.charAt(0)}
            </div>

            {/* Future: Replace with real image */}
            {/* <Image
              src={member.avatarUrl}
              alt={member.name}
              fill
              className="object-cover"
            /> */}
          </motion.div>

          {/* Name */}
          <h3 className="text-2xl font-bold text-white mb-2 text-center">
            {member.name}
          </h3>

          {/* Nickname */}
          <p className="font-hand text-lg text-white/50 mb-4">
            "{member.nickname}"
          </p>

          {/* Role Tag */}
          <motion.div
            className="backdrop-blur-sm bg-white/5 border border-white/20 rounded-full px-4 py-2 mb-6"
            style={{
              borderColor: isHovered ? member.color : 'rgba(255,255,255,0.2)',
            }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm font-mono text-white/70">
              {member.role}
            </span>
          </motion.div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Quote (appears on hover) */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-full"
              >
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
                  <p className="font-hand text-base text-white/80 text-center leading-relaxed">
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
