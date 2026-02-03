<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useArcadeStore } from '../stores/arcade'
import {
  BarChart3,
  TrendingUp,
  Trophy,
  Target,
  Calendar,
  Zap
} from 'lucide-vue-next'

const gameStore = useGameStore()
const arcadeStore = useArcadeStore()

const averageScore = computed(() => {
  if (gameStore.scores.length === 0) return 0
  return Math.round(gameStore.scores.reduce((a, b) => a + b, 0) / gameStore.scores.length)
})

const totalGamesPlayed = computed(() => {
  return gameStore.gamesPlayed
})

const unlockedGamesCount = computed(() => {
  return arcadeStore.unlockedGames.length
})

const totalTickets = computed(() => {
  return arcadeStore.totalTickets
})

const recentScores = computed(() => {
  return gameStore.scores.slice(-10).reverse()
})
</script>

<template>
  <div class="min-h-screen p-10 lg:p-20 space-y-20 pixel-grid bg-flux-bg overflow-y-auto custom-scrollbar">

    <!-- Header -->
    <header class="flex justify-between items-end">
      <div class="space-y-7">
        <div class="flex items-center space-x-4">
          <div class="bg-flux-neon p-2 rounded-none rotate-3 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <BarChart3 class="text-black" :size="24" />
          </div>
          <h1 class="text-3xl font-display font-black tracking-tighter uppercase dark:text-white italic">
            PERFORMANCE <span class="text-flux-neon">ANALYTICS</span>
          </h1>
        </div>
        <p class="text-flux-neon/60 text-sm font-mono uppercase tracking-widest">
          Comprehensive Metrics // Neural Progress Tracking
        </p>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

      <!-- Total Games -->
      <div class="glass-card p-8 space-y-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-flux-neon/20 rounded-none border border-flux-neon/30">
            <Calendar class="text-flux-neon" :size="20" />
          </div>
          <h3 class="text-sm font-display font-bold uppercase tracking-widest text-white">Total Games</h3>
        </div>
        <p class="text-4xl font-display font-black text-flux-cyan">{{ totalGamesPlayed }}</p>
        <p class="text-xs text-flux-neon/60">{{ unlockedGamesCount }} games unlocked</p>
      </div>

      <!-- High Score -->
      <div class="glass-card p-8 space-y-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-flux-pink/20 rounded-none border border-flux-pink/30">
            <Trophy class="text-flux-pink" :size="20" />
          </div>
          <h3 class="text-sm font-display font-bold uppercase tracking-widest text-white">High Score</h3>
        </div>
        <p class="text-4xl font-display font-black text-flux-pink">{{ gameStore.highScore }}</p>
        <p class="text-xs text-flux-neon/60">Personal best</p>
      </div>

      <!-- Average Score -->
      <div class="glass-card p-8 space-y-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-flux-cyan/20 rounded-none border border-flux-cyan/30">
            <TrendingUp class="text-flux-cyan" :size="20" />
          </div>
          <h3 class="text-sm font-display font-bold uppercase tracking-widest text-white">Average Score</h3>
        </div>
        <p class="text-4xl font-display font-black text-flux-cyan">{{ averageScore }}</p>
        <p class="text-xs text-flux-neon/60">All time</p>
      </div>

      <!-- Total Tickets -->
      <div class="glass-card p-8 space-y-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-flux-gold/20 rounded-none border border-flux-gold/30">
            <Zap class="text-flux-gold" :size="20" />
          </div>
          <h3 class="text-sm font-display font-bold uppercase tracking-widest text-white">Total Tickets</h3>
        </div>
        <p class="text-4xl font-display font-black text-flux-gold">{{ totalTickets }}</p>
        <p class="text-xs text-flux-neon/60">Arcade currency</p>
      </div>
    </div>

    <!-- Recent Scores -->
    <div class="glass-card p-8 space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-display font-bold uppercase tracking-widest text-white">Recent Scores</h2>
        <button
          @click="gameStore.resetStats"
          class="text-xs font-black uppercase tracking-widest text-flux-pink hover:text-flux-pink/80 transition-colors"
        >
          Reset Stats
        </button>
      </div>

      <div v-if="recentScores.length > 0" class="space-y-3">
        <div
          v-for="(score, index) in recentScores"
          :key="index"
          class="flex items-center justify-between p-4 bg-flux-card/50 rounded-none border border-flux-neon/10"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-none bg-flux-neon/20 border border-flux-neon/30 flex items-center justify-center">
              <span class="text-xs font-black text-flux-neon">#{{ totalGamesPlayed - index }}</span>
            </div>
            <span class="text-sm text-slate-400">Game {{ totalGamesPlayed - index }}</span>
          </div>
          <span class="text-2xl font-display font-bold text-flux-cyan">{{ score }}</span>
        </div>
      </div>

      <div v-else class="text-center py-12 text-slate-600">
        <Target :size="48" class="mx-auto mb-4 opacity-50" />
        <p>No games played yet</p>
        <p class="text-sm mt-2">Start playing to see your progress!</p>
      </div>
    </div>

    <!-- Footer -->
    <footer class="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-slate-600 dark:text-slate-500">
      <span>© 2026 Made by MK — Built by Musharraf Kazi</span>
      <a href="https://github.com/mk-knight23" target="_blank" rel="noopener noreferrer" class="hover:text-arcade-neon transition-colors">GitHub</a>
    </footer>
  </div>
</template>