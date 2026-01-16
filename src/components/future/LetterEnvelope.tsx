'use client'

import { motion } from 'framer-motion'

export interface Letter {
  id: string
  sender: string
  content: string
  date: string
}

interface LetterEnvelopeProps {
  letter: Letter
  index: number
  onClick: () => void
}

export default function LetterEnvelope({ letter, index, onClick }: LetterEnvelopeProps) {
  // Random floating animation parameters
  const floatingDuration = 3 + Math.random() * 2
  const floatingY = 10 + Math.random() * 20
  const floatingDelay = index * 0.3

  return (
    <motion.div
      layoutId={letter.id}
      className="relative w-64 h-40 backdrop-blur-md bg-white/[0.05] border border-white/10 rounded-2xl p-6 cursor-pointer group hover:bg-white/[0.08] transition-colors overflow-hidden"
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: [0, -floatingY, 0] 
      }}
      transition={{
        opacity: { duration: 0.6, delay: floatingDelay },
        scale: { duration: 0.6, delay: floatingDelay },
        y: {
          duration: floatingDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatingDelay,
        }
      }}
      whileHover={{ 
        scale: 1.05,
        borderColor: 'rgba(255,255,255,0.3)',
      }}
      onClick={onClick}
      data-cursor="open"
      style={{ willChange: 'transform' }}
    >
      {/* Envelope seal decoration */}
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/20 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-white/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <p className="font-mono text-xs text-white/40 uppercase tracking-wider mb-2">
            From
          </p>
          <h3 className="text-xl font-bold text-white/80 group-hover:text-white transition-colors">
            {letter.sender}
          </h3>
        </div>

        <p className="font-mono text-xs text-white/30">
          {letter.date}
        </p>
      </div>

      {/* Hover glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ willChange: 'opacity' }}
      />
    </motion.div>
  )
}
