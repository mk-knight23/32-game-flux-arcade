import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameID, UserStats } from '@/types/game'

interface ArcadeStore {
  activeGame: GameID | null
  isDarkMode: boolean
  highScores: Record<GameID, number>
  stats: UserStats
  
  // Actions
  setActiveGame: (id: GameID | null) => void
  toggleDarkMode: () => void
  updateHighScore: (id: GameID, score: number) => void
  addGamePlayed: () => void
}

export const useArcadeStore = create<ArcadeStore>()(
  persist(
    (set) => ({
      activeGame: null,
      isDarkMode: true,
      highScores: {
        'clumsy-cat': 0,
        'dance-battle': 0,
        'food-fight': 0,
        'office-prank': 0,
        'zombie-defenders': 0,
      },
      stats: {
        gamesPlayed: 0,
        totalScore: 0,
        achievements: [],
      },
      
      setActiveGame: (id) => set({ activeGame: id }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      updateHighScore: (id, score) => set((state) => ({
        highScores: { ...state.highScores, [id]: Math.max(state.highScores[id], score) },
        stats: { ...state.stats, totalScore: state.stats.totalScore + score }
      })),
      addGamePlayed: () => set((state) => ({
        stats: { ...state.stats, gamesPlayed: state.stats.gamesPlayed + 1 }
      })),
    }),
    {
      name: 'arcade-storage',
    }
  )
)
