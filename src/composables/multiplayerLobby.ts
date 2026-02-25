/**
 * Multiplayer Lobby System
 * Real-time multiplayer for all arcade games
 */

import { ref, computed } from 'vue'

export type LobbyStatus = 'waiting' | 'ready' | 'in_game' | 'closed'

export interface Lobby {
  id: string
  name: string
  game: string
  host: string
  players: LobbyPlayer[]
  maxPlayers: number
  status: LobbyStatus
  isPrivate: boolean
  password?: string
  createdAt: number
}

export interface LobbyPlayer {
  id: string
  name: string
  isReady: boolean
  isHost: boolean
  score: number
  joinedAt: number
}

export class MultiplayerLobby {
  private lobbies = ref<Map<string, Lobby>>(new Map())
  private currentLobby = ref<Lobby | null>(null)
  private playerLobbies = ref<Map<string, string>>(new Map()) // playerId -> lobbyId

  /**
   * Create a new lobby
   */
  createLobby(config: {
    name: string
    game: string
    hostId: string
    hostName: string
    maxPlayers: number
    isPrivate?: boolean
    password?: string
  }): Lobby {
    const lobby: Lobby = {
      id: this.generateId(),
      name: config.name,
      game: config.game,
      host: config.hostId,
      players: [{
        id: config.hostId,
        name: config.hostName,
        isReady: true,
        isHost: true,
        score: 0,
        joinedAt: Date.now()
      }],
      maxPlayers: config.maxPlayers,
      status: 'waiting',
      isPrivate: config.isPrivate || false,
      password: config.password,
      createdAt: Date.now()
    }

    this.lobbies.value.set(lobby.id, lobby)
    this.playerLobbies.value.set(config.hostId, lobby.id)
    this.currentLobby.value = lobby

    return lobby
  }

  /**
   * Join a lobby
   */
  joinLobby(
    lobbyId: string,
    playerId: string,
    playerName: string,
    password?: string
  ): boolean {
    const lobby = this.lobbies.value.get(lobbyId)
    if (!lobby) return false

    // Check password
    if (lobby.isPrivate && lobby.password !== password) {
      return false
    }

    // Check if lobby is full
    if (lobby.players.length >= lobby.maxPlayers) {
      return false
    }

    // Check if player already in lobby
    if (lobby.players.find(p => p.id === playerId)) {
      return false
    }

    // Add player
    lobby.players.push({
      id: playerId,
      name: playerName,
      isReady: false,
      isHost: false,
      score: 0,
      joinedAt: Date.now()
    })

    this.playerLobbies.value.set(playerId, lobbyId)

    return true
  }

  /**
   * Leave a lobby
   */
  leaveLobby(playerId: string): void {
    const lobbyId = this.playerLobbies.value.get(playerId)
    if (!lobbyId) return

    const lobby = this.lobbies.value.get(lobbyId)
    if (!lobby) return

    // Remove player
    lobby.players = lobby.players.filter(p => p.id !== playerId)
    this.playerLobbies.value.delete(playerId)

    // If host leaves, assign new host or close lobby
    if (lobby.host === playerId) {
      if (lobby.players.length > 0) {
        lobby.host = lobby.players[0].id
        lobby.players[0].isHost = true
      } else {
        this.lobbies.value.delete(lobbyId)
      }
    }

    // Update current lobby reference
    if (this.currentLobby.value?.id === lobbyId) {
      this.currentLobby.value = lobby.players.length > 0 ? lobby : null
    }
  }

  /**
   * Set player ready status
   */
  setReady(playerId: string, ready: boolean): boolean {
    const lobbyId = this.playerLobbies.value.get(playerId)
    if (!lobbyId) return false

    const lobby = this.lobbies.value.get(lobbyId)
    if (!lobby) return false

    const player = lobby.players.find(p => p.id === playerId)
    if (!player) return false

    player.isReady = ready

    // Check if all players are ready
    if (lobby.players.every(p => p.isReady) && lobby.players.length >= 2) {
      lobby.status = 'ready'
    } else {
      lobby.status = 'waiting'
    }

    return true
  }

