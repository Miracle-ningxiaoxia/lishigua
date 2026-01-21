'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Masonry from 'react-masonry-css'
import CrewCard from './CrewCard'
import CoupleCard from './CoupleCard'
import { crewMembers, couplesData, findCoupleByMembers } from './crewData'

export default function Crew() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activatedMembers, setActivatedMembers] = useState<Set<string>>(new Set())
  const [mergedCouple, setMergedCouple] = useState<string | null>(null)

  const isAnyHovered = hoveredIndex !== null

  // Masonry breakpoints
  const breakpointColumns = {
    default: 4,  // Desktop: 4 columns
    1024: 3,     // Tablet: 3 columns
    768: 2,      // Mobile: 2 columns
    480: 1       // Small: 1 column
  }

  // Handle member click/activation
  const handleMemberClick = (memberId: string) => {
    const newActivated = new Set(activatedMembers)
    
    if (newActivated.has(memberId)) {
      // Deactivate if already activated
      newActivated.delete(memberId)
    } else {
      // Activate the member
      newActivated.add(memberId)
      
      // Check if both partners are now activated
      const member = crewMembers.find(m => m.id === memberId)
      if (member?.partnerId && newActivated.has(member.partnerId)) {
        // Both partners activated - trigger merge!
        const couple = findCoupleByMembers(memberId, member.partnerId)
        if (couple) {
          setMergedCouple(couple.id)
          // Clear activated members
          newActivated.clear()
        }
      }
    }
    
    setActivatedMembers(newActivated)
  }

  // Close couple card
  const handleCloseCoupleCard = () => {
    setMergedCouple(null)
    setActivatedMembers(new Set())
  }

  // Get merged couple data
  const activeCoupleData = mergedCouple 
    ? couplesData.find(c => c.id === mergedCouple)
    : null

  const activeCouple = activeCoupleData ? {
    couple: activeCoupleData,
    partner1: crewMembers.find(m => m.id === activeCoupleData.partner1Id)!,
    partner2: crewMembers.find(m => m.id === activeCoupleData.partner2Id)!,
  } : null

  return (
    <section className="relative min-h-screen w-full bg-black py-32 md:py-40 overflow-hidden">
      {/* Gradient transition */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/50 to-transparent pointer-events-none" />

      {/* Dynamic background color when couple is active */}
      <AnimatePresence>
        {activeCoupleData && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${activeCoupleData.accentColor}15 0%, transparent 70%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>

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

        {/* Hint text */}
        <motion.p
          className="text-center mb-12 font-mono text-sm text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          💡 选择两位铠甲勇士，合体！
        </motion.p>

        {/* True Masonry Layout */}
        <AnimatePresence mode="wait">
          {!mergedCouple && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Masonry
                breakpointCols={breakpointColumns}
                className="crew-masonry-grid"
                columnClassName="crew-masonry-column"
              >
                {crewMembers.map((member, index) => (
                  <CrewCard
                    key={member.id}
                    member={member}
                    index={index}
                    isAnyHovered={isAnyHovered}
                    isActivated={activatedMembers.has(member.id)}
                    onHoverStart={() => setHoveredIndex(index)}
                    onHoverEnd={() => setHoveredIndex(null)}
                    onClick={() => handleMemberClick(member.id)}
                  />
                ))}
              </Masonry>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Masonry Styles */}
        <style jsx global>{`
          .crew-masonry-grid {
            display: flex;
            margin: 0 auto;
            width: auto;
            max-width: 1400px;
          }

          .crew-masonry-column {
            padding-left: 0;
            background-clip: padding-box;
          }

          /* Desktop: 4 columns with 3rem (48px) gap */
          @media (min-width: 1024px) {
            .crew-masonry-grid {
              margin-left: -3rem;
            }
            .crew-masonry-column {
              padding-left: 3rem;
            }
            .crew-masonry-column > div {
              margin-bottom: 3rem;
            }
          }

          /* Tablet: 3 columns with 2rem (32px) gap */
          @media (min-width: 768px) and (max-width: 1023px) {
            .crew-masonry-grid {
              margin-left: -2rem;
            }
            .crew-masonry-column {
              padding-left: 2rem;
            }
            .crew-masonry-column > div {
              margin-bottom: 2rem;
            }
          }

          /* Mobile: 2 columns with 1.5rem (24px) gap */
          @media (min-width: 481px) and (max-width: 767px) {
            .crew-masonry-grid {
              margin-left: -1.5rem;
            }
            .crew-masonry-column {
              padding-left: 1.5rem;
            }
            .crew-masonry-column > div {
              margin-bottom: 1.5rem;
            }
          }

          /* Small mobile: 1 column with 2rem (32px) gap */
          @media (max-width: 480px) {
            .crew-masonry-grid {
              margin-left: -2rem;
            }
            .crew-masonry-column {
              padding-left: 2rem;
            }
            .crew-masonry-column > div {
              margin-bottom: 2rem;
            }
          }
        `}</style>

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

      {/* Couple Card Modal */}
      {activeCouple && (
        <CoupleCard
          couple={activeCouple.couple}
          partner1={activeCouple.partner1}
          partner2={activeCouple.partner2}
          onClose={handleCloseCoupleCard}
        />
      )}

      {/* Gradient transition */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
    </section>
  )
}
