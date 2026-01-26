'use client'

import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { Home, LogOut, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

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
          {/* 用户信息卡片 - 包含头像预留位 */}
          <motion.div
            className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-xl hover:shadow-2xl transition-all duration-300 group"
            whileHover={{ scale: 1.02, borderColor: 'rgba(139, 92, 246, 0.4)' }}
            data-cursor="hover"
          >
            {/* 头像预留位 - 渐变圆形 */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {/* 头像占位图标 */}
              <User className="w-5 h-5 text-white" strokeWidth={2.5} />
              
              {/* 光环效果 */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* 未来可以替换为真实头像 */}
              {/* <img 
                src={session.user.avatar || '/default-avatar.png'} 
                alt={session.user.name}
                className="w-full h-full object-cover"
              /> */}
            </div>

            {/* 用户信息文本 */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors leading-tight">
                {session.user.name}
              </span>
              <span className="text-xs font-mono text-white/40 group-hover:text-white/60 transition-colors">
                拾光纪成员
              </span>
            </div>

            {/* 装饰性指示点 */}
            <div className="flex items-center gap-1 ml-2">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                animate={{ 
                  opacity: [1, 0.5, 1],
                  scale: [1, 0.8, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
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
