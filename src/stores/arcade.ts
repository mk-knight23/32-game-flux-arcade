import { defineStore } from 'pinia'

// Game unlock costs
export const GAME_COSTS: Record<string, number> = {
  'senior-dance': 200,
  'food-frenzy': 500
}

// V2: Get today's date string for daily challenge
function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

// V2: Deterministic daily game based on date
export function getDailyChallengeGame(): string {
  const games = ['clumsy-cat', 'senior-dance', 'food-frenzy']
  const today = new Date()
  // Use day of year to rotate games
  const start = new Date(today.getFullYear(), 0, 0)
  const diff = today.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return games[dayOfYear % games.length]
}

export const useArcadeStore = defineStore('arcade', {
  state: () => ({
    totalTickets: parseInt(localStorage.getItem('arcade-tickets') || '100'), // Start with 100 tickets
    unlockedGames: JSON.parse(localStorage.getItem('arcade-unlocked') || '["clumsy-cat"]'),
    userXP: parseInt(localStorage.getItem('arcade-xp') || '0'),
    highScores: JSON.parse(localStorage.getItem('arcade-scores') || '{}'),
    // V2: Daily challenge tracking
    dailyChallenge: {
      lastPlayed: localStorage.getItem('arcade-daily-date') || '',
      gameId: getDailyChallengeGame(),
      completed: localStorage.getItem('arcade-daily-date') === getTodayString(),
      highScore: parseInt(localStorage.getItem('arcade-daily-score') || '0')
    }
  }),
  getters: {
    isGameUnlocked: (state) => (gameId: string) => {
      return state.unlockedGames.includes(gameId)
    },
    getGameCost: () => (gameId: string) => {
      return GAME_COSTS[gameId] || 0
    },
    canUnlockGame: (state) => (gameId: string) => {
      const cost = GAME_COSTS[gameId] || 0
      return state.totalTickets >= cost && !state.unlockedGames.includes(gameId)
    }
  },
  actions: {
    addTickets(val: number) {
      this.totalTickets += val
      localStorage.setItem('arcade-tickets', this.totalTickets.toString())
    },
    removeTickets(val: number) {
      this.totalTickets = Math.max(0, this.totalTickets - val)
      localStorage.setItem('arcade-tickets', this.totalTickets.toString())
    },
    updateHighScore(gameId: string, score: number) {
      if (!this.highScores[gameId] || score > this.highScores[gameId]) {
        this.highScores[gameId] = score
        localStorage.setItem('arcade-scores', JSON.stringify(this.highScores))
      }
    },
    unlockGame(gameId: string) {
      const cost = GAME_COSTS[gameId]
      if (cost && this.totalTickets >= cost && !this.unlockedGames.includes(gameId)) {
        this.totalTickets -= cost
        this.unlockedGames = [...this.unlockedGames, gameId]
        localStorage.setItem('arcade-tickets', this.totalTickets.toString())
        localStorage.setItem('arcade-unlocked', JSON.stringify(this.unlockedGames))
        return true
      }
      return false
    },
    awardTickets(score: number, gameId: string) {
      // Award 1 ticket per 100 points, minimum 1
      let tickets = Math.max(1, Math.floor(score / 100))
      
      // V2: Daily challenge bonus
      const today = getTodayString()
      if (gameId === this.dailyChallenge.gameId && this.dailyChallenge.lastPlayed !== today) {
        // First play of daily challenge today - 2x bonus
        tickets *= 2
        this.dailyChallenge.lastPlayed = today
        this.dailyChallenge.completed = true
        localStorage.setItem('arcade-daily-date', today)
        localStorage.setItem('arcade-daily-score', score.toString())
      }
      
      this.addTickets(tickets)
      return tickets
    },
    
    // V2: Check if daily challenge is available
    isDailyChallengeAvailable(): boolean {
      return this.dailyChallenge.lastPlayed !== getTodayString()
    },
    
    // V2: Get daily challenge status
    getDailyChallengeStatus() {
      return {
        gameId: this.dailyChallenge.gameId,
        completed: this.dailyChallenge.lastPlayed === getTodayString(),
        bonus: 2
      }
    }
  }
})
