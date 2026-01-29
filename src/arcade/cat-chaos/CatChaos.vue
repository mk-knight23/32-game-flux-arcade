<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Heart, Trophy, Zap } from 'lucide-vue-next'
import { useArcadeStore } from '@/stores/arcade'

const arcadeStore = useArcadeStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

const gameState = ref<'idle' | 'playing' | 'paused' | 'gameover'>('idle')
const score = ref(0)
const lives = ref(3)
const highScore = ref(0)
let animationId: number | null = null

// Player cat physics
const player = ref({
  x: 100,
  y: 310,
  width: 50,
  height: 40,
  velocity: 0,
  isJumping: false,
  frame: 0
})

// Game objects
const obstacles = ref<Array<{ x: number; y: number; width: number; height: number; type: 'dog' | 'broom' }>>([])
const fishes = ref<Array<{ x: number; y: number; width: number; height: number; collected: boolean }>>([])
const particles = ref<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([])

// Game speed
const gameSpeed = ref(5)
const groundY = 350
const gravity = 0.8
const jumpPower = -15

// Load high score on mount
onMounted(() => {
  const saved = arcadeStore.highScores['clumsy-cat']
  if (saved) highScore.value = saved

  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    draw()

    // Add keyboard controls
    window.addEventListener('keydown', handleKeyPress)
    window.addEventListener('touchstart', handleTouch)
  }
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('keydown', handleKeyPress)
  window.removeEventListener('touchstart', handleTouch)
})

function handleKeyPress(e: KeyboardEvent) {
  if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && gameState.value === 'playing') {
    e.preventDefault()
    jump()
  }
  if (e.code === 'Escape' && gameState.value === 'playing') {
    pauseGame()
  } else if (e.code === 'Escape' && gameState.value === 'paused') {
    resumeGame()
  }
}

function handleTouch(e: TouchEvent) {
  if (gameState.value === 'playing') {
    e.preventDefault()
    jump()
  }
}

function jump() {
  if (!player.value.isJumping) {
    player.value.velocity = jumpPower
    player.value.isJumping = true
    spawnParticles(player.value.x + player.value.width / 2, player.value.y + player.value.height, '#38bdf8', 3)
  }
}

function startGame() {
  gameState.value = 'playing'
  score.value = 0
  lives.value = 3
  gameSpeed.value = 5
  obstacles.value = []
  fishes.value = []
  particles.value = []
  player.value.y = 310
  player.value.velocity = 0
  player.value.isJumping = false
  gameLoop()
}

function pauseGame() {
  gameState.value = 'paused'
}

function resumeGame() {
  gameState.value = 'playing'
  gameLoop()
}

function gameOver() {
  gameState.value = 'gameover'
  if (score.value > highScore.value) {
    highScore.value = score.value
    arcadeStore.updateHighScore('clumsy-cat', score.value)
  }
  // Award tickets for playing
  const ticketsEarned = arcadeStore.awardTickets(score.value, 'clumsy-cat')
}

function spawnObstacle() {
  const types = ['dog', 'broom'] as const
  const type = types[Math.floor(Math.random() * types.length)]
  const height = type === 'dog' ? 45 : 60
  const width = type === 'dog' ? 50 : 40

  obstacles.value.push({
    x: 850,
    y: groundY - height,
    width,
    height,
    type
  })
}

function spawnFish() {
  fishes.value.push({
    x: 850,
    y: groundY - 60 - Math.random() * 100,
    width: 30,
    height: 20,
    collected: false
  })
}

function spawnParticles(x: number, y: number, color: string, count: number = 8) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count
    const speed = 2 + Math.random() * 3
    particles.value.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color
    })
  }
}

function updateParticles() {
  particles.value = particles.value.filter(p => {
    p.x += p.vx
    p.y += p.vy
    p.life -= 0.05
    return p.life > 0
  })
}

function checkCollision(rect1: { x: number; y: number; width: number; height: number }, rect2: { x: number; y: number; width: number; height: number }) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y
}

