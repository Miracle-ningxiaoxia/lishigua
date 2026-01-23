'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import { Play, Volume2, VolumeX } from 'lucide-react'

export interface MusicPlayerRef {
  startMusic: () => Promise<void>
  isPlaying: () => boolean
}

const MusicPlayer = forwardRef<MusicPlayerRef>((props, ref) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [volume, setVolume] = useState(0.5) // 0-1
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const hasStartedRef = useRef(false) // Track if music has ever been started
  const userPausedRef = useRef(false) // Track if user manually paused (critical!)
  
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

  // Set volume instantly
  const setVolumeInstant = useCallback((vol: number) => {
    if (!gainNodeRef.current) return
    gainNodeRef.current.gain.value = vol
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

    return () => {
      audioContext.close()
    }
  }, [])

  // Handle volume changes
  useEffect(() => {
    if (isPlaying && gainNodeRef.current) {
      setVolumeInstant(volume)
    }
  }, [volume, isPlaying, setVolumeInstant])

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    startMusic: async () => {
      // CRITICAL: Never auto-start if user manually paused
      if (userPausedRef.current) {
        console.log('Music auto-start blocked: user manually paused')
        return
      }

      // Don't restart if already playing
      if (!audioRef.current || !audioContextRef.current) return
      if (isPlaying) return

      try {
        // Resume audio context if suspended
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume()
        }
        
        // Play and fade in
        if (audioRef.current.paused) {
          await audioRef.current.play()
          fadeAudio(volume, 2) // Fade in over 2 seconds to current volume
          setIsPlaying(true)
          hasStartedRef.current = true
        }
      } catch (error) {
        console.log('Audio playback failed:', error)
      }
    },
    isPlaying: () => isPlaying
  }), [isPlaying, volume, fadeAudio])

  const togglePlay = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        // User manually paused - set flag to prevent auto-restart
        userPausedRef.current = true
        console.log('User paused music - auto-play disabled')
        
        // Fade out then pause
        fadeAudio(0, 1.5)
        setTimeout(() => {
          audioRef.current?.pause()
        }, 1500)
        setIsPlaying(false)
      } else {
        // User manually played - clear pause flag
        userPausedRef.current = false
        console.log('User resumed music - auto-play enabled')
        
        // Resume audio context if suspended
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume()
        }
        
        // Play and fade in
        await audioRef.current.play()
        fadeAudio(volume, 1.5) // Fade to current volume
        setIsPlaying(true)
        hasStartedRef.current = true
      }
    } catch (error) {
      console.log('Audio playback failed:', error)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
  }

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0)
    } else {
      setVolume(0.5)
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

      {/* Music Player Controls */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setIsExpanded(false)}
      >
        <div className="flex flex-col items-end gap-3">
          {/* Volume Slider (shown when expanded) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {/* Volume Icon */}
                  <button
                    onClick={toggleMute}
                    className="text-white/70 hover:text-white transition-colors"
                    data-cursor="hover"
                  >
                    {volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>

                  {/* Volume Slider */}
                  <div className="relative w-24">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-3
                        [&::-webkit-slider-thumb]:h-3
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-white
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:transition-all
                        [&::-webkit-slider-thumb]:hover:scale-110
                        [&::-moz-range-thumb]:w-3
                        [&::-moz-range-thumb]:h-3
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-white
                        [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.6) ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
                      }}
                    />
                  </div>

                  {/* Volume Percentage */}
                  <span className="font-mono text-xs text-white/60 w-8 text-right">
                    {Math.round(volume * 100)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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

            {/* Main Play/Pause Button */}
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
        </div>
      </motion.div>
    </>
  )
})

MusicPlayer.displayName = 'MusicPlayer'

export default MusicPlayer
