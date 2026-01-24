<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, Maximize2 } from 'lucide-vue-next'
import CatChaos from '../arcade/cat-chaos/CatChaos.vue'

const props = defineProps<{ id: string }>()
const router = useRouter()
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-black overflow-hidden relative">
    
    <!-- Chamber Nav -->
    <nav class="h-20 border-b border-white/5 px-10 flex items-center justify-between absolute top-0 w-full z-50 bg-black/40 backdrop-blur-md pointer-events-auto">
       <button @click="router.push('/')" class="flex items-center space-x-3 text-slate-500 hover:text-white transition-all">
          <ChevronLeft :size="20" />
          <span class="text-[10px] font-black uppercase tracking-widest">Back to Lobby</span>
       </button>
       <div class="flex items-center space-x-3">
          <span class="text-[10px] font-black uppercase tracking-[0.4em] text-arcade-neon italic">{{ id }} Chamber</span>
       </div>
       <div class="flex items-center space-x-4">
          <button class="p-2.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all">
             <Maximize2 :size="18" />
          </button>
       </div>
    </nav>

    <!-- Game Mount Point -->
    <main class="flex-1 flex items-center justify-center pt-20">
       <CatChaos v-if="id === 'clumsy-cat'" />
       <div v-else class="text-center space-y-4">
          <h2 class="text-3xl font-display font-black text-white italic uppercase tracking-tighter">Engine Not Configured</h2>
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Neural Link Offline for {{ id }}</p>
       </div>
    </main>

  </div>
</template>
