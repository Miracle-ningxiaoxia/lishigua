'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import AnecdoteItem, { Anecdote } from './AnecdoteItem'

// Anecdotes data
const anecdotesData: Anecdote[] = [
  {
    id: 'anec-1',
    type: 'video',
    category: 'drinking',
    src: '/videos/anecdotes/drinking-1.mp4',
    caption: 'A又被B灌醉了，第N次发誓再也不喝',
    joke: '说好的只喝一杯呢？',
    participants: ['Alex', 'Jordan'],
    span: 'col-span-2 row-span-2'
  },
  {
    id: 'anec-2',
    type: 'image',
    category: 'mahjong',
    src: '/images/anecdotes/mahjong-1.jpg',
    caption: '通宵搓麻，C自摸了一整夜',
    joke: '你们确定没让我？',
    participants: ['Sam', 'Taylor'],
    span: 'col-span-1 row-span-1'
  },
  {
    id: 'anec-3',
    type: 'image',
    category: 'travel',
    src: '/images/anecdotes/travel-1.jpg',
    caption: '在海边迷路，差点回不来',
    joke: '谁说的往左走？',
    participants: ['Alex', 'Sam', 'Taylor'],
    span: 'col-span-1 row-span-2'
  },
  {
    id: 'anec-4',
    type: 'video',
    category: 'drinking',
    src: '/videos/anecdotes/drinking-2.mp4',
    caption: 'B挑战一口闷，结果...',
    joke: '我还能再来三杯！（倒地）',
    participants: ['Jordan'],
    span: 'col-span-2 row-span-1'
  },
  {
    id: 'anec-5',
    type: 'image',
    category: 'travel',
    src: '/images/anecdotes/travel-2.jpg',
    caption: '高速服务区的深夜食堂',
    joke: '这泡面是我吃过最好吃的',
    participants: ['Alex', 'Jordan', 'Sam'],
    span: 'col-span-1 row-span-1'
  },
  {
    id: 'anec-6',
    type: 'image',
    category: 'mahjong',
    src: '/images/anecdotes/mahjong-2.jpg',
    caption: 'D点炮三连，史上最惨',
    joke: '我是不是该回去学数学？',
    participants: ['Taylor'],
    span: 'col-span-1 row-span-1'
  },
]

const categories = [
  { id: 'all', label: '全部', emoji: '✨' },
  { id: 'drinking', label: '杯中物', emoji: '🍺' },
  { id: 'mahjong', label: '方城战', emoji: '🀄' },
  { id: 'travel', label: '路途中', emoji: '🚗' },
]

export default function Anecdotes() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedAnecdote, setSelectedAnecdote] = useState<Anecdote | null>(null)

  const filteredAnecdotes = activeCategory === 'all' 
    ? anecdotesData 
    : anecdotesData.filter(item => item.category === activeCategory)

  return (
    <section className="relative min-h-screen w-full bg-black py-32 md:py-40 overflow-hidden">
      {/* Gradient transition */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/50 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative">
        {/* Section Title */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-3">
            轶事：生活切片
          </h2>
          <p className="font-mono text-xs md:text-sm text-neutral-500 uppercase tracking-[0.3em]">
            Anecdotes
          </p>
        </motion.div>

        {/* Category Tags */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              className={`backdrop-blur-xl border rounded-full px-6 py-3 flex items-center gap-2 transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-white/20 border-white/40 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
              }`}
              onClick={() => setActiveCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-cursor="hover"
            >
              <span className="text-lg">{category.emoji}</span>
              <span className="font-mono text-sm uppercase tracking-wider">
                {category.label}
              </span>
              {activeCategory === category.id && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 rounded-full border-2 border-white/30"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px]"
        >
          <AnimatePresence mode="popLayout">
            {filteredAnecdotes.map((anecdote, index) => (
              <motion.div
                key={anecdote.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  layout: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 },
                }}
                className={anecdote.span}
              >
                <AnecdoteItem
                  anecdote={anecdote}
                  onClick={() => anecdote.type === 'image' && setSelectedAnecdote(anecdote)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Stats or Quote */}
        <motion.div
          className="text-center mt-20 md:mt-32"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <p className="font-hand text-xl md:text-2xl text-white/20 italic">
            "The best moments are the ones we didn't plan."
          </p>
        </motion.div>
      </div>

      {/* Lightbox for images (similar to Gallery) */}
      {/* This can be added if needed, reusing Gallery's Lightbox component */}

      {/* Gradient transition */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
    </section>
  )
}
