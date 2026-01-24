export const STORAGE_KEYS = {
  SETTINGS: 'arcade-settings',
  STATS: 'arcade-stats',
  GAME: 'arcade-game',
} as const

export const KEYBOARD_SHORTCUTS = [
  { key: 'Escape', action: 'Back / Close' },
  { key: 'H', action: 'Toggle Help' },
  { key: 'S', action: 'Toggle Settings' },
  { key: 'M', action: 'Toggle Sound' },
] as const
