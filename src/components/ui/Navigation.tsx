'use client'

import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { Home, LogOut, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { NotificationCenter } from '@/components/social'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  
  // Don't show navigation on login page
  if (pathname === '/login') return null

  const isHomePage = pathname === '/'

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <>
      {/* 返回首页按钮 - 仅在非首页显示 */}
      {!isHomePage && (
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed top-8 left-8 z-40"
        >
          <motion.button
            onClick={() => router.push('/')}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-cursor="hover"
          >
            <Home className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
            <span className="font-mono text-sm text-white/70 group-hover:text-white transition-colors">
              返回导航
            </span>
          </motion.button>
        </motion.nav>
      )}

      {/* 用户信息卡片 - 在所有页面显示（除登录页） */}
      {session?.user && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="fixed top-8 right-8 z-40 flex items-center gap-3"
        >
          {/* 通知中心 */}
          <NotificationCenter />

          {/* 用户信息卡片 - 包含头像预留位 */}
          <motion.div
            className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-purple-400/40 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-xl hover:shadow-2xl transition-all duration-300 group"
            whileHover={{ scale: 1.02 }}
            data-cursor="hover"
          >
            {/* 头像容器 */}
            <div className="relative">
              {/* 在线状态呼吸灯 - 移到头像外层 */}
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-black z-10"
                animate={{ 
                  opacity: [1, 0.5, 1],
                  scale: [1, 0.9, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />

              <div className="relative w-10 h-10 rounded-full overflow-hidden group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-purple-900/40 to-blue-900/40">
                {session.user.avatar ? (
                  // 真实头像 - 使用 Next.js Image 优化
                  <>
                    <div className="absolute inset-0 rounded-full ring-2 ring-purple-400/50 z-10" />
                    <Image
                      src={session.user.avatar}
                      alt={session.user.name || '用户头像'}
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                      priority
                      unoptimized
                    />
                    {/* 悬停光环效果 */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                  </>
                ) : (
                  // 降级占位符 - 渐变圆形
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" strokeWidth={2.5} />
                    {/* 光环效果 */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}
              </div>
            </div>

            {/* 用户信息文本 */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors leading-tight">
                {session.user.name}
              </span>
              <span className="text-xs font-mono text-white/40 group-hover:text-white/60 transition-colors">
                时光快递驿站成员
              </span>
            </div>
          </motion.div>

          {/* 登出按钮 */}
          <motion.button
            onClick={handleSignOut}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3 hover:bg-red-500/20 hover:border-red-400/30 transition-all duration-300 group shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-cursor="hover"
            title="退出登录"
          >
            <LogOut className="w-4 h-4 text-white/70 group-hover:text-red-400 transition-colors" />
            <span className="font-mono text-sm text-white/70 group-hover:text-red-400 transition-colors">
              退出
            </span>
          </motion.button>
        </motion.div>
      )}
    </>
  )
}
