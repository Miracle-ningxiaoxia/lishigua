'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Image from 'next/image'
import { Couple, CrewMember } from './crewData'

interface CoupleCardProps {
  couple: Couple
  partner1: CrewMember
  partner2: CrewMember
  onClose: () => void
}

export default function CoupleCard({ couple, partner1, partner2, onClose }: CoupleCardProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Backdrop with couple's accent color */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, ${couple.accentColor}20 0%, #00000090 100%)`,
            backdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Couple Card - flies in from partner cards */}
        <motion.div
          className="relative z-10 w-[90vw] max-w-4xl"
          initial={{ scale: 0.5, opacity: 0, y: 100 }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 200,
              damping: 25,
              mass: 0.8
            }
          }}
          exit={{ 
            scale: 0.8, 
            opacity: 0,
            transition: { duration: 0.3 }
          }}
        >
          <div className="relative aspect-[3/2] rounded-3xl overflow-hidden backdrop-blur-2xl bg-white/5 border-2 border-white/20 shadow-2xl">
            {/* Couple Image */}
            {couple.coupleImage ? (
              <Image
                src={couple.coupleImage}
                alt={`${partner1.name} & ${partner2.name}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              // Placeholder gradient
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${partner1.color}40, ${partner2.color}40)`,
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-6xl md:text-8xl font-bold text-white/20 mb-4">
                      {partner1.name.charAt(0)}{partner2.name.charAt(0)}
                    </p>
                    <p className="font-hand text-lg text-white/30">情侣合照占位</p>
                  </div>
                </div>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Dream-like blend overlay */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 30% 50%, ${partner1.color}30, transparent 50%), 
                             radial-gradient(circle at 70% 50%, ${partner2.color}30, transparent 50%)`,
                mixBlendMode: 'overlay',
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
              {/* Names */}
              <motion.div
                className="flex items-center justify-center gap-4 md:gap-8 mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="text-right">
                  <h3 className="text-3xl md:text-5xl font-bold text-white mb-1">
                    {partner1.name}
                  </h3>
                  <p className="font-hand text-lg md:text-xl text-white/70">
                    {partner1.nickname}
                  </p>
                </div>

                {/* Heart Icon */}
                <motion.div
                  className="flex-shrink-0"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div 
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center backdrop-blur-xl border-2"
                    style={{
                      background: `linear-gradient(135deg, ${partner1.color}60, ${partner2.color}60)`,
                      borderColor: couple.accentColor,
                    }}
                  >
                    <span className="text-2xl md:text-3xl">❤️</span>
                  </div>
                </motion.div>

                <div className="text-left">
                  <h3 className="text-3xl md:text-5xl font-bold text-white mb-1">
                    {partner2.name}
                  </h3>
                  <p className="font-hand text-lg md:text-xl text-white/70">
                    {partner2.nickname}
                  </p>
                </div>
              </motion.div>

              {/* Declaration */}
              <motion.div
                className="backdrop-blur-2xl bg-white/10 border border-white/30 rounded-2xl p-6 md:p-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <p className="font-hand text-xl md:text-3xl text-white text-center leading-relaxed">
                  &ldquo;{couple.declaration}&rdquo;
                </p>
              </motion.div>
            </div>

            {/* Close Button */}
            <motion.button
              className="absolute top-4 right-4 w-10 h-10 md:w-12 md:h-12 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 flex items-center justify-center group transition-colors"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              data-cursor="hover"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 text-white/70 group-hover:text-white transition-colors" />
            </motion.button>
          </div>
        </motion.div>

        {/* Hint Text */}
        <motion.p
          className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs md:text-sm text-white/40 uppercase tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          点击任意处关闭
        </motion.p>
      </motion.div>
    </AnimatePresence>
  )
}
