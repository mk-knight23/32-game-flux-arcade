<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useArcadeStore, GAME_COSTS, getDailyChallengeGame } from '../stores/arcade'
import {
  Gamepad2,
  Trophy,
  Zap,
  Lock,
  Play,
  Search,
  Activity,
  Sparkles,
  UtensilsCrossed,
  Calendar,
  Gift
} from 'lucide-vue-next'

const router = useRouter()
const store = useArcadeStore()
const unlockingGame = ref<string | null>(null)

const games = [
  { id: 'clumsy-cat', title: 'Cat Chaos', category: 'Survival', difficulty: 'Normal', icon: Zap, color: 'from-blue-500 to-indigo-600' },
  { id: 'senior-dance', title: 'Senior Dance', category: 'Rhythm', difficulty: 'Hard', icon: Activity, color: 'from-pink-500 to-rose-600' },
  { id: 'food-frenzy', title: 'Food Frenzy', category: 'Arcade', difficulty: 'Normal', icon: UtensilsCrossed, color: 'from-orange-400 to-amber-600' }
]

// V2: Daily challenge
const dailyGameId = computed(() => getDailyChallengeGame())
const dailyGame = computed(() => games.find(g => g.id === dailyGameId.value))
const dailyCompleted = computed(() => store.dailyChallenge.lastPlayed === new Date().toISOString().split('T')[0])

function isGameUnlocked(gameId: string) {
  return store.isGameUnlocked(gameId)
}

function getGameCost(gameId: string) {
  return store.getGameCost(gameId)
}

function canUnlock(gameId: string) {
  return store.canUnlockGame(gameId)
}

function handleUnlock(gameId: string) {
  if (canUnlock(gameId)) {
    unlockingGame.value = gameId
    setTimeout(() => {
      store.unlockGame(gameId)
      unlockingGame.value = null
    }, 300)
  }
}

function playGame(gameId: string) {
  if (isGameUnlocked(gameId)) {
    router.push('/play/' + gameId)
  }
}
</script>

<template>
  <div class="min-h-screen p-10 lg:p-20 space-y-20 pixel-grid bg-arcade-hub overflow-y-auto custom-scrollbar">

    <!-- Lobby Header -->
    <header class="flex justify-between items-end">
       <div class="space-y-7">
          <div class="flex items-center space-x-4">
             <div class="bg-arcade-neon p-2 rounded-xl rotate-3 shadow-lg shadow-arcade-neon/20">
                <Gamepad2 class="text-black" :size="24" />
             </div>
             <h1 class="text-3xl font-display font-black tracking-tighter uppercase dark:text-white italic">Arcade<span class="text-arcade-neon">Hub.</span></h1>
          </div>
          <div class="flex items-center space-x-11">
             <div class="flex flex-col">
                <span class="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Global Tickets</span>
                <span class="text-2xl font-game text-arcade-gold">{{ store.totalTickets }}</span>
             </div>
             <div class="h-10 w-px bg-white/5 dark:bg-white/10"></div>
             <div class="flex flex-col">
                <span class="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Games Unlocked</span>
                <span class="text-2xl font-game text-arcade-neon uppercase">{{ store.unlockedGames.length }}/{{ games.length }}</span>
             </div>
          </div>
       </div>

       <div class="hidden md:flex relative group pointer-events-auto">
          <Search class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" :size="18" />
          <input type="text" placeholder="Find a game..." class="bg-arcade-card/40 border border-white/5 dark:bg-white/5 rounded-2xl pl-14 pr-9 py-3 text-xs font-bold outline-none focus:border-arcade-neon transition-all text-white dark:placeholder:text-slate-500">
       </div>
    </header>

    <!-- V2: Daily Challenge Banner -->
    <section v-if="dailyGame" class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-purple-500/20 rounded-2xl">
            <Calendar class="text-purple-400" :size="24" />
          </div>
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-purple-400">Daily Challenge</p>
            <h2 class="text-xl font-display font-black text-white">
              Play <span class="text-purple-400">{{ dailyGame.title }}</span> for 2x Tickets
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              {{ dailyCompleted ? 'Come back tomorrow for the next challenge!' : 'First play today earns double tickets!' }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div v-if="!dailyCompleted" class="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-xl">
            <Gift class="text-purple-400" :size="16" />
            <span class="text-sm font-black text-purple-400">2x Bonus Active</span>
          </div>
          <div v-else class="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-xl">
            <Sparkles class="text-slate-400" :size="16" />
            <span class="text-sm font-black text-slate-400">Completed Today</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Game Discovery Grid -->
    <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
       <div v-for="game in games" :key="game.id" class="glass-card group cursor-pointer overflow-hidden relative" @click="playGame(game.id)">
          <!-- Lock Overlay -->
          <div
            v-if="!isGameUnlocked(game.id)"
            class="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4"
            @click.stop
          >
             <Lock :size="32" class="text-slate-500" />
             <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ getGameCost(game.id) }} Tickets</p>
             <button
               @click="handleUnlock(game.id)"
               :disabled="!canUnlock(game.id) || unlockingGame !== null"
               class="px-6 py-2 font-black uppercase text-[10px] rounded-lg tracking-widest transition-all flex items-center space-x-2"
               :class="canUnlock(game.id) ? 'bg-white text-black hover:bg-arcade-neon' : 'bg-slate-700 text-slate-500 cursor-not-allowed'"
             >
               <Sparkles v-if="unlockingGame === game.id" :size="14" class="animate-spin" />
               <span>{{ canUnlock(game.id) ? 'Unlock Now' : 'Need More Tickets' }}</span>
             </button>
          </div>

          <div class="h-64 bg-gradient-to-br p-10 flex items-center justify-center transition-all duration-700 group-hover:scale-110 relative" :class="game.color">
             <!-- V2: Daily challenge badge -->
             <div v-if="game.id === dailyGameId" class="absolute top-4 left-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <span class="text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1">
                  <Gift :size="10" /> Daily
                </span>
             </div>
             <component :is="game.icon" :size="80" class="text-white drop-shadow-2xl opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>

          <div class="p-10 space-y-8">
             <div class="flex justify-between items-start">
                <div class="space-y-1">
                   <span class="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{{ game.category }} // {{ game.difficulty }}</span>
                   <h3 class="text-3xl font-display font-black uppercase italic text-white dark:text-white tracking-tight">{{ game.title }}</h3>
                </div>
                <div class="p-3 bg-white/5 dark:bg-white/5 rounded-xl border border-white/5">
                   <Trophy :size="18" class="text-arcade-gold" />
                </div>
             </div>

             <div class="flex items-center justify-between pt-6 border-t border-white/5 dark:border-white/10">
                <div class="flex flex-col">
                   <span class="text-[8px] font-black uppercase text-slate-600 dark:text-slate-400">Personal Best</span>
                   <span class="text-sm font-game text-white dark:text-white">{{ store.highScores[game.id] || 0 }}</span>
                </div>
                <div class="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                     :class="isGameUnlocked(game.id) ? 'bg-white text-black hover:bg-arcade-neon hover:scale-110 cursor-pointer' : 'bg-slate-700 text-slate-500 cursor-not-allowed'">
                   <Play fill="currentColor" :size="20" class="ml-1" />
                </div>
             </div>
          </div>
       </div>
    </section>

    <!-- Footer Branding -->
    <footer class="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-slate-600 dark:text-slate-500">
      <span>© 2026 Made by MK — Built by Musharraf Kazi</span>
      <a href="https://github.com/mk-knight23" target="_blank" rel="noopener noreferrer" class="hover:text-arcade-neon transition-colors">GitHub</a>
    </footer>

  </div>
</template>
