import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { STORAGE_KEYS } from '@/utils/constants'

export const useStatsStore = defineStore('stats', () => {
  const totalGames = ref<number>(0)
  const totalWins = ref<number>(0)
  const totalLosses = ref<number>(0)
  const totalPlayTime = ref<number>(0)
  const gamesPlayed = ref<Record<string, number>>({})

  const winRate = computed(() => {
    if (totalGames.value === 0) return 0
    return Math.round((totalWins.value / totalGames.value) * 100)
  })

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STATS)
      if (stored) {
        const data = JSON.parse(stored)
        totalGames.value = data.totalGames ?? 0
        totalWins.value = data.totalWins ?? 0
        totalLosses.value = data.totalLosses ?? 0
        totalPlayTime.value = data.totalPlayTime ?? 0
        gamesPlayed.value = data.gamesPlayed ?? {}
      }
    } catch (e) {
      console.warn('Failed to load stats:', e)
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(
        STORAGE_KEYS.STATS,
        JSON.stringify({
          totalGames: totalGames.value,
          totalWins: totalWins.value,
          totalLosses: totalLosses.value,
          totalPlayTime: totalPlayTime.value,
          gamesPlayed: gamesPlayed.value,
        })
      )
    } catch (e) {
      console.warn('Failed to save stats:', e)
    }
  }

  function recordGameStart(gameId: string) {
    totalGames.value++
    if (!gamesPlayed.value[gameId]) {
      gamesPlayed.value[gameId] = 0
    }
    gamesPlayed.value[gameId]++
    saveToStorage()
  }

  function recordWin() {
    totalWins.value++
    saveToStorage()
  }

  function recordLoss() {
    totalLosses.value++
    saveToStorage()
  }

  function addPlayTime(seconds: number) {
    totalPlayTime.value += seconds
    saveToStorage()
  }

  function resetStats() {
    totalGames.value = 0
    totalWins.value = 0
    totalLosses.value = 0
    totalPlayTime.value = 0
    gamesPlayed.value = {}
    saveToStorage()
  }

  function formatPlayTime(): string {
    const hours = Math.floor(totalPlayTime.value / 3600)
    const minutes = Math.floor((totalPlayTime.value % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return {
    totalGames,
    totalWins,
    totalLosses,
    totalPlayTime,
    gamesPlayed,
    winRate,
    loadFromStorage,
    saveToStorage,
    recordGameStart,
    recordWin,
    recordLoss,
    addPlayTime,
    resetStats,
    formatPlayTime,
  }
})
