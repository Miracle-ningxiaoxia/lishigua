'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'

interface TimelineItemProps {
  year: string
  month: string
  title: string
  description: string
  imagePlaceholder: string
  index: number
}

export default function TimelineItem({ 
  year, 
  month, 
  title, 
  description, 
  imagePlaceholder,
  index 
}: TimelineItemProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.6 })

  return (
    <motion.div
      ref={ref}
      className="relative flex flex-col md:flex-row gap-8 md:gap-16 items-start mb-32 md:mb-40"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Timeline Dot */}
      <motion.div 
        className="absolute left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-4 h-4 rounded-full bg-white/60 border-4 border-black z-10"
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />

      {/* Content Container */}
      <div className="w-full md:pl-12 pt-12 md:pt-0">
        {/* Date Label */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-white/40">
            {month}
          </p>
          <p className="font-sans text-6xl md:text-7xl font-bold text-white/[0.03] absolute -top-8 -left-4 md:-left-12 -z-10">
            {year}
          </p>
        </motion.div>

        {/* Glassmorphism Card */}
        <motion.div
          className="relative backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-10 overflow-hidden group hover:border-white/20 transition-colors duration-500"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Breathing glow effect on hover */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            animate={{ 
              background: [
                'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.05) 0%, transparent 50%)',
                'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.05) 0%, transparent 50%)',
                'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.05) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10">
            {/* Title */}
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              {title}
            </h3>

            {/* Description */}
            <p className="text-neutral-300 text-lg leading-relaxed mb-6">
              {description}
            </p>

            {/* Image Placeholder */}
            <motion.div
              className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden bg-neutral-900/50"
              initial={{ filter: 'blur(20px)', opacity: 0 }}
              animate={isInView ? { filter: 'blur(0px)', opacity: 1 } : { filter: 'blur(20px)', opacity: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              {/* Placeholder gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
              
              {/* Placeholder text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="font-mono text-sm text-white/30 mb-2">Image Placeholder</p>
                  <p className="font-hand text-2xl text-white/20">{imagePlaceholder}</p>
                </div>
              </div>

              {/* Future: Replace with real image */}
              {/* <Image 
                src={imageUrl} 
                alt={title}
                fill
                className="object-cover"
              /> */}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
