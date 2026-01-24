import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { STORAGE_KEYS } from '@/utils/constants'

export type ThemeMode = 'dark' | 'light' | 'system'

export const useSettingsStore = defineStore('settings', () => {
  const soundEnabled = ref<boolean>(true)
  const theme = ref<ThemeMode>('dark')
  const showHelp = ref<boolean>(false)
  const reducedMotion = ref<boolean>(false)
  const volume = ref<number>(80)

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (stored) {
        const data = JSON.parse(stored)
        soundEnabled.value = data.soundEnabled ?? true
        theme.value = data.theme ?? 'dark'
        reducedMotion.value = data.reducedMotion ?? false
        volume.value = data.volume ?? 80
      }
    } catch (e) {
      console.warn('Failed to load settings:', e)
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify({
          soundEnabled: soundEnabled.value,
          theme: theme.value,
          reducedMotion: reducedMotion.value,
          volume: volume.value,
        })
      )
    } catch (e) {
      console.warn('Failed to save settings:', e)
    }
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
    saveToStorage()
  }

  function setTheme(value: ThemeMode) {
    theme.value = value
    applyTheme()
    saveToStorage()
  }

  function applyTheme() {
    const isDark =
      theme.value === 'dark' ||
      (theme.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }

  function toggleHelp() {
    showHelp.value = !showHelp.value
  }

  function setVolume(value: number) {
    volume.value = value
    saveToStorage()
  }

  return {
    soundEnabled,
    theme,
    showHelp,
    reducedMotion,
    volume,
    loadFromStorage,
    saveToStorage,
    toggleSound,
    setTheme,
    applyTheme,
    toggleHelp,
    setVolume,
  }
})
