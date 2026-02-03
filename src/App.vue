<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { watch, computed } from 'vue'
import { useSettingsStore } from './stores/settings'
import { useGameStore } from './stores/gameStore'
import { useKeyboardControls } from './composables/useKeyboardControls'
import SettingsPanel from './components/ui/SettingsPanel.vue'
import { useRouter } from 'vue-router'

useHead({
  title: 'FLUX_ARCADE // Quantum Hub',
  meta: [{ name: 'description', content: 'A modular quantum arcade collection powered by Flux Engine.' }]
})

const settings = useSettingsStore()
const gameStore = useGameStore()
const router = useRouter()
const { lastAction, clearAction } = useKeyboardControls()

// Check if we should show navigation
const showNavigation = computed(() => {
  const path = router.currentRoute.value.path
  return path === '/' || path === '/stats' || path === '/achievements'
})

router.afterEach(() => {
  settings.showHelp = false
})

watch(lastAction, (action) => {
  if (action === 'back' && settings.showHelp) {
    settings.showHelp = false
  }
  setTimeout(clearAction, 100)
})
</script>

<template>
  <SettingsPanel />

  <!-- Navigation -->
  <nav v-if="showNavigation" class="fixed top-0 left-0 right-0 z-50 bg-flux-card/80 backdrop-blur-sm border-b border-flux-neon/20 p-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          @click="router.push('/')"
          class="flex items-center gap-2 text-flux-neon hover:text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="font-display font-bold uppercase text-sm">FLUX_ARCADE</span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="router.push('/')"
          class="px-4 py-2 text-xs font-black uppercase tracking-widest transition-all hover:text-flux-cyan"
          :class="router.currentRoute.value.path === '/' ? 'text-flux-neon' : 'text-flux-neon/60'"
        >
          PLAY
        </button>
        <button
          @click="router.push('/stats')"
          class="px-4 py-2 text-xs font-black uppercase tracking-widest transition-all hover:text-flux-cyan"
          :class="router.currentRoute.value.path === '/stats' ? 'text-flux-neon' : 'text-flux-neon/60'"
        >
          STATS
        </button>
        <button
          @click="router.push('/achievements')"
          class="px-4 py-2 text-xs font-black uppercase tracking-widest transition-all hover:text-flux-cyan"
          :class="router.currentRoute.value.path === '/achievements' ? 'text-flux-neon' : 'text-flux-neon/60'"
        >
          ACHIEVEMENTS
        </button>
      </div>
    </div>
  </nav>

  <router-view v-slot="{ Component }">
    <transition name="arcade-fade" mode="out-in">
       <component :is="Component" />
    </transition>
  </router-view>
</template>