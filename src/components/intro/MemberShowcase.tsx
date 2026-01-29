'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, animate } from 'framer-motion'
import Image from 'next/image'
import { LikeButton, CommentButton, CommentSection } from '@/components/social'

interface Member {
  id: string
  name: string
  nickname: string
  quote: string
  code: string
  image: string
}

const members: Member[] = [
  {
    id: 'member-1',
    name: '陈果子',
    nickname: '少爷',
    quote: '王睿娃又在躲酒！！！',
    code: 'chenguozi',
    image: '/images/crew/intro/cgz.jpg'
  },
  {
    id: 'member-2',
    name: '范大爷',
    nickname: '饭大爷',
    quote: '现役武警！哪个躲酒抓哪个',
    code: 'fandaye',
    image: '/images/crew/intro/fk.jpg'
  },
  {
    id: 'member-3',
    name: '范小车',
    nickname: '睡王',
    quote: '等一哈倒酒，我先睡哈多',
    code: 'fanxiaoche',
    image: '/images/crew/intro/fxj.jpg'
  },
  {
    id: 'member-4',
    name: '蓉姐',
    nickname: '豆豆',
    quote: '陈登睿是瓜皮',
    code: 'rongjie',
    image: '/images/crew/intro/ljr.jpg'
  },
  {
    id: 'member-5',
    name: '李果子',
    nickname: '李事瓜 ',
    quote: '我这人没别的优点，就是能喝',
    code: 'liguozi',
    image: '/images/crew/intro/lqw.jpg'
  },
  {
    id: 'member-6',
    name: '王睿娃',
    nickname: '吐王 ',
    quote: '全市的ktv洗手池我李睿承包了！',
    code: 'wangruiwa',
    image: '/images/crew/intro/lr.jpg'
  },
  {
    id: 'member-7',
    name: '小霞',
    nickname: '宁老师 ',
    quote: '我作证，王睿是吐王',
    code: 'xiaoxia',
    image: '/images/crew/intro/nxx.jpg'
  },
  {
    id: 'member-8',
    name: '邱雪晶',
    nickname: '小邱 ',
    quote: '李清文最帅',
    code: 'qiuxuejing',
    image: '/images/crew/intro/qxj.jpg'
  },
  {
    id: 'member-9',
    name: '王燕',
    nickname: '王燕 ',
    quote: '你们就说我烤的烧烤好吃不',
    code: 'wangyan',
    image: '/images/crew/intro/sdx.jpg'
  },
  {
    id: 'member-10',
    name: '舒兴友',
    nickname: '舒老板 ',
    quote: '请叫我露营大王！',
    code: 'shuxingyou',
    image: '/images/crew/intro/sxy.jpg'
  },
  {
    id: 'member-11',
    name: '唐蛋',
    nickname: '蛋蛋 ',
    quote: '恕我直言，在座的各位都是垃圾',
    code: 'tangdan',
    image: '/images/crew/intro/trd.jpg'
  },
  {
    id: 'member-12',
    name: '王老师',
    nickname: '王老师 ',
    quote: '你们真的是我带的最差的一届',
    code: 'wanglaoshi',
    image: '/images/crew/intro/wls.jpg'
  },
  {
    id: 'member-13',
    name: '佳姐',
    nickname: '佳姐 ',
    quote: '把唐蛋喝翻再来找我喝酒哈',
    code: 'jiajie',
    image: '/images/crew/intro/zyj.jpg'
  },
  {
    id: 'member-14',
    name: '袁老师',
    nickname: '袁老师 ',
    quote: '大家好，我是袁老师，我教范小车怎么喝酒不睡觉',
    code: 'yuanlaoshi',
    image: '/images/crew/intro/fxjdx.jpg'
  },
]

