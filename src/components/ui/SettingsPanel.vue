<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore, type ThemeMode } from '@/stores/settings'
import { useStatsStore } from '@/stores/stats'
import { KEYBOARD_SHORTCUTS } from '@/utils/constants'
import {
  Settings,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Monitor,
  HelpCircle,
  Trophy,
  RotateCcw,
  X,
  Gamepad2,
} from 'lucide-vue-next'

const settings = useSettingsStore()
const stats = useStatsStore()

const isOpen = computed({
  get: () => settings.showHelp,
  set: (value) => (settings.showHelp = value),
})

const themeOptions = [
  { value: 'dark' as const, label: 'Dark', icon: Moon },
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'system' as const, label: 'System', icon: Monitor },
]

function close() {
  settings.showHelp = false
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="close"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div
          class="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto"
          role="document"
        >
          <header class="flex items-center justify-between p-6 border-b border-white/10">
            <div class="flex items-center space-x-3">
              <Settings :size="24" class="text-flux-neon" />
              <h2 id="settings-title" class="text-xl font-bold text-white uppercase italic tracking-wider">SYSTEM_CONFIG</h2>
            </div>
            <button
              @click="close"
              class="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              aria-label="Close settings"
            >
              <X :size="20" />
            </button>
          </header>

          <div class="p-6 space-y-8">
            <section aria-labelledby="audio-section">
              <h3 id="audio-section" class="flex items-center space-x-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                <Volume2 :size="16" />
                <span>Audio</span>
              </h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <span class="text-white font-medium">Sound Effects</span>
                  <button
                    @click="settings.toggleSound()"
                    class="relative w-14 h-7 rounded-none transition-colors border"
                    :class="settings.soundEnabled ? 'bg-flux-neon border-flux-neon' : 'bg-flux-card border-slate-700'"
                    role="switch"
                    :aria-checked="settings.soundEnabled"
                  >
                    <span
                      class="absolute top-1 left-1 w-5 h-5 bg-white rounded-none shadow transition-transform"
                      :class="settings.soundEnabled ? 'translate-x-7' : 'translate-x-0'"
                    />
                  </button>
                </div>
                <div class="p-4 bg-white/5 rounded-xl">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-white font-medium">Volume</span>
                    <span class="text-sm text-slate-400">{{ settings.volume }}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    :value="settings.volume"
                    @input="settings.setVolume(($event.target as HTMLInputElement).valueAsNumber)"
                    class="w-full h-2 bg-slate-700 rounded-none appearance-none cursor-pointer accent-flux-neon"
                    aria-label="Volume slider"
                  />
                </div>
              </div>
            </section>

            <section aria-labelledby="theme-section">
              <h3 id="theme-section" class="flex items-center space-x-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                <Sun :size="16" />
                <span>Theme</span>
              </h3>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="option in themeOptions"
                  :key="option.value"
                  @click="settings.setTheme(option.value)"
                  class="flex flex-col items-center p-4 rounded-none transition-all border"
                  :class="settings.theme === option.value
                    ? 'border-flux-neon bg-flux-neon/10 text-flux-neon shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                    : 'border-white/10 hover:border-white/30 bg-white/5'"
                  :aria-pressed="settings.theme === option.value"
                >
                  <component :is="option.icon" :size="20" class="mb-2" />
                  <span class="text-[10px] font-bold uppercase tracking-widest">{{ option.label }}</span>
                </button>
              </div>
            </section>

            <section aria-labelledby="stats-section">
              <h3 id="stats-section" class="flex items-center space-x-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                <Trophy :size="16" />
                <span>Statistics</span>
              </h3>
              <div class="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl">
                <div class="text-center">
                  <div class="text-2xl font-bold text-white">{{ stats.totalGames }}</div>
                  <div class="text-xs text-slate-500 uppercase tracking-wider">Games Played</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-arcade-neon">{{ stats.winRate }}%</div>
                  <div class="text-xs text-slate-500 uppercase tracking-wider">Win Rate</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-amber-500">{{ stats.totalWins }}</div>
                  <div class="text-xs text-slate-500 uppercase tracking-wider">Total Wins</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-arcade-gold">{{ stats.formatPlayTime() }}</div>
                  <div class="text-xs text-slate-500 uppercase tracking-wider">Play Time</div>
                </div>
              </div>
              <button
                @click="stats.resetStats()"
                class="mt-4 w-full flex items-center justify-center space-x-2 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-none transition-colors border border-red-500/30"
              >
                <RotateCcw :size="16" />
                <span class="text-sm font-medium">Reset Statistics</span>
              </button>
            </section>

            <section aria-labelledby="help-section">
              <h3 id="help-section" class="flex items-center space-x-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                <Gamepad2 :size="16" />
                <span>Controls</span>
              </h3>
              <div class="space-y-2">
                <div
                  v-for="shortcut in KEYBOARD_SHORTCUTS"
                  :key="shortcut.action"
                  class="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <span class="text-sm text-slate-400">{{ shortcut.action }}</span>
                  <kbd class="px-3 py-1 text-xs font-mono text-white bg-white/10 rounded">{{ shortcut.key }}</kbd>
                </div>
              </div>
            </section>
          </div>

          <footer class="p-6 border-t border-white/10 text-center">
            <p class="text-[10px] text-flux-neon/40 uppercase tracking-[0.3em]">
              FLUX_ARCADE v1.0 // CORE_SYSTEM
            </p>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
