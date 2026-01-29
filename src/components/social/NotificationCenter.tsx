'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Heart, MessageCircle, Reply, Check, CheckCheck, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
} from '@/lib/social'
import type { Notification } from '@/types/social'

export default function NotificationCenter() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [showNewBadge, setShowNewBadge] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 加载通知
  useEffect(() => {
    if (!session?.user?.id) return

    const fetchNotifications = async () => {
      const [notifs, count] = await Promise.all([
        getNotifications(session.user.id!),
        getUnreadCount(session.user.id!),
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    }

    fetchNotifications()

    // 订阅实时通知
    const subscription = subscribeToNotifications(session.user.id, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev])
      setUnreadCount((prev) => prev + 1)
      setShowNewBadge(true)

      // 3秒后隐藏新消息徽章
      setTimeout(() => setShowNewBadge(false), 3000)

      // 播放通知音效（可选）
      try {
        const audio = new Audio('/audio/notification.mp3')
        audio.volume = 0.5
        audio.play().catch(() => {
          // 忽略播放失败
        })
      } catch (e) {
        // 忽略音效错误
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [session?.user?.id])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // 标记单个通知为已读
  const handleMarkAsRead = async (notificationId: string) => {
    const success = await markNotificationAsRead(notificationId)
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  // 标记全部为已读
  const handleMarkAllAsRead = async () => {
    if (!session?.user?.id) return

    const success = await markAllNotificationsAsRead(session.user.id)
    if (success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    }
  }

  // 切换下拉菜单
  const toggleDropdown = () => {
    setIsOpen(!isOpen)
    setShowNewBadge(false)
  }

  if (!session?.user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 铃铛按钮 */}
      <motion.button
        onClick={toggleDropdown}
        className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-cursor="hover"
      >
        <div className="relative">
          <Bell
            className={`w-5 h-5 transition-colors ${
              unreadCount > 0
                ? 'text-yellow-400 group-hover:text-yellow-300'
                : 'text-white/70 group-hover:text-white'
            }`}
          />

          {/* 未读数量徽章 */}
          {unreadCount > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <span className="text-[10px] font-bold text-white leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </motion.div>
          )}

          {/* 呼吸灯效果 */}
          {unreadCount > 0 && (
            <motion.div
              className="absolute inset-0 rounded-full bg-yellow-400"
              animate={{
                opacity: [0.3, 0, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}

          {/* 新消息闪烁 */}
          {showNewBadge && (
            <motion.div
              className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-green-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: 6,
              }}
            />
          )}
        </div>
      </motion.button>

      {/* 通知下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full right-0 mt-3 w-[380px] max-h-[600px] backdrop-blur-2xl bg-black/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-white/70" />
                <h3 className="text-sm font-semibold text-white">通知</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-white/40 font-mono">({unreadCount} 条未读)</span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  data-cursor="hover"
                >
                  <CheckCheck className="w-3 h-3" />
                  全部已读
                </button>
              )}
            </div>

            {/* 通知列表 */}
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Bell className="w-12 h-12 text-white/10 mb-3" />
                  <p className="text-sm text-white/40">暂无通知</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 通知项组件
function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
}) {
  const formattedTime = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: zhCN,
  })

  // 获取通知图标
  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-400" />
      case 'reply':
        return <Reply className="w-4 h-4 text-purple-400" />
      default:
        return <Bell className="w-4 h-4 text-white/40" />
    }
  }

  // 获取通知背景色
  const getBgColor = () => {
    if (notification.is_read) {
      return 'hover:bg-white/5'
    }
    return 'bg-white/5 hover:bg-white/10'
  }

  return (
    <motion.div
      className={`p-4 ${getBgColor()} transition-colors cursor-pointer group`}
      onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
      whileHover={{ x: 4 }}
      data-cursor="hover"
    >
      <div className="flex gap-3">
        {/* 触发者头像 */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-900/40 to-blue-900/40 ring-2 ring-white/10">
            {notification.actor?.avatar ? (
              <Image
                src={notification.actor.avatar}
                alt={notification.actor.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/60 text-sm font-medium">
                {notification.actor?.name?.[0]}
              </div>
            )}
          </div>
        </div>

        {/* 通知内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 leading-relaxed">
                <span className="font-medium text-white">{notification.actor?.name}</span>{' '}
                {notification.content}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-white/30 font-mono">{formattedTime}</span>

            {!notification.is_read && (
              <motion.div
                className="flex items-center gap-1 text-xs text-blue-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Check className="w-3 h-3" />
                <span className="group-hover:inline hidden">标记已读</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
