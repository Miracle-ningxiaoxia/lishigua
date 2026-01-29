'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Blurhash } from 'react-blurhash'
import Image from 'next/image'
import type { Photo } from '@/lib/supabase'

interface PhotoCardProps {
  photo: Photo
  onClick: () => void
  priority?: boolean
}

export default function PhotoCard({ photo, onClick, priority = false }: PhotoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <motion.div
      layoutId={`photo-${photo.id}`}
      className="relative group cursor-pointer rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      data-cursor="hover"
    >
      {/* BlurHash 占位符 */}
      {photo.blur_hash && !imageLoaded && (
        <div className="absolute inset-0">
          <Blurhash
            hash={photo.blur_hash}
            width="100%"
            height="100%"
            resolutionX={32}
            resolutionY={32}
            punch={1}
          />
        </div>
      )}

      {/* 实际图片 */}
      <div className="relative" style={{ aspectRatio: photo.width && photo.height ? `${photo.width}/${photo.height}` : '1' }}>
        <Image
          src={photo.url}
          alt={photo.caption || '照片'}
          fill
          className={`object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={process.env.NODE_ENV === 'development'}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageLoaded(true) // 即使失败也显示，避免一直显示 BlurHash
          }}
        />
      </div>

      {/* 悬停时的阴影和遮罩 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={false}
      >
        {/* 照片信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {photo.caption && (
            <p className="text-white text-sm line-clamp-2 mb-2">
              {photo.caption}
            </p>
          )}
          {photo.author && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-purple-400/20 to-pink-400/20 flex items-center justify-center flex-shrink-0">
                {photo.author.avatar ? (
                  <Image
                    src={photo.author.avatar}
                    alt={photo.author.name}
                    width={24}
                    height={24}
                    className="object-cover w-full h-full"
                    unoptimized={process.env.NODE_ENV === 'development'}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                ) : (
                  <svg className="w-3 h-3 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                )}
              </div>
              <p className="text-white/70 text-xs">{photo.author.name}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* 悬停时的光晕效果 */}
      <motion.div
        className="absolute inset-0 rounded-xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-300 pointer-events-none"
        style={{
          boxShadow: '0 0 20px rgba(255, 255, 255, 0)',
        }}
        whileHover={{
          boxShadow: '0 0 40px rgba(255, 255, 255, 0.2)',
        }}
      />
    </motion.div>
  )
}
