/**
 * Daily Challenges System
 * New challenges every day for each game
 */

import { ref, computed } from 'vue'

export interface DailyChallenge {
  id: string
  game: string
  name: string
  description: string
  objective: string
  target: number
  progress: number
  reward: {
    coins: number
    xp: number
  }
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme'
  expiresAt: number
  completed: boolean
}

export class DailyChallengeSystem {
  private challenges = ref<Map<string, DailyChallenge>>(new Map())
  private completedToday = ref<Set<string>>(new Set())

  constructor() {
    this.generateDailyChallenges()
    this.loadProgress()
  }

  /**
   * Generate daily challenges
   */
  private generateDailyChallenges(): void {
    const today = new Date()
    const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`

    // Cat Chaos challenges
    this.createChallenge({
      id: `cat_chaos_score_${dateKey}`,
      game: 'cat-chaos',
      name: 'Cat Chaos Master',
      description: 'Score 5,000 points in Cat Chaos',
      objective: 'score',
      target: 5000,
      reward: { coins: 200, xp: 100 },
      difficulty: 'medium'
    })

    this.createChallenge({
      id: `cat_chaos_survival_${dateKey}`,
      game: 'cat-chaos',
      name: 'Survival Expert',
      description: 'Survive for 3 minutes in Cat Chaos',
      objective: 'survival_time',
      target: 180,
      reward: { coins: 150, xp: 75 },
      difficulty: 'easy'
    })

    // Food Frenzy challenges
    this.createChallenge({
      id: `food_frenzy_collect_${dateKey}`,
      game: 'food-frenzy',
      name: 'Food Collector',
      description: 'Collect 50 food items in Food Frenzy',
      objective: 'food_collected',
      target: 50,
      reward: { coins: 100, xp: 50 },
      difficulty: 'easy'
    })

    this.createChallenge({
      id: `food_frenzy_combo_${dateKey}`,
      game: 'food-frenzy',
      name: 'Combo King',
      description: 'Achieve a 10x combo in Food Frenzy',
      objective: 'max_combo',
      target: 10,
      reward: { coins: 300, xp: 150 },
      difficulty: 'hard'
    })

    // Senior Dance challenges
    this.createChallenge({
      id: `senior_dance_moves_${dateKey}`,
      game: 'senior-dance',
      name: 'Dance Marathon',
      description: 'Complete 5 dances in Senior Dance',
      objective: 'dances_completed',
      target: 5,
      reward: { coins: 100, xp: 50 },
      difficulty: 'easy'
    })

    this.createChallenge({
      id: `senior_dance_perfect_${dateKey}`,
      game: 'senior-dance',
      name: 'Perfect Performance',
      description: 'Get 3 perfect scores in Senior Dance',
      objective: 'perfect_scores',
      target: 3,
      reward: { coins: 250, xp: 125 },
      difficulty: 'hard'
    })

    // Cross-game challenges
    this.createChallenge({
      id: `play_all_games_${dateKey}`,
      game: 'all',
      name: 'Arcade Explorer',
      description: 'Play all 3 arcade games today',
      objective: 'games_played',
      target: 3,
      reward: { coins: 500, xp: 250 },
      difficulty: 'medium'
    })

    this.createChallenge({
      id: `total_score_${dateKey}`,
      game: 'all',
      name: 'High Scorer',
      description: 'Score 10,000 total points across all games',
      objective: 'total_score',
      target: 10000,
      reward: { coins: 400, xp: 200 },
      difficulty: 'hard'
    })
  }

  private createChallenge(config: Omit<DailyChallenge, 'progress' | 'completed' | 'expiresAt'>): void {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const challenge: DailyChallenge = {
      ...config,
      progress: 0,
      completed: false,
      expiresAt: tomorrow.getTime()
    }

    this.challenges.value.set(challenge.id, challenge)
  }

  /**
   * Update challenge progress
   */
  updateProgress(game: string, objective: string, value: number): void {
    for (const challenge of this.challenges.value.values()) {
      if (challenge.completed) continue
      if (challenge.game !== game && challenge.game !== 'all') continue

      // Check if objective matches
      let shouldUpdate = false

      if (challenge.game === 'all') {
        // Cross-game challenges
        if (challenge.objective === 'games_played' && objective === 'game_played') {
          shouldUpdate = true
        } else if (challenge.objective === 'total_score' && objective === 'score') {
          shouldUpdate = true
        }
      } else {
        shouldUpdate = challenge.objective === objective
      }

      if (shouldUpdate) {
        challenge.progress = Math.min(challenge.target, challenge.progress + value)

        if (challenge.progress >= challenge.target && !challenge.completed) {
          this.completeChallenge(challenge.id)
        }

        this.saveProgress()
      }
    }
  }

  /**
   * Complete a challenge
   */
  private completeChallenge(challengeId: string): void {
    const challenge = this.challenges.value.get(challengeId)
    if (!challenge || challenge.completed) return

    challenge.completed = true
    this.completedToday.value.add(challenge.id)

    // Grant rewards
    console.log(`Challenge completed: ${challenge.name}`)
    console.log(`Rewards: ${challenge.reward.coins} coins, ${challenge.reward.xp} XP`)

    this.saveProgress()
  }

  /**
   * Get challenges for a specific game
   */
  getGameChallenges(game: string): DailyChallenge[] {
    return Array.from(this.challenges.value.values()).filter(
      c => c.game === game || c.game === 'all'
    )
  }

  /**
   * Get all active challenges
   */
  getAllChallenges(): DailyChallenge[] {
    return Array.from(this.challenges.value.values()).filter(
      c => c.expiresAt > Date.now()
    )
  }

  /**
   * Get completed challenges today
   */
  getCompletedToday(): DailyChallenge[] {
    return Array.from(this.challenges.value.values()).filter(c => c.completed)
  }

  /**
   * Get completion count
   */
  getCompletionCount(): number {
    return this.completedToday.value.size
  }

  /**
   * Check if challenges need refresh
   */
  checkRefresh(): boolean {
    const now = Date.now()
    for (const challenge of this.challenges.value.values()) {
      if (challenge.expiresAt <= now) {
        this.refreshChallenges()
        return true
      }
    }
    return false
  }

  /**
   * Refresh challenges for new day
   */
  private refreshChallenges(): void {
    this.challenges.value.clear()
    this.completedToday.value.clear()
    this.generateDailyChallenges()
    this.saveProgress()
  }

  /**
   * Get time until refresh
   */
  getTimeUntilRefresh(): number {
    let minExpiry = Infinity

    for (const challenge of this.challenges.value.values()) {
      if (challenge.expiresAt < minExpiry) {
        minExpiry = challenge.expiresAt
      }
    }

    return Math.max(0, minExpiry - Date.now())
  }

  private saveProgress(): void {
    try {
      const data = {
        challenges: Array.from(this.challenges.value.entries()).map(([id, c]) => [
          id,
          { progress: c.progress, completed: c.completed }
        ]),
        completedToday: Array.from(this.completedToday.value)
      }
      localStorage.setItem('flux_arcade_daily_challenges', JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save challenges:', e)
    }
  }

  private loadProgress(): void {
    try {
      const saved = localStorage.getItem('flux_arcade_daily_challenges')
      if (!saved) return

      const data = JSON.parse(saved)

      if (data.challenges) {
        data.challenges.forEach(([id, saved]: [string, any]) => {
          const challenge = this.challenges.value.get(id)
          if (challenge) {
            challenge.progress = saved.progress || 0
            challenge.completed = saved.completed || false
          }
        })
      }

      if (data.completedToday) {
        this.completedToday.value = new Set(data.completedToday)
      }
    } catch (e) {
      console.error('Failed to load challenges:', e)
    }
  }
}

let dailyChallengeInstance: DailyChallengeSystem | null = null

export function getDailyChallengeSystem(): DailyChallengeSystem {
  if (!dailyChallengeInstance) {
    dailyChallengeInstance = new DailyChallengeSystem()
  }
  return dailyChallengeInstance
}

export function useDailyChallenges() {
  const system = getDailyChallengeSystem()

  return {
    getAllChallenges: system.getAllChallenges.bind(system),
    getGameChallenges: system.getGameChallenges.bind(system),
    getCompletedToday: system.getCompletedToday.bind(system),
    getCompletionCount: system.getCompletionCount.bind(system),
    getTimeUntilRefresh: system.getTimeUntilRefresh.bind(system),
    updateProgress: system.updateProgress.bind(system),
    checkRefresh: system.checkRefresh.bind(system)
  }
}
