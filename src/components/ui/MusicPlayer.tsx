'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import { Play } from 'lucide-react'

export interface MusicPlayerRef {
  startMusic: () => Promise<void>
}

const MusicPlayer = forwardRef<MusicPlayerRef>((props, ref) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isReady, setIsReady] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)

  // Fade in/out function
  const fadeAudio = useCallback((targetVolume: number, duration: number = 1.5) => {
    if (!gainNodeRef.current || !audioContextRef.current) return

    const currentTime = audioContextRef.current.currentTime
    gainNodeRef.current.gain.cancelScheduledValues(currentTime)
    gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, currentTime)
    gainNodeRef.current.gain.linearRampToValueAtTime(targetVolume, currentTime + duration)
  }, [])

  // Setup audio context and gain node
  useEffect(() => {
    if (!audioRef.current || audioContextRef.current) return

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    const audioContext = new AudioContext()
    const gainNode = audioContext.createGain()
    const source = audioContext.createMediaElementSource(audioRef.current)

    source.connect(gainNode)
    gainNode.connect(audioContext.destination)

    gainNode.gain.value = 0 // Start at 0 volume

    audioContextRef.current = audioContext
    gainNodeRef.current = gainNode
    sourceNodeRef.current = source

    setIsReady(true)

    return () => {
      audioContext.close()
    }
  }, [])

  // Expose startMusic method to parent
  useImperativeHandle(ref, () => ({
    startMusic: async () => {
      if (!audioRef.current || !audioContextRef.current) return

      try {
        // Resume audio context if suspended
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume()
        }
        
        // Play and fade in
        await audioRef.current.play()
        fadeAudio(0.5, 2) // Fade in over 2 seconds
        setIsPlaying(true)
      } catch (error) {
        console.log('Audio playback failed:', error)
      }
    }
  }))

  const togglePlay = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        // Fade out then pause
        fadeAudio(0, 1.5)
        setTimeout(() => {
          audioRef.current?.pause()
        }, 1500)
        setIsPlaying(false)
      } else {
        // Resume audio context if suspended
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume()
        }
        
        // Play and fade in
        await audioRef.current.play()
        fadeAudio(0.5, 1.5) // Fade to 50% volume
        setIsPlaying(true)
      }
    } catch (error) {
      console.log('Audio playback failed:', error)
    }
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        loop 
        preload="auto"
      >
        <source src="/audio/ambient-bgm.mp3" type="audio/mpeg" />
      </audio>

      {/* Music Player Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setIsExpanded(false)}
      >
        <div className="flex items-center gap-3">
          {/* Track Name (shown on hover) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-full px-4 py-2"
              >
                <p className="font-mono text-xs text-white/60 whitespace-nowrap">
                  Current Echo: <span className="text-white/80">Golden Hour</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Button */}
          <motion.button
            onClick={togglePlay}
            className="relative w-14 h-14 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-cursor="hover"
          >
            {/* Ripple effect when playing */}
            {isPlaying && (
              <motion.div
                className="absolute inset-0 rounded-full border border-white/30"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            )}

            {/* Icon or Frequency Bars */}
            <div className="relative w-6 h-6 flex items-center justify-center">
              {isPlaying ? (
                // Frequency Bars
                <div className="flex items-center justify-center gap-1 h-full">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 bg-white rounded-full"
                      animate={{
                        height: ['40%', '100%', '40%'],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              ) : (
                // Play Icon
                <Play className="w-4 h-4 text-white/70 group-hover:text-white transition-colors ml-0.5" />
              )}
            </div>
          </motion.button>
        </div>
      </motion.div>
    </>
  )
})

MusicPlayer.displayName = 'MusicPlayer'

export default MusicPlayer
