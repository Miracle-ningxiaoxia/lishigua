'use client'

import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import TimelineItem from './TimelineItem'

// Timeline data structure
const timelineData = [
  {
    id: 1,
    year: '2022',
    month: 'January',
    title: '初见',
    description: '那是一个普通的下午，我们在咖啡店偶然相遇。谁能想到，这次邂逅会成为一段珍贵友谊的开始。温暖的阳光透过玻璃窗洒在桌上，就像我们之间逐渐建立的信任。',
    imagePlaceholder: '咖啡店的午后阳光'
  },
  {
    id: 2,
    year: '2022',
    month: 'August',
    title: '夏日音乐节',
    description: '炎热的夏天，我们一起去看了期待已久的音乐节。人群中的欢呼、舞台上的灯光、还有我们一起唱歌的画面，这些记忆如同夏日的烟火，短暂却璀璨。',
    imagePlaceholder: '音乐节的灯光与人群'
  },
  {
    id: 3,
    year: '2023',
    month: 'March',
    title: '海边之旅',
    description: '春天的海边，微凉的海风拂过脸庞。我们光着脚在沙滩上漫步，谈论着对未来的憧憬和梦想。那天的落日格外美丽，仿佛为我们的友谊镀上了一层温柔的金色。',
    imagePlaceholder: '海边的日落与足迹'
  },
  {
    id: 4,
    year: '2023',
    month: 'December',
    title: '跨年夜的约定',
    description: '在新年的钟声即将敲响之前，我们立下了一个小小的约定：无论未来如何变化，我们都要保持联系，继续记录彼此生活中的美好瞬间。这个约定，如同夜空中的烟花，绚烂而真挚。',
    imagePlaceholder: '跨年夜的烟火'
  }
]

// Group items by year for sticky headers
const groupByYear = (data: typeof timelineData) => {
  const grouped: { [key: string]: typeof timelineData } = {}
  data.forEach(item => {
    if (!grouped[item.year]) {
      grouped[item.year] = []
    }
    grouped[item.year].push(item)
  })
  return grouped
}

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  })

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const groupedData = groupByYear(timelineData)
  const years = Object.keys(groupedData).sort()

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen w-full bg-black py-32 md:py-40 overflow-hidden"
    >
      {/* Gradient transition from Hero */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/50 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative">
        {/* Section Title */}
        <motion.div 
          className="text-center mb-24 md:mb-32"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4">
            时光轴
          </h2>
          <p className="font-hand text-2xl md:text-3xl text-neutral-400">
            Our Journey Through Time
          </p>
        </motion.div>

        {/* Timeline Line Container */}
        <div className="relative">
          {/* Background Line */}
          <div 
            ref={lineRef}
            className="absolute left-1/2 md:left-0 top-0 bottom-0 w-[2px] bg-white/10 -translate-x-1/2 md:translate-x-0"
          />
          
          {/* Animated Progress Line */}
          <motion.div 
            className="absolute left-1/2 md:left-0 top-0 w-[2px] bg-white/60 origin-top -translate-x-1/2 md:translate-x-0"
            style={{ 
              scaleY,
              height: '100%'
            }}
          />

          {/* Timeline Items */}
          <div className="relative">
            {years.map((year) => (
              <div key={year} className="relative mb-20">
                {/* Sticky Year Header */}
                <motion.div 
                  className="sticky top-24 md:top-32 z-20 mb-16 md:mb-20"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-block backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl px-6 py-3 md:px-8 md:py-4">
                    <h3 className="text-4xl md:text-5xl font-bold text-white font-mono tracking-wider">
                      {year}
                    </h3>
                  </div>
                </motion.div>

                {/* Items for this year */}
                {groupedData[year].map((item, index) => (
                  <TimelineItem
                    key={item.id}
                    {...item}
                    index={index}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* End Marker */}
        <motion.div 
          className="flex justify-center mt-20 md:mt-32"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-white/60 border-4 border-black" />
            <motion.div 
              className="absolute inset-0 rounded-full bg-white/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Bottom Text */}
        <motion.p 
          className="text-center mt-8 font-hand text-2xl text-white/30"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          未完待续...
        </motion.p>
      </div>

      {/* Gradient transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
    </section>
  )
}
