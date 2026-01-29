'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Masonry from 'react-masonry-css'
import { Upload } from 'lucide-react'
import { getPhotos } from '@/lib/photos'
import type { Photo } from '@/lib/supabase'
import PhotoCard from '@/components/photos/PhotoCard'
import PhotoModal from '@/components/photos/PhotoModal'
import PhotoUploader from '@/components/photos/PhotoUploader'
import ParticleBackground from '@/components/ui/ParticleBackground'

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [showUploader, setShowUploader] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  // 加载照片
  const loadPhotos = async (pageNum: number, reset: boolean = false) => {
    setIsLoading(true)
    const newPhotos = await getPhotos(20, pageNum * 20)
    
    if (newPhotos.length < 20) {
      setHasMore(false)
    } else {
      setHasMore(true)
    }

    if (pageNum === 0 || reset) {
      setPhotos(newPhotos)
    } else {
      setPhotos((prev) => [...prev, ...newPhotos])
    }
    
    setIsLoading(false)
  }

  // 上传完成后刷新列表（不关闭窗口，由 PhotoUploader 控制）
  const handleUploadComplete = () => {
    setPage(0)
    setHasMore(true)
    loadPhotos(0, true)
  }

  useEffect(() => {
    loadPhotos(0)
  }, [])

  // 滚动加载更多
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !isLoading &&
        hasMore
      ) {
        setPage((prev) => prev + 1)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLoading, hasMore])

  useEffect(() => {
    if (page > 0) {
      loadPhotos(page)
    }
  }, [page])

  // 瀑布流断点配置
  const breakpointColumns = {
    default: 4,
    1280: 3,
    1024: 3,
    768: 2,
    640: 1,
  }

  return (
    <main className="relative min-h-screen w-full bg-black">
      {/* 星空背景 */}
      <ParticleBackground />

      {/* 顶部渐变过渡 */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/50 to-transparent pointer-events-none z-10" />

      <div className="relative container mx-auto px-4 md:px-8 py-20 md:py-32">
        {/* 标题区 */}
        <motion.div
          className="text-center mb-12 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-3">
            光影存证
          </h1>
          <p className="font-mono text-xs md:text-sm text-neutral-500 uppercase tracking-[0.3em]">
            Captured Moments
          </p>
          <p className="mt-4 text-white/60 text-sm md:text-base max-w-2xl mx-auto">
            那些被定格的瞬间，成为了永恒的记忆
          </p>

          {/* 上传按钮 */}
          <motion.button
            onClick={() => setShowUploader(true)}
            className="mt-8 inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-xl hover:shadow-2xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-cursor="hover"
          >
            <Upload className="w-5 h-5" />
            <span>上传照片</span>
          </motion.button>
        </motion.div>

        {/* 瀑布流照片墙 */}
        {photos.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex -ml-4 md:-ml-6 w-auto"
              columnClassName="pl-4 md:pl-6 bg-clip-padding"
            >
              {photos.map((photo, index) => (
                <div key={photo.id} className="mb-4 md:mb-6">
                  <PhotoCard
                    photo={photo}
                    onClick={() => setSelectedPhoto(photo)}
                    priority={index < 6}
                  />
                </div>
              ))}
            </Masonry>
          </motion.div>
        ) : !isLoading ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-white/60 text-lg mb-2">还没有照片</p>
            <p className="text-white/40 text-sm">上传第一张照片，开启记忆之旅</p>
          </motion.div>
        ) : null}

        {/* 加载状态 */}
        {isLoading && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-white/70 text-sm">加载中...</span>
            </div>
          </motion.div>
        )}

        {/* 没有更多提示 */}
        {!hasMore && photos.length > 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/40 text-sm">已加载全部照片</p>
          </motion.div>
        )}
      </div>

      {/* 底部渐变过渡 */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none z-10" />

      {/* 照片详情弹窗 */}
      <AnimatePresence mode="wait">
        {selectedPhoto && (
          <PhotoModal
            key={`modal-${selectedPhoto.id}`}
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
          />
        )}
      </AnimatePresence>

      {/* 上传组件 */}
      <AnimatePresence mode="wait">
        {showUploader && (
          <PhotoUploader
            key="photo-uploader"
            onUploadComplete={handleUploadComplete}
            onClose={() => setShowUploader(false)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
