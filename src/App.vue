<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { watch } from 'vue'
import { useSettingsStore } from './stores/settings'
import { useStatsStore } from './stores/stats'
import { useKeyboardControls } from './composables/useKeyboardControls'
import SettingsPanel from './components/ui/SettingsPanel.vue'
import { useRouter } from 'vue-router'

useHead({
  title: 'FLUX_ARCADE // Quantum Hub',
  meta: [{ name: 'description', content: 'A modular quantum arcade collection powered by Flux Engine.' }]
})

const settings = useSettingsStore()
const stats = useStatsStore()
const router = useRouter()
const { lastAction, clearAction } = useKeyboardControls()

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
  <router-view v-slot="{ Component }">
    <transition name="arcade-fade" mode="out-in">
       <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
.arcade-fade-enter-active,
.arcade-fade-leave-active {
  transition: all 0.4s ease;
}
.arcade-fade-enter-from {
  opacity: 0;
  transform: scale(0.98);
}
.arcade-fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>