function gameLoop() {
  if (gameState.value !== 'playing') return

  // Update player physics
  player.value.velocity += gravity
  player.value.y += player.value.velocity

  if (player.value.y >= 310) {
    player.value.y = 310
    player.value.velocity = 0
    player.value.isJumping = false
  }

  // Update animation frame
  player.value.frame = (player.value.frame + 0.2) % 4

  // Spawn obstacles
  if (Math.random() < 0.015 + (score.value * 0.0001)) {
    spawnObstacle()
  }

  // Spawn fish
  if (Math.random() < 0.01) {
    spawnFish()
  }

  // Update obstacles
  obstacles.value.forEach(obs => {
    obs.x -= gameSpeed.value

    // Check collision with player
    if (checkCollision(player.value, obs)) {
      lives.value--
      spawnParticles(player.value.x + player.value.width / 2, player.value.y + player.value.height / 2, '#ef4444', 12)

      if (lives.value <= 0) {
        gameOver()
        return
      }

      // Remove this obstacle
      obstacles.value = obstacles.value.filter(o => o !== obs)
    }
  })

  // Remove off-screen obstacles
  obstacles.value = obstacles.value.filter(o => o.x > -100)

  // Update fish
  fishes.value.forEach(fish => {
    fish.x -= gameSpeed.value

    // Check collection
    if (!fish.collected && checkCollision(player.value, fish)) {
      fish.collected = true
      score.value += 50
      spawnParticles(fish.x + fish.width / 2, fish.y + fish.height / 2, '#fbbf24', 8)
    }
  })

  // Remove off-screen or collected fish
  fishes.value = fishes.value.filter(f => f.x > -50 && !f.collected)

  // Update particles
  updateParticles()

  // Increase score slowly over time
  score.value += 1

  // Gradually increase game speed
  if (score.value % 500 === 0 && gameSpeed.value < 12) {
    gameSpeed.value += 0.5
  }

  draw()
  animationId = requestAnimationFrame(gameLoop)
}

function draw() {
  if (!ctx || !canvasRef.value) return
  const canvas = canvasRef.value
  const c = ctx!
  c.clearRect(0, 0, canvas.width, canvas.height)

  // Draw background
  const gradient = c.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#0f172a')
  gradient.addColorStop(1, '#1e293b')
  c.fillStyle = gradient
  c.fillRect(0, 0, canvas.width, canvas.height)

  // Draw ground
  c.fillStyle = '#334155'
  c.fillRect(0, groundY, canvas.width, 50)
  c.strokeStyle = '#475569'
  c.lineWidth = 2
  for (let x = 0; x < canvas.width; x += 50) {
    c.beginPath()
    c.moveTo(x, groundY)
    c.lineTo(x - 20, groundY + 50)
    c.stroke()
  }

  // Draw particles
  particles.value.forEach(p => {
    c.globalAlpha = p.life
    c.fillStyle = p.color
    c.beginPath()
    c.arc(p.x, p.y, 4, 0, Math.PI * 2)
    c.fill()
  })
  c.globalAlpha = 1

  // Draw fish
  fishes.value.forEach(fish => {
    if (fish.collected) return
    c.shadowBlur = 15
    c.shadowColor = '#fbbf24'
    c.fillStyle = '#fbbf24'

    // Fish body
    c.beginPath()
    c.ellipse(fish.x + fish.width / 2, fish.y + fish.height / 2, fish.width / 2, fish.height / 2, 0, 0, Math.PI * 2)
    c.fill()

    // Fish tail
    c.beginPath()
    c.moveTo(fish.x + fish.width, fish.y + fish.height / 2)
    c.lineTo(fish.x + fish.width + 10, fish.y + fish.height / 2 - 5)
    c.lineTo(fish.x + fish.width + 10, fish.y + fish.height / 2 + 5)
    c.closePath()
    c.fill()
  })
  c.shadowBlur = 0

  // Draw obstacles
  obstacles.value.forEach(obs => {
    c.shadowBlur = 15
    if (obs.type === 'dog') {
      c.shadowColor = '#f97316'
      c.fillStyle = '#f97316'
      // Dog body
      c.fillRect(obs.x, obs.y, obs.width, obs.height)
      // Dog ears
      c.fillRect(obs.x + 5, obs.y - 10, 12, 12)
      c.fillRect(obs.x + obs.width - 17, obs.y - 10, 12, 12)
    } else {
      c.shadowColor = '#a855f7'
      c.fillStyle = '#a855f7'
      // Broom handle
      c.fillRect(obs.x + obs.width / 2 - 3, obs.y, 6, obs.height)
      // Broom bristles
      c.fillRect(obs.x, obs.y + obs.height - 25, obs.width, 25)
    }
  })
  c.shadowBlur = 0

  // Draw player cat
  c.shadowBlur = 20
  c.shadowColor = '#38bdf8'
  c.fillStyle = '#38bdf8'

  const px = player.value.x
  const py = player.value.y
  const pw = player.value.width
  const ph = player.value.height

  // Cat body
  c.fillRect(px, py, pw, ph)

  // Cat ears
  c.beginPath()
  c.moveTo(px + 5, py)
  c.lineTo(px + 10, py - 12)
  c.lineTo(px + 18, py)
  c.fill()

  c.beginPath()
  c.moveTo(px + pw - 18, py)
  c.lineTo(px + pw - 10, py - 12)
  c.lineTo(px + pw - 5, py)
  c.fill()

  // Cat eyes
  c.shadowBlur = 0
  c.fillStyle = '#000'
  c.fillRect(px + 12, py + 12, 8, 8)
  c.fillRect(px + pw - 20, py + 12, 8, 8)

  // Cat pupils (white center)
  c.fillStyle = '#fff'
  c.fillRect(px + 15, py + 14, 3, 4)
  c.fillRect(px + pw - 17, py + 14, 3, 4)

  // Cat tail animation
  const tailWag = Math.sin(player.value.frame * Math.PI / 2) * 10
  c.shadowBlur = 15
  c.shadowColor = '#38bdf8'
  c.fillStyle = '#38bdf8'
  c.save()
  c.translate(px - 5, py + ph - 10)
  c.rotate((tailWag * Math.PI) / 180)
  c.fillRect(0, 0, 20, 8)
  c.restore()
  c.shadowBlur = 0
}

