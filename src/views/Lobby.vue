<script setup lang="ts">
import { ref } from 'vue'
import { useArcadeStore } from '../stores/arcade'
import { 
  Gamepad2, 
  Trophy, 
  Zap, 
  Lock, 
  Play, 
  Search,
  Activity
} from 'lucide-vue-next'

const store = useArcadeStore()
const games = [
  { id: 'clumsy-cat', title: 'Cat Chaos', category: 'Survival', difficulty: 'Normal', icon: Zap, color: 'from-blue-500 to-indigo-600' },
  { id: 'dance-battle', title: 'Senior Dance', category: 'Rhythm', difficulty: 'Hard', icon: Activity, color: 'from-pink-500 to-rose-600' },
  { id: 'food-fight', title: 'Food Frenzy', category: 'Arcade', difficulty: 'Normal', icon: Activity, color: 'from-orange-400 to-amber-600' }
]
</script>

<template>
  <div class="min-h-screen p-10 lg:p-20 space-y-20 pixel-grid bg-arcade-hub overflow-y-auto custom-scrollbar">
    
    <!-- Lobby Header -->
    <header class="flex justify-between items-end">
       <div class="space-y-6">
          <div class="flex items-center space-x-3">
             <div class="bg-arcade-neon p-2 rounded-xl rotate-3 shadow-lg shadow-arcade-neon/20">
                <Gamepad2 class="text-black" :size="24" />
             </div>
             <h1 class="text-3xl font-display font-black tracking-tighter uppercase dark:text-white italic">Arcade<span class="text-arcade-neon">Hub.</span></h1>
          </div>
          <div class="flex items-center space-x-10">
             <div class="flex flex-col">
                <span class="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 text-white opacity-40">Global Tickets</span>
                <span class="text-2xl font-game text-arcade-gold">{{ store.totalTickets }}</span>
             </div>
             <div class="h-10 w-px bg-white/5"></div>
             <div class="flex flex-col">
                <span class="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 text-white opacity-40">Rank Progress</span>
                <span class="text-2xl font-game text-arcade-neon uppercase">Level 12</span>
             </div>
          </div>
       </div>

       <div class="hidden md:flex relative group pointer-events-auto">
          <Search class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" :size="18" />
          <input type="text" placeholder="Search Machine..." class="bg-arcade-card/40 border border-white/5 rounded-2xl pl-14 pr-8 py-3 text-xs font-bold outline-none focus:border-arcade-neon transition-all text-white">
       </div>
    </header>

    <!-- Game Discovery Grid -->
    <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
       <div v-for="game in games" :key="game.id" class="glass-card group cursor-pointer overflow-hidden relative">
          <div v-if="!store.unlockedGames.includes(game.id)" class="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
             <Lock :size="32" class="text-slate-500" />
             <button class="px-6 py-2 bg-white text-black font-black uppercase text-[10px] rounded-lg tracking-widest hover:bg-arcade-neon transition-all">Unlock // 500 TKT</button>
          </div>

          <div class="h-64 bg-gradient-to-br p-10 flex items-center justify-center transition-all duration-700 group-hover:scale-110" :class="game.color">
             <component :is="game.icon" :size="80" class="text-white drop-shadow-2xl opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>

          <div class="p-10 space-y-8">
             <div class="flex justify-between items-start">
                <div class="space-y-1">
                   <span class="text-[8px] font-black uppercase tracking-widest text-slate-500">{{ game.category }} // {{ game.difficulty }}</span>
                   <h3 class="text-3xl font-display font-black uppercase italic text-white tracking-tight">{{ game.title }}</h3>
                </div>
                <div class="p-3 bg-white/5 rounded-xl border border-white/5">
                   <Trophy :size="18" class="text-arcade-gold" />
                </div>
             </div>
             
             <div class="flex items-center justify-between pt-6 border-t border-white/5">
                <div class="flex flex-col">
                   <span class="text-[8px] font-black uppercase text-slate-600">Personal Best</span>
                   <span class="text-sm font-game text-white">{{ store.highScores[game.id] || 0 }}</span>
                </div>
                <router-link :to="'/play/' + game.id" class="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-arcade-neon transition-all hover:scale-110">
                   <Play fill="currentColor" :size="20" class="ml-1" />
                </router-link>
             </div>
          </div>
       </div>
    </section>

  </div>
</template>
