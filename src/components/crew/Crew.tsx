'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import CrewCard from './CrewCard'

// Crew data structure
export interface CrewMember {
  id: string
  name: string
  nickname: string
  role: string
  quote: string
  avatarUrl: string
  color: string
}

const crewData: CrewMember[] = [
  {
    id: 'crew-1',
    name: 'Alex',
    nickname: 'The Visionary',
    role: '氛围担当',
    quote: '生活不只是活着，而是创造值得被铭记的瞬间。',
    avatarUrl: '/images/crew/alex.jpg',
    color: '#f43f5e', // rose-500
  },
  {
    id: 'crew-2',
    name: 'Jordan',
    nickname: 'The Architect',
    role: '技术顾问',
    quote: '每一行代码都是通往未来的桥梁，我们一起搭建。',
    avatarUrl: '/images/crew/jordan.jpg',
    color: '#0ea5e9', // sky-500
  },
  {
    id: 'crew-3',
    name: 'Sam',
    nickname: 'The Storyteller',
    role: '灵魂写手',
    quote: '故事不会结束，它们只是在等待下一个讲述者。',
    avatarUrl: '/images/crew/sam.jpg',
    color: '#8b5cf6', // violet-500
  },
  {
    id: 'crew-4',
    name: 'Taylor',
    nickname: 'The Dreamer',
    role: '创意策划',
    quote: '梦想很贵，但我们的友谊让它变得触手可及。',
    avatarUrl: '/images/crew/taylor.jpg',
    color: '#f59e0b', // amber-500
  },
]

export default function Crew() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const isAnyHovered = hoveredIndex !== null

  return (
    <section className="relative min-h-screen w-full bg-black py-32 md:py-40 overflow-hidden">
      {/* Gradient transition */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/50 to-transparent pointer-events-none" />

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
            众声
          </h2>
          <p className="font-mono text-xs md:text-sm text-neutral-500 uppercase tracking-[0.3em]">
            Friends on the Same Frequency
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {crewData.map((member, index) => (
            <CrewCard
              key={member.id}
              member={member}
              index={index}
              isAnyHovered={isAnyHovered}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
            />
          ))}
        </div>

        {/* Decorative Text */}
        <motion.p 
          className="text-center mt-20 md:mt-32 font-mono text-sm text-white/30 tracking-wider"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Together, we create memories that last forever
        </motion.p>
      </div>

      {/* Gradient transition */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
    </section>
  )
}
