'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { getCommentCount, subscribeToComments } from '@/lib/social'

interface CommentButtonProps {
  moduleId: string
  onClick: (e?: React.MouseEvent) => void
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
}

export default function CommentButton({
  moduleId,
  onClick,
  size = 'md',
  showCount = true,
  className = '',
}: CommentButtonProps) {
  const { data: session } = useSession()
  const [commentCount, setCommentCount] = useState(0)
  const [prevCount, setPrevCount] = useState(0)

  // 使用 Spring 动画实现平滑的数字变化
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    mass: 0.8,
  })

  const displayCount = useTransform(spring, (value) => Math.round(value))

  // 使用 ref 标记订阅状态，防止重复订阅
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

  // 尺寸映射
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  }

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  }

  // 加载评论数量
  useEffect(() => {
    const fetchCommentCount = async () => {
      const count = await getCommentCount(moduleId)
      setCommentCount(count)
      setPrevCount(count)
      spring.set(count)
    }

    fetchCommentCount()
  }, [moduleId, spring])

  // 订阅实时评论变化 - INSERT 和 DELETE 都会触发计数更新
  // 防止重复订阅，确保组件卸载时清理
  useEffect(() => {
    if (!moduleId) return

    // 清理之前的订阅（如果存在）
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      subscriptionRef.current = null
    }

    const subscription = subscribeToComments(moduleId, {
      onInsert: () => {
        // INSERT 事件：评论数量 +1（INSERT 事件有 filter，保证是正确的 moduleId）
        setCommentCount((prev) => {
          const newCount = prev + 1
          setPrevCount(prev)
          spring.set(newCount)
          return newCount
        })
      },
      onDelete: async () => {
        // DELETE 事件：由于可能无法确认 module_id，我们重新查询计数（更安全）
        const newCount = await getCommentCount(moduleId)
        setCommentCount((prev) => {
          setPrevCount(prev)
          spring.set(newCount)
          return newCount
        })
      },
    })

    subscriptionRef.current = subscription

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [moduleId, spring])

  // 当数量变化时触发 spring 动画
  useEffect(() => {
    spring.set(commentCount)
  }, [commentCount, spring])

  if (!session?.user) return null

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      {/* 评论按钮 */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation()
          onClick(e)
        }}
        className={`
          backdrop-blur-xl bg-white/5 border border-white/10 
          rounded-full flex items-center gap-2
          hover:bg-white/10 hover:border-white/20 
          transition-all duration-300 group
          ${sizeClasses[size]}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-cursor="hover"
      >
        <MessageCircle
          size={iconSizes[size]}
          className="text-white/60 group-hover:text-white transition-colors"
        />
        <span className="text-white/60 group-hover:text-white transition-colors">
          评论
        </span>

        {/* 评论数量 - 数字滚动动画 */}
        {showCount && commentCount > 0 && (
          <motion.div
            className="relative flex items-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            {/* 数字增加时的光环效果 */}
            <AnimatePresence>
              {commentCount > prevCount && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-blue-400/30"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              )}
            </AnimatePresence>

            {/* 数字显示 */}
            <motion.span
              className="font-mono text-white/60 group-hover:text-white transition-colors relative z-10 min-w-[1.5em] text-center"
              key={commentCount}
            >
              <motion.span
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {commentCount}
              </motion.span>
            </motion.span>
          </motion.div>
        )}
      </motion.button>
    </div>
  )
}
