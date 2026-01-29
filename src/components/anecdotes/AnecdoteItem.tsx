'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import { LikeButton, CommentButton } from '@/components/social'

export interface Anecdote {
  id: string
  type: 'video' | 'image'
  category: string
  src: string
  caption: string
  joke?: string // The inside joke
  participants: string[]
  span?: string // Grid span class (e.g., 'col-span-2', 'row-span-2')
}

interface AnecdoteItemProps {
  anecdote: Anecdote
  onClick?: () => void
  onCommentClick?: () => void
}

export default function AnecdoteItem({ anecdote, onClick, onCommentClick }: AnecdoteItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleParticipantClick = (e: React.MouseEvent, participant: string) => {
    e.stopPropagation()
    // Scroll to crew member card
    const crewSection = document.querySelector(`[data-crew="${participant}"]`)
    if (crewSection) {
      crewSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleCommentClick = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    onCommentClick?.()
  }

  return (
    <motion.div
      layout
      className={`relative group overflow-hidden rounded-3xl backdrop-blur-md bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-500 ${anecdote.span || ''}`}
      style={{ 
        minHeight: '250px',
        willChange: 'transform'
      }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      data-cursor="hover"
    >
      {/* Media Content */}
      <div className="absolute inset-0">
        {anecdote.type === 'video' ? (
          <motion.video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            animate={{
              filter: isHovered ? 'grayscale(0)' : 'grayscale(1)',
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.4 }}
          >
            <source src={anecdote.src} type="video/mp4" />
          </motion.video>
        ) : (
          <motion.div
            className="w-full h-full"
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.4 }}
          >
            {/* Placeholder for images */}
            <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl text-white/30">📸</span>
                </div>
                <p className="font-mono text-xs text-white/20">Image Placeholder</p>
                <p className="font-hand text-sm text-white/10 mt-1">{anecdote.caption}</p>
              </div>
            </div>
            {/* Future: Real image */}
            {/* <Image
              src={anecdote.src}
              alt={anecdote.caption}
              fill
              className="object-cover"
            /> */}
          </motion.div>
        )}

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Inner Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl"
        style={{
          boxShadow: 'inset 0 0 60px rgba(255,255,255,0.05)',
        }}
        animate={{
          boxShadow: isHovered 
            ? 'inset 0 0 80px rgba(255,255,255,0.1)' 
            : 'inset 0 0 60px rgba(255,255,255,0.05)',
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Joke Overlay (appears on hover) */}
      {anecdote.joke && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="font-hand text-xl md:text-2xl text-white text-center leading-relaxed">
            "{anecdote.joke}"
          </p>
        </motion.div>
      )}

      {/* Content Overlay */}
      <div className="relative z-10 p-4 md:p-6 h-full flex flex-col justify-between">
        {/* Participants (Top Right) */}
        <div className="flex justify-end">
          <motion.div
            className="backdrop-blur-xl bg-black/40 rounded-full px-3 py-1 flex flex-wrap gap-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {anecdote.participants.map((participant, index) => (
              <motion.button
                key={participant}
                className="font-mono text-[10px] text-white/60 hover:text-white transition-colors"
                onClick={(e) => handleParticipantClick(e, participant)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                @{participant}
                {index < anecdote.participants.length - 1 && <span className="ml-1">&</span>}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Caption and Actions (Bottom) */}
        <motion.div
          className="backdrop-blur-xl bg-black/40 rounded-2xl p-3 md:p-4 space-y-3"
          animate={{
            y: isHovered ? 0 : 10,
            opacity: isHovered ? 1 : 0.8,
          }}
          transition={{ duration: 0.3 }}
        >
          <p className="font-hand text-sm md:text-base text-white/90">
            {anecdote.caption}
          </p>
          
          {/* Social Actions */}
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <LikeButton 
              targetId={anecdote.id}
              targetType="anecdote"
              size="sm"
              showCount={true}
            />
            
            <CommentButton
              moduleId={`anecdote-${anecdote.id}`}
              onClick={handleCommentClick}
              size="sm"
              showCount={true}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
