'use client'

import { createContext, useContext, useRef, ReactNode } from 'react'
import MusicPlayer, { MusicPlayerRef } from '@/components/ui/MusicPlayer'

interface AppContextType {
  musicPlayerRef: React.RefObject<MusicPlayerRef | null> | null
}

const AppContext = createContext<AppContextType>({ musicPlayerRef: null })

export function useApp() {
  return useContext(AppContext)
}

interface AppProviderProps {
  children: ReactNode
}

export default function AppProvider({ children }: AppProviderProps) {
  const musicPlayerRef = useRef<MusicPlayerRef>(null)

  return (
    <AppContext.Provider value={{ musicPlayerRef }}>
      <MusicPlayer ref={musicPlayerRef} />
      {children}
    </AppContext.Provider>
  )
}
