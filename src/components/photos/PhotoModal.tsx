'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X } from 'lucide-react'
import type { Photo } from '@/lib/supabase'
import { CommentButton, CommentSection, LikeButton } from '@/components/social'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface PhotoModalProps {
  photo: Photo
  onClose: () => void
}

export default function PhotoModal({ photo, onClose }: PhotoModalProps) {
  const [showComments, setShowComments] = useState(false)

  // 禁止背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <>
      <motion.div
        key={`photo-modal-${photo.id}`}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* 背景遮罩 - 玻璃拟态 */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* 内容容器 */}
        <motion.div
          layoutId={`photo-${photo.id}`}
          className="relative z-10 w-full max-w-7xl h-full max-h-[90vh] flex flex-col md:flex-row gap-0 md:gap-6 bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* 关闭按钮 */}
          <motion.button
            className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white/70 hover:text-white hover:bg-black/70 transition-all"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            data-cursor="hover"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* 左侧：图片展示区 */}
          <div className="relative flex-1 flex items-center justify-center bg-black/40 p-4 md:p-8">
            <motion.div
              className="relative w-full h-full max-h-[60vh] md:max-h-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Image
                src={photo.url}
                alt={photo.caption || '照片'}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 60vw"
                unoptimized={process.env.NODE_ENV === 'development'}
                priority
                onError={() => {}}
              />
            </motion.div>
          </div>

          {/* 右侧：信息与互动区 */}
          <motion.div
            className="w-full md:w-96 flex flex-col bg-black/40 backdrop-blur-xl border-t md:border-t-0 md:border-l border-white/10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {/* 头部：作者信息 */}
            <div className="flex items-center gap-3 p-6 border-b border-white/10">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-400/20 to-pink-400/20 flex items-center justify-center flex-shrink-0">
                {photo.author?.avatar ? (
                  <Image
                    src={photo.author.avatar}
                    alt={photo.author.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                    unoptimized={process.env.NODE_ENV === 'development'}
                    onError={(e) => {
                      // 头像加载失败时显示默认图标
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                ) : (
                  // 默认头像图标
                  <svg className="w-6 h-6 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{photo.author?.name || '未知用户'}</p>
                <p className="text-white/50 text-sm">
                  {formatDistanceToNow(new Date(photo.created_at), { addSuffix: true, locale: zhCN })}
                </p>
              </div>
            </div>

            {/* 照片描述 */}
            {photo.caption && (
              <div className="p-6 border-b border-white/10">
                <p className="text-white/90 leading-relaxed">{photo.caption}</p>
              </div>
            )}

            {/* 互动区：点赞 */}
            <div className="p-6 border-b border-white/10">
              <LikeButton targetId={photo.id} targetType="photo" />
            </div>

            {/* 评论按钮 */}
            <div className="p-6">
              <CommentButton
                moduleId={`photo-${photo.id}`}
                onClick={() => setShowComments(true)}
                size="md"
                showCount={true}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* 评论抽屉 */}
      <CommentSection
        moduleId={`photo-${photo.id}`}
        targetOwnerId={photo.author_id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  )
}
