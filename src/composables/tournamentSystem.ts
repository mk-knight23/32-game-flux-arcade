/**
 * Tournament System
 * Multi-game tournaments with brackets and leaderboards
 */

import { ref, computed } from 'vue'

export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss'

export interface Tournament {
  id: string
  name: string
  description: string
  format: TournamentFormat
  game: string
  maxPlayers: number
  currentPlayers: number
  status: 'registration' | 'in_progress' | 'completed' | 'cancelled'
  startTime: number
  endTime?: number
  brackets: Bracket[]
  winner?: string
  prizes: Prize[]
}

export interface Bracket {
  id: string
  round: number
  matches: Match[]
}

export interface Match {
  id: string
  player1: string
  player2: string
  player1Score: number
  player2Score: number
  winner?: string
  status: 'pending' | 'in_progress' | 'completed'
  scheduledTime?: number
}

export interface Prize {
  rank: number
  type: 'coins' | 'trophy' | 'badge' | 'title'
  value: number
  name: string
}

export class TournamentSystem {
  private tournaments = ref<Map<string, Tournament>>(new Map())
  private playerTournaments = ref<Map<string, string[]>>(new Map()) // playerId -> tournamentIds

  /**
   * Create a new tournament
   */
  createTournament(config: {
    name: string
    description: string
    format: TournamentFormat
    game: string
    maxPlayers: number
    startTime: number
    prizes: Prize[]
  }): Tournament {
    const tournament: Tournament = {
      id: this.generateId(),
      name: config.name,
      description: config.description,
      format: config.format,
      game: config.game,
      maxPlayers: config.maxPlayers,
      currentPlayers: 0,
      status: 'registration',
      startTime: config.startTime,
      brackets: [],
      prizes: config.prizes
    }

    this.tournaments.value.set(tournament.id, tournament)
    return tournament
  }

  /**
   * Join a tournament
   */
  joinTournament(tournamentId: string, playerId: string): boolean {
    const tournament = this.tournaments.value.get(tournamentId)
    if (!tournament) return false

    if (tournament.status !== 'registration') return false
    if (tournament.currentPlayers >= tournament.maxPlayers) return false

    tournament.currentPlayers++

    // Track player's tournaments
    const playerTourns = this.playerTournaments.value.get(playerId) || []
    playerTourns.push(tournamentId)
    this.playerTournaments.value.set(playerId, playerTourns)

    // Auto-start when full
    if (tournament.currentPlayers === tournament.maxPlayers) {
      this.startTournament(tournamentId)
    }

    return true
  }

  /**
   * Start a tournament
   */
  startTournament(tournamentId: string): boolean {
    const tournament = this.tournaments.value.get(tournamentId)
    if (!tournament) return false

    if (tournament.currentPlayers < 2) return false

    tournament.status = 'in_progress'

    // Generate brackets based on format
    tournament.brackets = this.generateBrackets(tournament)

    return true
  }

  /**
   * Generate tournament brackets
   */
  private generateBrackets(tournament: Tournament): Bracket[] {
    const brackets: Bracket[] = []
    const players = this.getTournamentPlayers(tournament.id)

    switch (tournament.format) {
      case 'single_elimination':
        return this.generateSingleElimination(players)
      case 'double_elimination':
        return this.generateDoubleElimination(players)
      case 'round_robin':
        return this.generateRoundRobin(players)
      case 'swiss':
        return this.generateSwiss(players)
      default:
        return []
    }
  }

  private generateSingleElimination(players: string[]): Bracket[] {
    const brackets: Bracket[] = []
    const shuffled = [...players].sort(() => Math.random() - 0.5)
    let round = 0

    while (shuffled.length > 1) {
      const matches: Match[] = []

      for (let i = 0; i < shuffled.length; i += 2) {
        if (i + 1 < shuffled.length) {
          matches.push({
            id: this.generateId(),
            player1: shuffled[i],
            player2: shuffled[i + 1],
            player1Score: 0,
            player2Score: 0,
            status: 'pending'
          })
        }
      }

      brackets.push({ id: `round_${round}`, round, matches })
      round++
      // Winners advance (simplified)
      shuffled.length = Math.ceil(shuffled.length / 2)
    }

    return brackets
  }

  private generateDoubleElimination(players: string[]): Bracket[] {
    // Simplified double elimination
    return this.generateSingleElimination(players)
  }

