'use client'

import { motion } from 'framer-motion'

interface LoadingScreenProps {
  text?: string
}

export default function LoadingScreen({ text = 'Loading...' }: LoadingScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <motion.div
          className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
        />
        <motion.p
          className="text-white/60 font-mono text-sm uppercase tracking-wider"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      </div>
    </motion.div>
  )
}
