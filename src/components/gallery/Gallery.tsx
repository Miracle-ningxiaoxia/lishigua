'use client'

import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import Lightbox from './Lightbox'
import GeometricGrid from './GeometricGrid'

// Gallery data structure
export interface GalleryItem {
  id: string
  thumbnail: string
  fullImage: string
  title: string
  date: string
  description: string
}

const galleryData: GalleryItem[] = [
  {
    id: 'gallery-1',
    thumbnail: '/images/gallery/thumb-1.jpg',
    fullImage: '/images/gallery/full-1.jpg',
    title: '城市夜景',
    date: '2023.06.15',
    description: '那晚我们登上了城市的最高点，俯瞰万家灯火。这座城市见证了我们的相遇、欢笑和成长。每一盏灯光都像是一个故事，而我们的故事，就在其中闪烁。'
  },
  {
    id: 'gallery-2',
    thumbnail: '/images/gallery/thumb-2.jpg',
    fullImage: '/images/gallery/full-2.jpg',
    title: '樱花树下',
    date: '2023.04.03',
    description: '春天的樱花如期而至，我们在粉色的花海中漫步。花瓣随风飘落，落在肩上、发间，也落在了我们共同的记忆里。这一刻的美好，值得用一生去回味。'
  },
  {
    id: 'gallery-3',
    thumbnail: '/images/gallery/thumb-3.jpg',
    fullImage: '/images/gallery/full-3.jpg',
    title: '公路旅行',
    date: '2023.08.20',
    description: '一次说走就走的旅行，沿着海岸线驰骋。窗外是无尽的蓝天和大海，车里是我们的歌声和笑声。那种自由的感觉，让我们忘记了时间的存在。'
  },
  {
    id: 'gallery-4',
    thumbnail: '/images/gallery/thumb-4.jpg',
    fullImage: '/images/gallery/full-4.jpg',
    title: '咖啡馆午后',
    date: '2023.10.12',
    description: '阳光透过玻璃窗洒在桌上，咖啡的香气弥漫在空气中。我们聊着天，时间仿佛在这一刻静止。这样简单的午后，却是最珍贵的陪伴。'
  },
  {
    id: 'gallery-5',
    thumbnail: '/images/gallery/thumb-5.jpg',
    fullImage: '/images/gallery/full-5.jpg',
    title: '雪夜漫步',
    date: '2023.12.25',
    description: '平安夜的雪下得很大，我们在雪地里留下一串串脚印。雪花落在睫毛上，世界变得安静而纯净。这个冬天，因为有你，格外温暖。'
  },
  {
    id: 'gallery-6',
    thumbnail: '/images/gallery/thumb-6.jpg',
    fullImage: '/images/gallery/full-6.jpg',
    title: '书店时光',
    date: '2024.02.14',
    description: '我们在书店度过了一个下午，各自找到喜欢的书，然后坐在角落里安静地阅读。偶尔抬头交换一个微笑，这种默契，是最美的情谊。'
  }
]

export default function Gallery() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(2) // Start with middle item
  const constraintsRef = useRef<HTMLDivElement>(null)
  const dragX = useMotionValue(0)

  // Calculate which item should be active based on drag position
  const itemWidth = 400 // Approximate width of each card
  const activeIndex = useTransform(
    dragX,
    (value) => {
      const index = Math.round(-value / itemWidth) + 2
      return Math.max(0, Math.min(galleryData.length - 1, index))
    }
  )

  useEffect(() => {
    const unsubscribe = activeIndex.on('change', (latest) => {
      setCurrentIndex(latest)
    })
    return () => unsubscribe()
  }, [activeIndex])

  const handleDragEnd = () => {
    const index = Math.round(-dragX.get() / itemWidth) + 2
    const clampedIndex = Math.max(0, Math.min(galleryData.length - 1, index))
    const targetX = -(clampedIndex - 2) * itemWidth
    
    // Snap to nearest item
    dragX.set(targetX)
    setCurrentIndex(clampedIndex)
  }

  return (
    <section className="relative min-h-screen w-full bg-black py-32 md:py-40 overflow-hidden">
      {/* Gradient transition */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/50 to-transparent pointer-events-none" />

      {/* Geometric Grid Background */}
      <GeometricGrid />

      <div className="container mx-auto px-4 md:px-8 relative">
        {/* Section Title */}
        <motion.div 
          className="text-center mb-20 md:mb-32"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-3">
            瞬影
          </h2>
          <p className="font-mono text-xs md:text-sm text-neutral-500 uppercase tracking-[0.3em]">
            Garden of Flowing Light
          </p>
        </motion.div>

        {/* 3D Carousel Container */}
        <div 
          className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-visible"
          style={{ perspective: '1200px' }}
        >
          <motion.div
            ref={constraintsRef}
            drag="x"
            dragConstraints={{ left: -itemWidth * (galleryData.length - 3), right: itemWidth * 2 }}
            dragElastic={0.1}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
            onDragEnd={handleDragEnd}
            style={{ x: dragX }}
            className="flex items-center gap-8 cursor-grab active:cursor-grabbing"
          >
            {galleryData.map((item, index) => {
              const offset = index - currentIndex
              const isActive = index === currentIndex

              return (
                <motion.div
                  key={item.id}
                  layoutId={item.id}
                  className="relative flex-shrink-0"
                  style={{
                    width: '350px',
                    height: '500px',
                    willChange: 'transform',
                  }}
                  animate={{
                    scale: isActive ? 1 : 0.8,
                    rotateY: offset * -25,
                    opacity: isActive ? 1 : 0.4,
                    zIndex: isActive ? 10 : 1,
                    x: offset * 40, // Additional spacing
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  onClick={() => isActive && setSelectedItem(item)}
                  data-cursor="hover"
                >
                  <div
                    className={`relative w-full h-full rounded-3xl overflow-hidden bg-neutral-900 ${
                      isActive ? 'shadow-2xl shadow-white/10' : ''
                    }`}
                  >
                    {/* Placeholder gradient for thumbnails */}
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
                    
                    {/* Placeholder content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                        <span className="text-3xl text-white/30">{index + 1}</span>
                      </div>
                      <p className="font-hand text-xl text-white/20 mb-2">Image Placeholder</p>
                      <p className="font-mono text-xs text-white/10">{item.title}</p>
                    </div>

                    {/* Future: Replace with actual images */}
                    {/* <Image 
                      src={item.thumbnail} 
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="400px"
                      loading="lazy"
                    /> */}

                    {/* Active card glow effect */}
                    {isActive && (
                      <motion.div 
                        className="absolute inset-0 rounded-3xl border-2 border-white/20"
                        animate={{ 
                          boxShadow: [
                            '0 0 20px rgba(255,255,255,0.2)',
                            '0 0 40px rgba(255,255,255,0.3)',
                            '0 0 20px rgba(255,255,255,0.2)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Navigation Hint */}
        <motion.p 
          className="text-center mt-12 font-mono text-sm text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          拖拽或点击查看更多
        </motion.p>

        {/* Current Item Info */}
        <motion.div
          className="text-center mt-8"
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-white mb-2">
            {galleryData[currentIndex].title}
          </h3>
          <p className="font-mono text-sm text-white/40">
            {galleryData[currentIndex].date}
          </p>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <Lightbox 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
          />
        )}
      </AnimatePresence>

      {/* Gradient transition */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
    </section>
  )
}