const formattedScore = computed(() => {
  return score.value.toString().padStart(6, '0')
})
</script>

<template>
  <div class="space-y-6 flex flex-col items-center w-full">
    <!-- HUD -->
    <div class="glass-card p-4 md:p-6 flex justify-between items-center w-full max-w-4xl">
      <div class="flex items-center space-x-4 md:space-x-6">
        <div class="flex flex-col">
          <span class="text-[8px] font-black uppercase text-slate-500 tracking-widest">Score</span>
          <span class="text-xl md:text-2xl font-game text-arcade-neon">{{ formattedScore }}</span>
        </div>
        <div class="hidden md:flex flex-col">
          <span class="text-[8px] font-black uppercase text-slate-500 tracking-widest">Best</span>
          <span class="text-xl font-game text-amber-500">{{ highScore.toString().padStart(6, '0') }}</span>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <Zap :size="16" class="text-amber-500" />
        <span class="text-sm font-mono text-white">x{{ gameSpeed.toFixed(1) }}</span>
      </div>

      <div class="flex items-center space-x-1">
        <Heart v-for="i in 3" :key="i" :size="16" :class="i <= lives ? 'text-arcade-danger fill-current' : 'text-slate-700'" />
      </div>
    </div>

    <!-- Game Canvas -->
    <div class="relative glass-card p-3 md:p-4 border-2 border-white/5 shadow-2xl w-full max-w-4xl">
      <canvas ref="canvasRef" width="800" height="400" class="bg-black/40 rounded-xl w-full"></canvas>

      <!-- Idle Screen -->
      <div v-if="gameState === 'idle'" class="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl">
        <div class="text-center space-y-6 p-8">
          <div class="space-y-2">
            <h2 class="text-3xl md:text-4xl font-display font-black uppercase text-arcade-neon tracking-tighter">
              Cat Chaos
            </h2>
            <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Endless Runner</p>
          </div>
          <div class="space-y-3 text-left text-xs text-slate-400">
            <p><kbd class="px-2 py-1 bg-white/10 rounded">SPACE</kbd> or <kbd class="px-2 py-1 bg-white/10 rounded">TAP</kbd> to Jump</p>
            <p>Collect <span class="text-amber-500">Golden Fish</span> for bonus points</p>
            <p>Avoid <span class="text-orange-500">Dogs</span> and <span class="text-purple-500">Brooms</span></p>
          </div>
          <button @click="startGame" class="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-arcade-neon transition-all pointer-events-auto shadow-lg shadow-arcade-neon/30">
            Let's Run
          </button>
        </div>
      </div>

      <!-- Paused Screen -->
      <div v-if="gameState === 'paused'" class="absolute inset-0 flex items-center justify-center bg-amber-950/70 backdrop-blur-md rounded-xl">
        <div class="text-center space-y-6 p-8">
          <h2 class="text-3xl font-display font-black text-amber-500 uppercase tracking-tighter">Paused</h2>
          <button @click="resumeGame" class="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-amber-500 transition-all pointer-events-auto">
            Resume
          </button>
        </div>
      </div>

      <!-- Game Over Screen -->
      <div v-if="gameState === 'gameover'" class="absolute inset-0 flex items-center justify-center bg-red-950/70 backdrop-blur-md rounded-xl">
        <div class="text-center space-y-6 p-8">
          <div class="space-y-2">
            <Trophy :size="48" class="text-arcade-neon mx-auto" />
            <h2 class="text-3xl font-display font-black text-red-500 uppercase tracking-tighter">Cats Have 9 Lives, You Have 3</h2>
            <p class="text-sm font-bold text-white">Score: {{ formattedScore }}</p>
            <p v-if="score >= highScore && score > 0" class="text-xs font-black text-amber-500 uppercase tracking-widest">New High Score!</p>
          </div>
          <button @click="startGame" class="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-arcade-neon transition-all pointer-events-auto">
            One More Life
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Controls Hint -->
    <div class="md:hidden text-xs text-slate-500 font-bold uppercase tracking-widest">
      Tap anywhere to jump
    </div>
  </div>
</template>
