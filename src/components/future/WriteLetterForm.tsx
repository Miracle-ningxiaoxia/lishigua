'use client'

import { motion } from 'framer-motion'
import { X, Send } from 'lucide-react'
import { useState } from 'react'
import type { Letter } from './LetterEnvelope'

interface WriteLetterFormProps {
  onClose: () => void
  onSubmit: (letter: Omit<Letter, 'id'>) => void
}

export default function WriteLetterForm({ onClose, onSubmit }: WriteLetterFormProps) {
  const [sender, setSender] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sender.trim() || !content.trim()) return

    setIsSubmitting(true)

    // Simulate sending animation delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const now = new Date()
    const date = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })

    onSubmit({
      sender: sender.trim(),
      content: content.trim(),
      date,
    })

    // Close after submission animation
    setTimeout(onClose, 500)
  }

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
        className="absolute inset-0 backdrop-blur-2xl bg-black/90"
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
        type="button"
      >
        <X className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
      </motion.button>

      {/* Form Container */}
      <motion.div
        className="relative z-10 w-full max-w-2xl backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-12"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: isSubmitting ? 0.5 : 1, y: 0, opacity: isSubmitting ? 0 : 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
            写给未来的信
          </h2>
          <p className="font-hand text-xl text-white/50">
            Leave a whisper in time...
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <label className="block font-mono text-sm text-white/50 uppercase tracking-wider mb-3">
              Your Name
            </label>
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Anonymous Traveler"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors font-sans text-lg"
              maxLength={50}
              required
            />
          </motion.div>

          {/* Content Textarea */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <label className="block font-mono text-sm text-white/50 uppercase tracking-wider mb-3">
              The Whisper
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Dear future self, or whoever finds this message..."
              className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors font-hand text-xl resize-none"
              maxLength={500}
              required
            />
            <p className="mt-2 font-mono text-xs text-white/30 text-right">
              {content.length} / 500
            </p>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 rounded-2xl px-8 py-4 flex items-center justify-center gap-3 group transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            data-cursor="hover"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="font-mono text-sm uppercase tracking-wider text-white/70">
                  Sending...
                </span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                <span className="font-mono text-sm uppercase tracking-wider text-white/70 group-hover:text-white transition-colors">
                  Seal and Send
                </span>
              </>
            )}
          </motion.button>
        </form>

        {/* Light particle effect when submitting */}
        {isSubmitting && (
          <motion.div
            className="absolute inset-0 rounded-3xl bg-white/20"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        )}
      </motion.div>
    </motion.div>
  )
}