export default function MemberShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const isScrollingRef = useRef(false)
  const [commentMemberId, setCommentMemberId] = useState<string | null>(null)

  // Track scroll position to update progress indicator
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const cardWidth = container.offsetWidth
      const index = Math.round(scrollLeft / cardWidth)
      setCurrentIndex(index)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Convert mouse wheel vertical scroll to horizontal scroll with Framer Motion animation
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // Only convert vertical scroll (deltaY) to horizontal
      // Keep native horizontal scroll from trackpad (deltaX)
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()

        // Throttle: prevent scroll spam
        if (isScrollingRef.current) return
        isScrollingRef.current = true

        // Calculate current card index
        const cardWidth = container.offsetWidth
        const currentScrollLeft = container.scrollLeft
        const currentCard = Math.round(currentScrollLeft / cardWidth)

        // Determine target card (next or previous)
        const direction = e.deltaY > 0 ? 1 : -1
        const targetCard = Math.max(0, Math.min(members.length - 1, currentCard + direction))
        const targetPosition = targetCard * cardWidth

        // Animate scroll position with Framer Motion for ultra-smooth transition
        animate(currentScrollLeft, targetPosition, {
          type: "spring",
          stiffness: 120,
          damping: 20,
          mass: 0.8,
          onUpdate: (latest) => {
            container.scrollLeft = latest
          },
          onComplete: () => {
            isScrollingRef.current = false
          }
        })
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <div className="relative h-screen w-full bg-black">
      {/* Native horizontal scroll container with CSS Scroll Snap */}
      <div
        ref={containerRef}
        className="h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory"
        style={{
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Hide scrollbar for webkit browsers */}
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Horizontal cards flex container */}
        <div className="flex h-full">
          {members.map((member, index) => (
            <div
              key={member.id}
              className="relative flex-shrink-0 w-screen h-full flex items-center justify-center snap-center snap-always"
            >
              {/* Background code text */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.05, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: false, amount: 0.3, margin: "-20%" }}
                style={{ filter: 'blur(0px)' }}
              >
                <p className="text-[20vw] font-bold select-none" style={{ color: 'rgba(255, 255, 255, 1)' }}>
                  {member.code}
                </p>
              </motion.div>

              {/* Card content */}
              <motion.div
                className="relative z-10 max-w-5xl w-full mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center gap-8 md:gap-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.3, margin: "-20%" }}
              >
                {/* Image */}
                <div className="w-full md:w-1/2 aspect-[3/4] rounded-3xl overflow-hidden backdrop-blur-md bg-black/30 border border-white/10 relative">
                  <Image 
                    src={member.image} 
                    alt={member.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index < 3}
                  />
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Info */}
                <div className="w-full md:w-1/2 space-y-6">
                  <div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                      {member.name}
                    </h2>
                    <p className="font-hand text-xl md:text-2xl text-white/50">
                      {member.nickname}
                    </p>
                  </div>

                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="font-hand text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed">
                      &ldquo;{member.quote}&rdquo;
                    </p>
                  </div>

                  {/* 社交互动按钮 */}
                  <div className="flex items-center gap-4 pt-2">
                    <LikeButton 
                      targetId={member.id}
                      targetType="photo"
                      size="md"
                      showCount={true}
                    />
                    
                    <CommentButton
                      moduleId={`intro-member-${member.id}`}
                      onClick={() => setCommentMemberId(member.id)}
                      size="md"
                      showCount={true}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* 评论抽屉 */}
      {commentMemberId && (
        <CommentSection 
          moduleId={`intro-member-${commentMemberId}`}
          isOpen={!!commentMemberId}
          onClose={() => setCommentMemberId(null)}
        />
      )}

      {/* Progress indicator - fixed at bottom center */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {members.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'w-12 bg-white/60' : 'w-8 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Scroll hint (bottom) */}
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-white/30"
          >
            ←
          </motion.div>
          <p className="font-mono text-xs text-white/30 uppercase tracking-[0.3em]">
            横向滚动查看
          </p>
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-white/30"
          >
            →
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
