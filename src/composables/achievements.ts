/**
 * Cross-Game Achievement System
 * Unified achievements across all arcade games
 */

export interface Achievement {
  id: string
  name: string
  description: string
  game?: string // If undefined, applies to all games
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  unlockedAt?: number
  progress: number
  maxProgress: number
  hidden: boolean
  reward?: {
    type: 'coins' | 'badge' | 'title'
    value: number
  }
}

export class AchievementManager {
  private achievements = ref<Map<string, Achievement>>(new Map())
  private gameStats = ref<Map<string, Map<string, number>>>(new Map())

  constructor() {
    this.initializeAchievements()
    this.loadProgress()
  }

  private initializeAchievements(): void {
    // Cross-game achievements
    this.registerAchievement({
      id: 'first_win',
      name: 'First Victory',
      description: 'Win your first game in any arcade',
      icon: '🏆',
      rarity: 'common',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      hidden: false,
      reward: { type: 'coins', value: 100 }
    })

    this.registerAchievement({
      id: 'perfect_score',
      name: 'Perfectionist',
      description: 'Achieve a perfect score in any game',
      icon: '💯',
      rarity: 'rare',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      hidden: false,
      reward: { type: 'coins', value: 500 }
    })

    this.registerAchievement({
      id: 'marathon_gamer',
      name: 'Marathon Gamer',
      description: 'Play for 2 hours total',
      icon: '⏱️',
      rarity: 'common',
      unlocked: false,
      progress: 0,
      maxProgress: 7200, // 2 hours in seconds
      hidden: false
    })

    this.registerAchievement({
      id: 'tournament_champion',
      name: 'Tournament Champion',
      description: 'Win a tournament',
      icon: '👑',
      rarity: 'epic',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      hidden: false,
      reward: { type: 'title', value: 1 }
    })

    this.registerAchievement({
      id: 'all_games_master',
      name: 'Arcade Master',
      description: 'Win in all arcade games',
      icon: '🎮',
      rarity: 'legendary',
      unlocked: false,
      progress: 0,
      maxProgress: 3,
      hidden: false,
      reward: { type: 'badge', value: 1 }
    })

    // Cat Chaos specific
    this.registerAchievement({
      id: 'cat_chaos_high_score',
      name: 'Cat Chaos Champion',
      description: 'Score 10,000 points in Cat Chaos',
      icon: '🐱',
      rarity: 'rare',
      unlocked: false,
      progress: 0,
      maxProgress: 10000,
      hidden: false,
      game: 'cat-chaos'
    })

    // Food Frenzy specific
    this.registerAchievement({
      id: 'food_frenzy_feast',
      name: 'Feast Master',
      description: 'Collect 100 food items in Food Frenzy',
      icon: '🍔',
      rarity: 'common',
      unlocked: false,
      progress: 0,
      maxProgress: 100,
      hidden: false,
      game: 'food-frenzy'
    })

    // Senior Dance specific
    this.registerAchievement({
      id: 'senior_dance_pro',
      name: 'Dance Pro',
      description: 'Complete 10 dances in Senior Dance',
      icon: '💃',
      rarity: 'common',
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      hidden: false,
      game: 'senior-dance'
    })
  }

  registerAchievement(achievement: Achievement): void {
    this.achievements.value.set(achievement.id, achievement)
  }

  /**
   * Update progress for an achievement
   */
  updateProgress(achievementId: string, progress: number): void {
    const achievement = this.achievements.value.get(achievementId)
    if (!achievement) return

    achievement.progress = Math.min(achievement.maxProgress, progress)

    if (achievement.progress >= achievement.maxProgress && !achievement.unlocked) {
      this.unlock(achievementId)
    }

    this.saveProgress()
  }

  /**
   * Increment progress
   */
  incrementProgress(achievementId: string, amount: number = 1): void {
    const achievement = this.achievements.value.get(achievementId)
    if (!achievement) return

    this.updateProgress(achievementId, achievement.progress + amount)
  }

  /**
   * Unlock an achievement
   */
  unlock(achievementId: string): boolean {
    const achievement = this.achievements.value.get(achievementId)
    if (!achievement || achievement.unlocked) return false

    achievement.unlocked = true
    achievement.unlockedAt = Date.now()

    // Grant reward
    if (achievement.reward) {
      this.grantReward(achievement.reward)
    }

    this.saveProgress()
    return true
  }

  /**
   * Record game stat
   */
  recordStat(game: string, stat: string, value: number): void {
    if (!this.gameStats.value.has(game)) {
      this.gameStats.value.set(game, new Map())
    }

    const gameStats = this.gameStats.value.get(game)!
    gameStats.set(stat, (gameStats.get(stat) || 0) + value)

    // Check for stat-based achievements
    this.checkStatAchievements(game, stat, gameStats.get(stat)!)
  }

