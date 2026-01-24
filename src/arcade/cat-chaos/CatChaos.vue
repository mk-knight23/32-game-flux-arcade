<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Heart } from 'lucide-vue-next'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

const gameState = ref('idle')
const score = ref(0)
let animationId: any = null

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    draw()
  }
})

function startGame() {
  gameState.value = 'playing'
  score.value = 0
  gameLoop()
}

function gameLoop() {
  if (gameState.value !== 'playing') return
  score.value += 1
  draw()
  animationId = requestAnimationFrame(gameLoop)
}

function draw() {
  if (!ctx || !canvasRef.value) return
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 350, 800, 50)

  // Draw Cat Mock (High-res neon)
  ctx.shadowBlur = 20
  ctx.shadowColor = '#38bdf8'
  ctx.fillStyle = '#38bdf8'
  ctx.fillRect(100, 310, 40, 40)
}

onUnmounted(() => cancelAnimationFrame(animationId))
</script>

<template>
  <div class="space-y-10 flex flex-col items-center">
     <div class="glass-card p-6 flex justify-between items-center w-full max-w-4xl">
        <div class="flex items-center space-x-6">
           <div class="flex flex-col">
              <span class="text-[8px] font-black uppercase text-slate-500 tracking-widest text-white opacity-40">Active Multiplier</span>
              <span class="text-2xl font-game text-arcade-neon">{{ score }}</span>
           </div>
        </div>
        <div class="flex items-center space-x-2">
           <Heart v-for="i in 3" :key="i" :size="14" class="text-arcade-danger fill-current" />
        </div>
     </div>

     <div class="relative glass-card p-4 border-2 border-white/5 shadow-2xl">
        <canvas ref="canvasRef" width="800" height="400" class="bg-black/40 rounded-2xl"></canvas>
        
        <div v-if="gameState === 'idle'" class="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
           <button @click="startGame" class="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-arcade-neon transition-all pointer-events-auto">
              Initialize Matrix
           </button>
        </div>
     </div>
  </div>
</template>
