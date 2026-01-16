'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Image from 'next/image'

interface GalleryItem {
  id: string
  thumbnail: string
  fullImage: string
  title: string
  date: string
  description: string
}

interface LightboxProps {
  item: GalleryItem | null
  onClose: () => void
}

export default function Lightbox({ item, onClose }: LightboxProps) {
  if (!item) return null

  return (
    <AnimatePresence>
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
          className="absolute inset-0 backdrop-blur-xl bg-black/90"
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

        {/* Content Container */}
        <motion.div 
          className="relative z-10 w-full max-w-6xl"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Image with Shared Layout */}
          <motion.div
            layoutId={item.id}
            className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden mb-6 bg-neutral-900"
            style={{ willChange: 'transform' }}
          >
            <Image
              src={item.fullImage}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              priority
              quality={95}
            />
          </motion.div>

          {/* Details */}
          <motion.div
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                {item.title}
              </h3>
              <span className="font-mono text-sm text-white/40 whitespace-nowrap">
                {item.date}
              </span>
            </div>
            <p className="text-neutral-300 text-base md:text-lg leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
