'use client'

import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { Home } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Don't show navigation on home page
  if (pathname === '/') return null

  return (
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
  )
}
