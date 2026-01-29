'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface MediaLoaderProps {
  // 媒体类型
  type: 'image' | 'video'
  
  // 多级分辨率 URL（按分辨率从低到高排列）
  sources: {
    thumbnail?: string // 缩略图（最低分辨率，用于骨架屏）
    low?: string       // 低分辨率
    medium?: string    // 中分辨率
    high: string       // 高分辨率（必需）
  }
  
  // 图片属性
  alt?: string
  width?: number
  height?: number
  aspectRatio?: string // 例如：'16/9', '1/1', '4/3'
  
  // 加载策略
  loadingStrategy?: 'lazy' | 'eager' // 是否懒加载
  priority?: boolean // Next.js Image priority
  
  // 样式
  className?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  rounded?: boolean
  
  // 回调
  onLoad?: () => void
  onError?: (error: Error) => void
  
  // 视频特定属性
  videoProps?: {
    autoPlay?: boolean
    loop?: boolean
    muted?: boolean
    controls?: boolean
    playsInline?: boolean
  }
}

export default function MediaLoader({
  type,
  sources,
  alt = '',
  width,
  height,
  aspectRatio = '16/9',
  loadingStrategy = 'lazy',
  priority = false,
  className = '',
  objectFit = 'cover',
  rounded = false,
  onLoad,
  onError,
  videoProps = {
    autoPlay: false,
    loop: false,
    muted: true,
    controls: true,
    playsInline: true,
  },
}: MediaLoaderProps) {
  const [currentQuality, setCurrentQuality] = useState<'skeleton' | 'thumbnail' | 'low' | 'medium' | 'high'>('skeleton')
  const [isInView, setIsInView] = useState(!loadingStrategy || loadingStrategy === 'eager')
  const [hasError, setHasError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // 懒加载逻辑：Intersection Observer
  useEffect(() => {
    if (loadingStrategy !== 'lazy' || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // 提前 50px 开始加载
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [loadingStrategy, isInView])

  // 渐进式加载：缩略图 -> 低分辨率 -> 中分辨率 -> 高分辨率
  useEffect(() => {
    if (!isInView) return

    const loadImage = (url: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new window.Image()
        img.src = url
        img.onload = () => resolve()
        img.onerror = () => reject(new Error(`Failed to load: ${url}`))
      })
    }

    const loadProgressively = async () => {
      try {
        // 1. 加载缩略图（如果有）
        if (sources.thumbnail) {
          await loadImage(sources.thumbnail)
          setCurrentQuality('thumbnail')
          await new Promise((resolve) => setTimeout(resolve, 100)) // 短暂延迟，让用户看到缩略图
        }

        // 2. 加载低分辨率（如果有）
        if (sources.low) {
          await loadImage(sources.low)
          setCurrentQuality('low')
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        // 3. 加载中分辨率（如果有）
        if (sources.medium) {
          await loadImage(sources.medium)
          setCurrentQuality('medium')
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        // 4. 加载高分辨率（必需）
        await loadImage(sources.high)
        setCurrentQuality('high')
        onLoad?.()
      } catch (error) {
        console.error('Media loading error:', error)
        setHasError(true)
        onError?.(error as Error)
      }
    }

    if (type === 'image') {
      loadProgressively()
    } else {
      // 视频直接加载高分辨率
      setCurrentQuality('high')
    }
  }, [isInView, sources, type, onLoad, onError])

  // 获取当前应该显示的 URL
  const getCurrentSource = () => {
    switch (currentQuality) {
      case 'skeleton':
        return null
      case 'thumbnail':
        return sources.thumbnail || sources.low || sources.medium || sources.high
      case 'low':
        return sources.low || sources.medium || sources.high
      case 'medium':
        return sources.medium || sources.high
      case 'high':
        return sources.high
      default:
        return sources.high
    }
  }

  const currentSource = getCurrentSource()

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${rounded ? 'rounded-lg' : ''} ${className}`}
      style={{
        aspectRatio: aspectRatio,
        width: width || '100%',
        height: height || 'auto',
      }}
    >
      {/* Skeleton 骨架屏 */}
      <AnimatePresence>
        {currentQuality === 'skeleton' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* 动画波纹效果 */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 图片渲染 */}
      {type === 'image' && currentSource && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuality}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Image
              src={currentSource}
              alt={alt}
              fill
              priority={priority}
              className={`transition-all duration-300 ${
                currentQuality === 'thumbnail' || currentQuality === 'low' ? 'blur-sm scale-105' : ''
              }`}
              style={{ objectFit }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={currentQuality !== 'high'} // 低分辨率不经过 Next.js 优化
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* 视频渲染 */}
      {type === 'video' && isInView && (
        <motion.video
          ref={videoRef}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          autoPlay={videoProps.autoPlay}
          loop={videoProps.loop}
          muted={videoProps.muted}
          controls={videoProps.controls}
          playsInline={videoProps.playsInline}
          onLoadedData={() => {
            setCurrentQuality('high')
            onLoad?.()
          }}
          onError={(e) => {
            setHasError(true)
            onError?.(new Error('Video loading failed'))
          }}
        >
          <source src={sources.high} type="video/mp4" />
          您的浏览器不支持视频播放。
        </motion.video>
      )}

      {/* 错误状态 */}
      {hasError && (
        <motion.div
          className="absolute inset-0 bg-red-900/20 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center text-white/60">
            <svg
              className="w-12 h-12 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm">加载失败</p>
          </div>
        </motion.div>
      )}

      {/* 加载进度指示器（可选） */}
      {currentQuality !== 'high' && currentQuality !== 'skeleton' && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs text-white/70 font-mono">
          {currentQuality === 'thumbnail' && '加载中...'}
          {currentQuality === 'low' && '低画质'}
          {currentQuality === 'medium' && '中画质'}
        </div>
      )}
    </div>
  )
}
