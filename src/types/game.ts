export type GameID = 'clumsy-cat' | 'dance-battle' | 'food-fight' | 'office-prank' | 'zombie-defenders'

export interface GameInfo {
  id: GameID
  title: string
  description: string
  icon: string
  color: string
  highScore: number
}

export interface UserStats {
  gamesPlayed: number
  totalScore: number
  achievements: string[]
}

export interface GameResult {
  score: number
  level: number
  duration: number
}
