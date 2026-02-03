<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useArcadeStore } from '../stores/arcade'
import {
  Trophy,
  Star,
  Award,
  Target,
  Lock,
  CheckCircle
} from 'lucide-vue-next'

const gameStore = useGameStore()
const arcadeStore = useArcadeStore()

const achievements = computed(() => [
  {
    id: 'first-game',
    title: 'First Game',
    description: 'Play your first game',
    icon: Star,
    color: 'text-flux-cyan',
    bg: 'bg-flux-cyan/20',
    borderColor: 'border-flux-cyan/30',
    requirement: gameStore.gamesPlayed >= 1,
    unlocked: gameStore.gamesPlayed >= 1
  },
  {
    id: 'high-scorer',
    title: 'High Scorer',
    description: 'Score above 100 points',
    icon: Trophy,
    color: 'text-flux-pink',
    bg: 'bg-flux-pink/20',
    borderColor: 'border-flux-pink/30',
    requirement: gameStore.highScore >= 100,
    unlocked: gameStore.highScore >= 100
  },
  {
    id: 'persistent',
    title: 'Persistent',
    description: 'Play 10 games',
    icon: Award,
    color: 'text-flux-neon',
    bg: 'bg-flux-neon/20',
    borderColor: 'border-flux-neon/30',
    requirement: gameStore.gamesPlayed >= 10,
    unlocked: gameStore.gamesPlayed >= 10
  },
  {
    id: 'game-collector',
    title: 'Game Collector',
    description: 'Unlock all games',
    icon: Trophy,
    color: 'text-flux-gold',
    bg: 'bg-flux-gold/20',
    borderColor: 'border-flux-gold/30',
    requirement: arcadeStore.unlockedGames.length >= 3,
    unlocked: arcadeStore.unlockedGames.length >= 3
  },
  {
    id: 'century',
    title: 'Century',
    description: 'Score 200 points',
    icon: Target,
    color: 'text-flux-cyan',
    bg: 'bg-flux-cyan/20',
    borderColor: 'border-flux-cyan/30',
    requirement: gameStore.highScore >= 200,
    unlocked: gameStore.highScore >= 200
  },
  {
    id: 'veteran',
    title: 'Veteran',
    description: 'Play 25 games',
    icon: Award,
    color: 'text-flux-neon',
    bg: 'bg-flux-neon/20',
    borderColor: 'border-flux-neon/30',
    requirement: gameStore.gamesPlayed >= 25,
    unlocked: gameStore.gamesPlayed >= 25
  }
])

const unlockedCount = computed(() => achievements.value.filter(a => a.unlocked).length)
const progress = computed(() => (unlockedCount.value / achievements.value.length) * 100)
</script>

<template>
  <div class="min-h-screen p-10 lg:p-20 space-y-20 pixel-grid bg-flux-bg overflow-y-auto custom-scrollbar">

    <!-- Header -->
    <header class="flex justify-between items-end">
      <div class="space-y-7">
        <div class="flex items-center space-x-4">
          <div class="bg-flux-neon p-2 rounded-none rotate-3 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Trophy class="text-black" :size="24" />
          </div>
          <h1 class="text-3xl font-display font-black tracking-tighter uppercase dark:text-white italic">
            ACHIEVEMENTS <span class="text-flux-neon">GALLERY</span>
          </h1>
        </div>
        <p class="text-flux-neon/60 text-sm font-mono uppercase tracking-widest">
          Neural Milestones // Quantum Progress Tracking
        </p>
      </div>
    </header>

    <!-- Progress Overview -->
    <div class="glass-card p-8 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-display font-bold uppercase tracking-widest text-white">Your Progress</h2>
        <span class="text-sm font-black text-flux-cyan uppercase tracking-widest">
          {{ unlockedCount }}/{{ achievements.length }} Unlocked
        </span>
      </div>

      <div class="w-full bg-flux-card rounded-full h-2 border border-flux-neon/20">
        <div
          class="bg-gradient-to-r from-flux-cyan to-flux-pink h-2 rounded-full transition-all duration-500"
          :style="{ width: `${progress}%` }"
        />
      </div>

      <div class="flex justify-between text-xs text-flux-neon/60">
        <span>{{ progress.toFixed(1) }}% Complete</span>
        <span>{{ achievements.length - unlockedCount }} Remaining</span>
      </div>
    </div>

    <!-- Achievements Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="achievement in achievements"
        :key="achievement.id"
        class="glass-card group overflow-hidden relative transition-all duration-300 hover:scale-105"
        :class="achievement.unlocked ? 'achievement-unlocked' : 'opacity-60'"
      >
        <!-- Unlock Animation -->
        <div
          v-if="achievement.unlocked"
          class="absolute inset-0 bg-gradient-to-r from-flux-cyan/20 to-flux-pink/20 z-10 animate-pulse"
        />

        <div class="relative z-20 p-8 space-y-6">
          <!-- Icon -->
          <div class="flex justify-center">
            <div
              class="p-4 rounded-full border-2"
              :class="achievement.unlocked ? achievement.bg + ' ' + achievement.borderColor + ' shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-flux-card border-flux-neon/20'"
            >
              <component
                :is="achievement.icon"
                :size="32"
                :class="achievement.unlocked ? achievement.color : 'text-flux-neon/30'"
              />
            </div>
          </div>

          <!-- Title and Description -->
          <div class="text-center space-y-2">
            <h3
              class="text-lg font-display font-bold uppercase tracking-widest"
              :class="achievement.unlocked ? 'text-white' : 'text-flux-neon/60'"
            >
              {{ achievement.title }}
            </h3>
            <p
              class="text-xs text-slate-400"
              :class="achievement.unlocked ? 'text-slate-400' : 'text-slate-600'"
            >
              {{ achievement.description }}
            </p>
          </div>

          <!-- Status -->
          <div class="text-center">
            <div
              v-if="achievement.unlocked"
              class="inline-flex items-center gap-1 px-3 py-1 bg-flux-neon/20 rounded-full border border-flux-neon/50"
            >
              <CheckCircle :size="14" class="text-flux-neon" />
              <span class="text-xs font-black text-flux-neon uppercase tracking-widest">UNLOCKED</span>
            </div>
            <div
              v-else
              class="inline-flex items-center gap-1 px-3 py-1 bg-flux-card rounded-full border border-flux-neon/20"
            >
              <Lock :size="14" class="text-flux-neon/30" />
              <span class="text-xs font-black text-flux-neon/60 uppercase tracking-widest">LOCKED</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-slate-600 dark:text-slate-500">
      <span>© 2026 Made by MK — Built by Musharraf Kazi</span>
      <a href="https://github.com/mk-knight23" target="_blank" rel="noopener noreferrer" class="hover:text-arcade-neon transition-colors">GitHub</a>
    </footer>
  </div>
</template>

<style scoped>
.achievement-unlocked {
  border: 1px solid;
  border-image: linear-gradient(45deg, #06b6d4, #ec4899) 1;
}
</style>