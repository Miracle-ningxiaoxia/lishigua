'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Letter } from './LetterEnvelope'

interface LetterViewProps {
  letter: Letter
  onClose: () => void
}

export default function LetterView({ letter, onClose }: LetterViewProps) {
  // Split content into paragraphs for staggered animation
  const paragraphs = letter.content.split('\n\n').filter(p => p.trim())

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div 
        className="absolute inset-0 backdrop-blur-2xl bg-black/95"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Close Button */}
      <motion.button
        className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center group"
        onClick={onClose}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        data-cursor="hover"
      >
        <X className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
      </motion.button>

      {/* Letter Content */}
      <motion.div
        layoutId={letter.id}
        className="relative z-10 w-full max-w-3xl max-h-[80vh] overflow-y-auto backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-12"
        onClick={(e) => e.stopPropagation()}
        style={{ willChange: 'transform' }}
      >
        {/* Header */}
        <motion.div
          className="mb-8 pb-6 border-b border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              {letter.sender}
            </h2>
            <span className="font-mono text-sm text-white/40 whitespace-nowrap mt-2">
              {letter.date}
            </span>
          </div>
          <p className="font-mono text-sm text-white/50 uppercase tracking-wider">
            A message from the past
          </p>
        </motion.div>

        {/* Content - Staggered paragraphs */}
        <div className="space-y-6">
          {paragraphs.map((paragraph, index) => (
            <motion.p
              key={index}
              className="font-hand text-xl md:text-2xl text-white/90 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.4 + index * 0.2, 
                duration: 0.8,
                ease: "easeOut" 
              }}
            >
              {paragraph}
            </motion.p>
          ))}
        </div>

        {/* Footer decoration */}
        <motion.div
          className="mt-12 pt-8 border-t border-white/10 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