  /**
   * Start the game
   */
  startGame(playerId: string): boolean {
    const lobbyId = this.playerLobbies.value.get(playerId)
    if (!lobbyId) return false

    const lobby = this.lobbies.value.get(lobbyId)
    if (!lobby) return false

    // Only host can start
    if (lobby.host !== playerId) return false

    // Check if all players are ready
    if (!lobby.players.every(p => p.isReady)) return false

    lobby.status = 'in_game'

    return true
  }

  /**
   * Update player score
   */
  updateScore(playerId: string, score: number): void {
    const lobbyId = this.playerLobbies.value.get(playerId)
    if (!lobbyId) return

    const lobby = this.lobbies.value.get(lobbyId)
    if (!lobby) return

    const player = lobby.players.find(p => p.id === playerId)
    if (player) {
      player.score = score
    }
  }

  /**
   * Get current lobby
   */
  getCurrentLobby(): Lobby | null {
    return this.currentLobby.value
  }

  /**
   * Get available lobbies for a game
   */
  getAvailableLobbies(game: string): Lobby[] {
    return Array.from(this.lobbies.value.values()).filter(
      l => l.game === game && l.status === 'waiting' && !l.isPrivate
    )
  }

  /**
   * Get lobby by ID
   */
  getLobby(lobbyId: string): Lobby | undefined {
    return this.lobbies.value.get(lobbyId)
  }

  /**
   * Get player's current lobby
   */
  getPlayerLobby(playerId: string): Lobby | undefined {
    const lobbyId = this.playerLobbies.value.get(playerId)
    return lobbyId ? this.lobbies.value.get(lobbyId) : undefined
  }

  /**
   * Get lobby leaderboard
   */
  getLeaderboard(lobbyId: string): Array<{ name: string; score: number; rank: number }> {
    const lobby = this.lobbies.value.get(lobbyId)
    if (!lobby) return []

    return [...lobby.players]
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        name: player.name,
        score: player.score,
        rank: index + 1
      }))
  }

  /**
   * Close lobby
   */
  closeLobby(lobbyId: string): void {
    const lobby = this.lobbies.value.get(lobbyId)
    if (!lobby) return

    // Remove all players from lobby
    lobby.players.forEach(player => {
      this.playerLobbies.value.delete(player.id)
    })

    this.lobbies.value.delete(lobbyId)

    if (this.currentLobby.value?.id === lobbyId) {
      this.currentLobby.value = null
    }
  }

  /**
   * Kick player from lobby
   */
  kickPlayer(lobbyId: string, hostId: string, playerId: string): boolean {
    const lobby = this.lobbies.value.get(lobbyId)
    if (!lobby) return false

    // Only host can kick
    if (lobby.host !== hostId) return false

    // Can't kick host
    if (playerId === hostId) return false

    const player = lobby.players.find(p => p.id === playerId)
    if (!player) return false

    this.leaveLobby(playerId)
    return true
  }

  private generateId(): string {
    return `lobby_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

let lobbyInstance: MultiplayerLobby | null = null

export function getMultiplayerLobby(): MultiplayerLobby {
  if (!lobbyInstance) {
    lobbyInstance = new MultiplayerLobby()
  }
  return lobbyInstance
}

export function useMultiplayer() {
  const lobby = getMultiplayerLobby()

  return {
    currentLobby: computed(() => lobby.getCurrentLobby()),

    createLobby: lobby.createLobby.bind(lobby),
    joinLobby: lobby.joinLobby.bind(lobby),
    leaveLobby: lobby.leaveLobby.bind(lobby),
    setReady: lobby.setReady.bind(lobby),
    startGame: lobby.startGame.bind(lobby),
    updateScore: lobby.updateScore.bind(lobby),
    getAvailableLobbies: lobby.getAvailableLobbies.bind(lobby),
    getLobby: lobby.getLobby.bind(lobby),
    getPlayerLobby: lobby.getPlayerLobby.bind(lobby),
    getLeaderboard: lobby.getLeaderboard.bind(lobby),
    closeLobby: lobby.closeLobby.bind(lobby),
    kickPlayer: lobby.kickPlayer.bind(lobby)
  }
}