  private checkStatAchievements(game: string, stat: string, value: number): void {
    // Auto-check achievements based on stats
    if (stat === 'wins' && value >= 1) {
      this.unlock('first_win')
    }

    if (stat === 'score' && game === 'cat-chaos' && value >= 10000) {
      this.unlock('cat_chaos_high_score')
    }

    if (stat === 'food_collected' && game === 'food-frenzy' && value >= 100) {
      this.unlock('food_frenzy_feast')
    }

    if (stat === 'dances_completed' && game === 'senior-dance' && value >= 10) {
      this.unlock('senior_dance_pro')
    }
  }

  /**
   * Get all achievements
   */
  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.value.values())
  }

  /**
   * Get achievements for a specific game
   */
  getGameAchievements(game: string): Achievement[] {
    return this.getAllAchievements().filter(
      a => !a.game || a.game === game
    )
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter(a => a.unlocked)
  }

  /**
   * Get achievement progress
   */
  getAchievement(achievementId: string): Achievement | undefined {
    return this.achievements.value.get(achievementId)
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(): number {
    const total = this.achievements.value.size
    const unlocked = this.getUnlockedAchievements().length
    return total > 0 ? Math.round((unlocked / total) * 100) : 0
  }

  /**
   * Get rarity counts
   */
  getRarityCounts(): Map<string, number> {
    const counts = new Map<string, number>()
    const rarities: Array<'common' | 'rare' | 'epic' | 'legendary'> = ['common', 'rare', 'epic', 'legendary']

    rarities.forEach(rarity => {
      counts.set(rarity, this.getUnlockedAchievements().filter(a => a.rarity === rarity).length)
    })

    return counts
  }

  private grantReward(reward: Achievement['reward']): void {
    if (!reward) return

    console.log(`Granted reward: ${reward.type} x${reward.value}`)
    // In production, this would update player's coins, badges, etc.
  }

  private saveProgress(): void {
    try {
      const data = {
        achievements: Array.from(this.achievements.value.entries()).map(([id, a]) => [
          id,
          { unlocked: a.unlocked, unlockedAt: a.unlockedAt, progress: a.progress }
        ]),
        gameStats: Array.from(this.gameStats.value.entries()).map(([game, stats]) => [
          game,
          Array.from(stats.entries())
        ])
      }
      localStorage.setItem('flux_arcade_achievements', JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save achievements:', e)
    }
  }

  private loadProgress(): void {
    try {
      const saved = localStorage.getItem('flux_arcade_achievements')
      if (!saved) return

      const data = JSON.parse(saved)

      // Load achievements
      if (data.achievements) {
        data.achievements.forEach(([id, saved]: [string, any]) => {
          const achievement = this.achievements.value.get(id)
          if (achievement) {
            achievement.unlocked = saved.unlocked
            achievement.unlockedAt = saved.unlockedAt
            achievement.progress = saved.progress || 0
          }
        })
      }

      // Load game stats
      if (data.gameStats) {
        data.gameStats.forEach(([game, stats]: [string, Array<[string, number]>]) => {
          this.gameStats.value.set(game, new Map(stats))
        })
      }
    } catch (e) {
      console.error('Failed to load achievements:', e)
    }
  }

  resetProgress(): void {
    this.achievements.value.forEach(a => {
      a.unlocked = false
      a.unlockedAt = undefined
      a.progress = 0
    })
    this.gameStats.value.clear()
    this.saveProgress()
  }
}

let achievementInstance: AchievementManager | null = null

export function getAchievementManager(): AchievementManager {
  if (!achievementInstance) {
    achievementInstance = new AchievementManager()
  }
  return achievementInstance
}

export function useAchievements() {
  const manager = getAchievementManager()

  return {
    getAllAchievements: manager.getAllAchievements.bind(manager),
    getGameAchievements: manager.getGameAchievements.bind(manager),
    getUnlockedAchievements: manager.getUnlockedAchievements.bind(manager),
    getAchievement: manager.getAchievement.bind(manager),
    getCompletionPercentage: manager.getCompletionPercentage.bind(manager),
    getRarityCounts: manager.getRarityCounts.bind(manager),

    updateProgress: manager.updateProgress.bind(manager),
    incrementProgress: manager.incrementProgress.bind(manager),
    unlock: manager.unlock.bind(manager),
    recordStat: manager.recordStat.bind(manager),
    resetProgress: manager.resetProgress.bind(manager)
  }
}