  private generateRoundRobin(players: string[]): Bracket[] {
    const matches: Match[] = []

    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        matches.push({
          id: this.generateId(),
          player1: players[i],
          player2: players[j],
          player1Score: 0,
          player2Score: 0,
          status: 'pending'
        })
      }
    }

    return [{ id: 'round_robin', round: 0, matches }]
  }

  private generateSwiss(players: string[]): Bracket[] {
    // Simplified Swiss system
    return this.generateRoundRobin(players)
  }

  /**
   * Record match result
   */
  recordMatchResult(
    tournamentId: string,
    matchId: string,
    player1Score: number,
    player2Score: number
  ): boolean {
    const tournament = this.tournaments.value.get(tournamentId)
    if (!tournament) return false

    for (const bracket of tournament.brackets) {
      const match = bracket.matches.find(m => m.id === matchId)
      if (match) {
        match.player1Score = player1Score
        match.player2Score = player2Score
        match.status = 'completed'
        match.winner = player1Score > player2Score ? match.player1 : match.player2

        // Check if tournament is complete
        this.checkTournamentComplete(tournament)

        return true
      }
    }

    return false
  }

  /**
   * Check if tournament is complete
   */
  private checkTournamentComplete(tournament: Tournament): void {
    const allMatchesComplete = tournament.brackets.every(bracket =>
      bracket.matches.every(match => match.status === 'completed')
    )

    if (allMatchesComplete) {
      tournament.status = 'completed'
      tournament.endTime = Date.now()
      tournament.winner = this.determineWinner(tournament)
    }
  }

  /**
   * Determine tournament winner
   */
  private determineWinner(tournament: Tournament): string | undefined {
    // Simplified: get player with most wins
    const wins = new Map<string, number>()

    for (const bracket of tournament.brackets) {
      for (const match of bracket.matches) {
        if (match.winner) {
          wins.set(match.winner, (wins.get(match.winner) || 0) + 1)
        }
      }
    }

    let maxWins = 0
    let winner: string | undefined

    for (const [player, winCount] of wins) {
      if (winCount > maxWins) {
        maxWins = winCount
        winner = player
      }
    }

    return winner
  }

  /**
   * Get tournament by ID
   */
  getTournament(tournamentId: string): Tournament | undefined {
    return this.tournaments.value.get(tournamentId)
  }

  /**
   * Get all active tournaments
   */
  getActiveTournaments(): Tournament[] {
    return Array.from(this.tournaments.value.values()).filter(
      t => t.status === 'registration' || t.status === 'in_progress'
    )
  }

  /**
   * Get player's tournaments
   */
  getPlayerTournaments(playerId: string): Tournament[] {
    const tournamentIds = this.playerTournaments.value.get(playerId) || []
    return tournamentIds
      .map(id => this.tournaments.value.get(id))
      .filter((t): t is Tournament => t !== undefined)
  }

  /**
   * Get tournament leaderboard
   */
  getLeaderboard(tournamentId: string): Array<{ player: string; score: number; rank: number }> {
    const tournament = this.tournaments.value.get(tournamentId)
    if (!tournament) return []

    const scores = new Map<string, number>()

    for (const bracket of tournament.brackets) {
      for (const match of bracket.matches) {
        if (match.status === 'completed') {
          scores.set(match.player1, (scores.get(match.player1) || 0) + match.player1Score)
          scores.set(match.player2, (scores.get(match.player2) || 0) + match.player2Score)
        }
      }
    }

    return Array.from(scores.entries())
      .map(([player, score]) => ({ player, score, rank: 0 }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
  }

  private getTournamentPlayers(tournamentId: string): string[] {
    // Mock implementation
    return ['player1', 'player2', 'player3', 'player4']
  }

  private generateId(): string {
    return `t_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

let tournamentInstance: TournamentSystem | null = null

export function getTournamentSystem(): TournamentSystem {
  if (!tournamentInstance) {
    tournamentInstance = new TournamentSystem()
  }
  return tournamentInstance
}

export function useTournaments() {
  const system = getTournamentSystem()

  return {
    createTournament: system.createTournament.bind(system),
    joinTournament: system.joinTournament.bind(system),
    startTournament: system.startTournament.bind(system),
    recordMatchResult: system.recordMatchResult.bind(system),
    getTournament: system.getTournament.bind(system),
    getActiveTournaments: system.getActiveTournaments.bind(system),
    getPlayerTournaments: system.getPlayerTournaments.bind(system),
    getLeaderboard: system.getLeaderboard.bind(system)
  }
}
