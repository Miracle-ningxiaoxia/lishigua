'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { getLikeCount, toggleLike } from '@/lib/social'

interface LikeButtonProps {
  targetId: string
  targetType: 'photo' | 'anecdote' | 'comment'
  targetOwnerId?: string // 被点赞内容的作者 ID，用于创建通知
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
}

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  vx: number
  vy: number
  life: number
}

export default function LikeButton({
  targetId,
  targetType,
  targetOwnerId,
  size = 'md',
  showCount = true,
  className = '',
}: LikeButtonProps) {
  const { data: session } = useSession()
  const [likeCount, setLikeCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const particleIdRef = useRef(0)

  // 尺寸映射
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  }

  // 加载点赞状态
  useEffect(() => {
    if (!session?.user?.id) return

    const fetchLikeStatus = async () => {
      const likeData = await getLikeCount(targetId, targetType, session.user.id!)
      setLikeCount(likeData.count)
      setHasLiked(likeData.hasLiked)
    }

    fetchLikeStatus()
  }, [targetId, targetType, session?.user?.id])

  // 粒子动画更新
  useEffect(() => {
    if (particles.length === 0) return

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.5, // 重力效果
            life: p.life - 1,
          }))
          .filter((p) => p.life > 0)
      )
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [particles])

  // 创建粒子喷泉效果
  const createParticles = (x: number, y: number) => {
    const colors = ['#FF6B9D', '#FFC371', '#C850C0', '#4158D0', '#FFCC70']
    const newParticles: Particle[] = []

    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20 + Math.random() * 0.5
      const velocity = 2 + Math.random() * 3
      
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 4,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 3, // 向上喷射
        life: 60, // 1秒生命周期
      })
    }

    setParticles((prev) => [...prev, ...newParticles])
  }

  // 处理点赞
  const handleLike = async () => {
    if (!session?.user?.id || isLoading) return

    setIsLoading(true)

    // 触发粒子效果（在点赞时）
    if (!hasLiked && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      createParticles(rect.width / 2, rect.height / 2)
    }

    const result = await toggleLike(targetId, targetType, session.user.id, targetOwnerId)

    if (result.success) {
      setHasLiked(result.hasLiked)
      setLikeCount((prev) => (result.hasLiked ? prev + 1 : prev - 1))
    }

    setIsLoading(false)
  }

  if (!session?.user) return null

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      {/* 粒子容器 */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
            }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              opacity: particle.life / 60,
              scale: 1 - (60 - particle.life) / 60,
            }}
          />
        ))}
      </div>

      {/* 点赞按钮 */}
      <motion.button
        ref={buttonRef}
        onClick={handleLike}
        disabled={isLoading}
        className={`
          relative backdrop-blur-xl bg-white/5 border border-white/10 
          rounded-full flex items-center justify-center
          hover:bg-white/10 hover:border-white/20 
          transition-all duration-300 group
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${hasLiked ? 'bg-pink-500/20 border-pink-400/40' : ''}
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        data-cursor="hover"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={hasLiked ? 'liked' : 'unliked'}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <Heart
              size={iconSizes[size]}
              className={`
                transition-colors duration-300
                ${
                  hasLiked
                    ? 'fill-pink-400 text-pink-400'
                    : 'text-white/60 group-hover:text-white'
                }
              `}
            />
          </motion.div>
        </AnimatePresence>

        {/* 点赞时的呼吸光环 */}
        {hasLiked && (
          <motion.div
            className="absolute inset-0 rounded-full bg-pink-400/30"
            animate={{
              scale: [1, 1.5],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </motion.button>

      {/* 点赞数量 */}
      {showCount && likeCount > 0 && (
        <motion.span
          className="font-mono text-sm text-white/60"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          key={likeCount}
        >
          {likeCount}
        </motion.span>
      )}
    </div>
  )
}
