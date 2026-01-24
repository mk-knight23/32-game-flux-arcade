import { defineStore } from 'pinia'

export const useArcadeStore = defineStore('arcade', {
  state: () => ({
    totalTickets: parseInt(localStorage.getItem('arcade-tickets') || '0'),
    unlockedGames: JSON.parse(localStorage.getItem('arcade-unlocked') || '["clumsy-cat"]'),
    userXP: parseInt(localStorage.getItem('arcade-xp') || '0'),
    highScores: JSON.parse(localStorage.getItem('arcade-scores') || '{}')
  }),
  actions: {
    addTickets(val: number) {
      this.totalTickets += val
      localStorage.setItem('arcade-tickets', this.totalTickets.toString())
    },
    updateHighScore(gameId: string, score: number) {
      if (!this.highScores[gameId] || score > this.highScores[gameId]) {
        this.highScores[gameId] = score
        localStorage.setItem('arcade-scores', JSON.stringify(this.highScores))
      }
    }
  }
})
