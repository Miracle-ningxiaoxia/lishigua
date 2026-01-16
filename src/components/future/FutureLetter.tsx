'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { PenLine } from 'lucide-react'
import Starfield from './Starfield'
import LetterEnvelope, { Letter } from './LetterEnvelope'
import LetterView from './LetterView'
import WriteLetterForm from './WriteLetterForm'

// Initial letters data
const initialLetters: Letter[] = [
  {
    id: 'letter-1',
    sender: 'Alex',
    content: '致未来的我们：\n\n还记得那个夏天吗？我们在海边许下的愿望，就像被海浪带走的贝壳，不知飘向何方。但我相信，无论时间如何流转，我们的友谊会像北极星一样，永远闪耀在彼此的夜空中。\n\n愿未来的你们，依然保持着现在的热情和纯真。',
    date: '2023.07.15'
  },
  {
    id: 'letter-2',
    sender: 'Jordan',
    content: '给十年后的自己：\n\n如果你正在读这封信，说明我们都还在前行。那些曾经以为过不去的坎，现在回头看是不是也没那么可怕？\n\n希望你还记得我们一起度过的那些深夜，那些关于梦想的对话。不要忘记，最好的时光永远是现在。',
    date: '2023.10.20'
  },
  {
    id: 'letter-3',
    sender: 'Sam',
    content: '亲爱的朋友们：\n\n每当我翻开这段记忆，心中总是充满温暖。我们曾在雨中奔跑，在黎明前等待日出，在深夜里分享秘密。\n\n这些瞬间，构成了我们共同的青春。愿我们的故事，永远不会有结局。',
    date: '2024.01.01'
  },
  {
    id: 'letter-4',
    sender: 'Taylor',
    content: '未来的某一天：\n\n当你读到这封信时，我们可能已经各奔东西，追逐着各自的梦想。但请记住，距离从未能阻隔真正的友谊。\n\n无论何时何地，只要回头，我们都在彼此身后。这份情谊，是我们最珍贵的财富。',
    date: '2024.03.14'
  },
]

export default function FutureLetter() {
  const [letters, setLetters] = useState<Letter[]>(initialLetters)
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null)
  const [isWriting, setIsWriting] = useState(false)

  const handleWriteLetter = (newLetter: Omit<Letter, 'id'>) => {
    const letter: Letter = {
      ...newLetter,
      id: `letter-${Date.now()}`,
    }
    setLetters(prev => [...prev, letter])
  }

  return (
    <section className="relative min-h-screen w-full bg-black py-32 md:py-40 overflow-hidden">
      {/* Starfield Background */}
      <Starfield />

      {/* Gradient transition */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/50 to-transparent pointer-events-none z-10" />

      <div className="container mx-auto px-4 md:px-8 relative z-20">
        {/* Section Title */}
        <motion.div 
          className="text-center mb-20 md:mb-32"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-3">
            寄意
          </h2>
          <p className="font-mono text-xs md:text-sm text-neutral-500 uppercase tracking-[0.3em]">
            Letters Beyond Time
          </p>
        </motion.div>

        {/* Letter Envelopes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12 justify-items-center mb-20">
          {letters.map((letter, index) => (
            <LetterEnvelope
              key={letter.id}
              letter={letter}
              index={index}
              onClick={() => setSelectedLetter(letter)}
            />
          ))}
        </div>

        {/* Write New Letter Button */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.button
            className="backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 rounded-2xl px-8 py-4 flex items-center gap-3 group transition-colors"
            onClick={() => setIsWriting(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-cursor="hover"
          >
            <PenLine className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
            <span className="font-mono text-sm uppercase tracking-wider text-white/70 group-hover:text-white transition-colors">
              Write to Future
            </span>
          </motion.button>
        </motion.div>

        {/* Decorative Quote */}
        <motion.div
          className="text-center mt-20 md:mt-32"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <p className="font-hand text-xl md:text-2xl text-white/20 italic">
            "Some moments are meant to be captured, not forgotten."
          </p>
        </motion.div>
      </div>

      {/* Letter View Modal */}
      <AnimatePresence>
        {selectedLetter && (
          <LetterView
            letter={selectedLetter}
            onClose={() => setSelectedLetter(null)}
          />
        )}
      </AnimatePresence>

      {/* Write Letter Form Modal */}
      <AnimatePresence>
        {isWriting && (
          <WriteLetterForm
            onClose={() => setIsWriting(false)}
            onSubmit={handleWriteLetter}
          />
        )}
      </AnimatePresence>

      {/* Gradient transition */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none z-10" />
    </section>
  )
}
