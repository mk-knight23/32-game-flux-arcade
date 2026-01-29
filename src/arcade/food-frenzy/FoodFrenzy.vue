<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Trophy, UtensilsCrossed, Timer } from 'lucide-vue-next'
import { useArcadeStore } from '@/stores/arcade'

const arcadeStore = useArcadeStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

const gameState = ref<'idle' | 'playing' | 'gameover'>('idle')
const score = ref(0)
const level = ref(1)
const timeLeft = ref(60)
const highScore = ref(0)
let animationId: number | null = null
let timerInterval: number | null = null

// Game objects
const foods = ref<Array<{ id: number; x: number; y: number; type: string; points: number; lifetime: number }>>([])
const cursorPos = ref({ x: 400, y: 200 })
const particles = ref<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([])

// Food types
const foodTypes = [
  { type: 'pizza', color: '#ef4444', points: 10, emoji: '🍕' },
  { type: 'burger', color: '#f97316', points: 15, emoji: '🍔' },
  { type: 'fries', color: '#fbbf24', points: 20, emoji: '🍟' },
  { type: 'sushi', color: '#ec4899', points: 25, emoji: '🍣' },
  { type: 'donut', color: '#a855f7', points: 30, emoji: '🍩' },
  { type: 'cake', color: '#f472b6', points: 50, emoji: '🍰' }
]

// Bomb type
const bomb = { type: 'bomb', color: '#1f2937', points: -100, emoji: '💣' }

let foodIdCounter = 0

onMounted(() => {
  const saved = arcadeStore.highScores['food-frenzy']
  if (saved) highScore.value = saved

  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    draw()

    canvasRef.value.addEventListener('mousemove', handleMouseMove)
    canvasRef.value.addEventListener('click', handleClick)
    canvasRef.value.addEventListener('touchstart', handleTouch)
  }
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (timerInterval) clearInterval(timerInterval)
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('mousemove', handleMouseMove)
    canvasRef.value.removeEventListener('click', handleClick)
    canvasRef.value.removeEventListener('touchstart', handleTouch)
  }
})

function handleMouseMove(e: MouseEvent) {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const scaleX = canvasRef.value.width / rect.width
  const scaleY = canvasRef.value.height / rect.height
  cursorPos.value = {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  }
}

function handleClick(e: MouseEvent) {
  if (gameState.value !== 'playing') return
  checkClick(cursorPos.value.x, cursorPos.value.y)
}

function handleTouch(e: TouchEvent) {
  if (gameState.value !== 'playing' || !canvasRef.value) return
  e.preventDefault()
  const rect = canvasRef.value.getBoundingClientRect()
  const scaleX = canvasRef.value.width / rect.width
  const scaleY = canvasRef.value.height / rect.height
  const touch = e.touches[0]
  const x = (touch.clientX - rect.left) * scaleX
  const y = (touch.clientY - rect.top) * scaleY
  checkClick(x, y)
}

function checkClick(x: number, y: number) {
  const hitRadius = 40

  foods.value.forEach((food, index) => {
    const dist = Math.sqrt((food.x - x) ** 2 + (food.y - y) ** 2)
    if (dist < hitRadius) {
      // Hit!
      if (food.type === 'bomb') {
        score.value = Math.max(0, score.value - 100)
        spawnParticles(food.x, food.y, '#ef4444', 15)
        // Screen shake effect
        if (canvasRef.value) {
          canvasRef.value.style.transform = 'translate(5px, 5px)'
          setTimeout(() => {
            if (canvasRef.value) canvasRef.value.style.transform = ''
          }, 100)
        }
      } else {
        score.value += food.points * level.value
        spawnParticles(food.x, food.y, food.points >= 30 ? '#fbbf24' : '#22c55e', 8)
      }

      // Remove food
      foods.value.splice(index, 1)
    }
  })
}

function startGame() {
  gameState.value = 'playing'
  score.value = 0
  level.value = 1
  timeLeft.value = 60
  foods.value = []
  particles.value = []
  foodIdCounter = 0

  // Start timer
  timerInterval = window.setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      gameOver()
    }

    // Level up every 15 seconds
    if (timeLeft.value % 15 === 0 && level.value < 5) {
      level.value++
    }
  }, 1000)

  gameLoop()
}

function gameOver() {
  gameState.value = 'gameover'
  if (animationId) cancelAnimationFrame(animationId)
  if (timerInterval) clearInterval(timerInterval)

  if (score.value > highScore.value) {
    highScore.value = score.value
    arcadeStore.updateHighScore('food-frenzy', score.value)
  }
  // Award tickets for playing
  const ticketsEarned = arcadeStore.awardTickets(score.value, 'food-frenzy')
}

function spawnFood() {
  const margin = 60
  const x = margin + Math.random() * (800 - margin * 2)
  const y = margin + Math.random() * (300 - margin * 2)

  // 10% chance for bomb at higher levels
  if (level.value >= 3 && Math.random() < 0.1) {
    foods.value.push({
      id: foodIdCounter++,
      x,
      y,
      type: bomb.type,
      points: bomb.points,
      lifetime: 100
    })
  } else {
    // Select food type based on level
    const availableFoods = foodTypes.slice(0, Math.min(foodTypes.length, 2 + level.value))
    const food = availableFoods[Math.floor(Math.random() * availableFoods.length)]

    foods.value.push({
      id: foodIdCounter++,
      x,
      y,
      type: food.type,
      points: food.points,
      lifetime: 80 + Math.random() * 40
    })
  }
}

function spawnParticles(x: number, y: number, color: string, count: number = 8) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 4
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
    p.vy += 0.1 // gravity
    p.life -= 0.03
    return p.life > 0
  })
}

let lastSpawn = 0

function gameLoop() {
  if (gameState.value !== 'playing') return

  const now = Date.now()
  const spawnRate = Math.max(300, 800 - level.value * 100)

  if (now - lastSpawn > spawnRate) {
    spawnFood()
    lastSpawn = now
  }

  // Update food lifetimes and remove expired
  foods.value = foods.value.filter(f => {
    f.lifetime -= 1
    return f.lifetime > 0
  })

  // Limit max foods
  if (foods.value.length > 15) {
    foods.value.shift()
  }

  updateParticles()
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
  gradient.addColorStop(0, '#1e1b4b')
  gradient.addColorStop(1, '#312e81')
  c.fillStyle = gradient
  c.fillRect(0, 0, canvas.width, canvas.height)

  // Draw table pattern
  c.strokeStyle = 'rgba(255, 255, 255, 0.05)'
  c.lineWidth = 1
  for (let x = 0; x < canvas.width; x += 40) {
    c.beginPath()
    c.moveTo(x, 0)
    c.lineTo(x, canvas.height)
    c.stroke()
  }
  for (let y = 0; y < canvas.height; y += 40) {
    c.beginPath()
    c.moveTo(0, y)
    c.lineTo(canvas.width, y)
    c.stroke()
  }

  // Draw food
  foods.value.forEach(food => {
    const foodData = food.type === 'bomb' ? bomb : foodTypes.find(f => f.type === food.type)
    if (!foodData) return

    const alpha = Math.min(1, food.lifetime / 20)
    const scale = 0.8 + (1 - alpha) * 0.4

    c.save()
    c.translate(food.x, food.y)
    c.scale(scale, scale)
    c.globalAlpha = alpha

    // Glow effect
    c.shadowBlur = 20
    c.shadowColor = foodData.color

    // Background circle
    c.fillStyle = foodData.color
    c.beginPath()
    c.arc(0, 0, 35, 0, Math.PI * 2)
    c.fill()

    // Emoji
    c.shadowBlur = 0
    c.font = '32px sans-serif'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillText(foodData.emoji, 0, 0)

    // Points indicator
    if (food.type !== 'bomb') {
      c.font = 'bold 10px sans-serif'
      c.fillStyle = '#fff'
      c.fillText(`+${food.points * level.value}`, 0, -45)
    }

    c.restore()
  })
  c.globalAlpha = 1

  // Draw particles
  particles.value.forEach(p => {
    c.globalAlpha = p.life
    c.fillStyle = p.color
    c.beginPath()
    c.arc(p.x, p.y, 4, 0, Math.PI * 2)
    c.fill()
  })
  c.globalAlpha = 1

  // Draw cursor
  c.strokeStyle = '#fff'
  c.lineWidth = 2
  c.shadowBlur = 10
  c.shadowColor = '#fff'
  c.beginPath()
  c.arc(cursorPos.value.x, cursorPos.value.y, 20, 0, Math.PI * 2)
  c.stroke()

  // Crosshair
  c.beginPath()
  c.moveTo(cursorPos.value.x - 30, cursorPos.value.y)
  c.lineTo(cursorPos.value.x - 10, cursorPos.value.y)
  c.moveTo(cursorPos.value.x + 10, cursorPos.value.y)
  c.lineTo(cursorPos.value.x + 30, cursorPos.value.y)
  c.moveTo(cursorPos.value.x, cursorPos.value.y - 30)
  c.lineTo(cursorPos.value.x, cursorPos.value.y - 10)
  c.moveTo(cursorPos.value.x, cursorPos.value.y + 10)
  c.lineTo(cursorPos.value.x, cursorPos.value.y + 30)
  c.stroke()
  c.shadowBlur = 0
}

const formattedScore = computed(() => score.value.toString().padStart(6, '0'))
const formattedTime = computed(() => {
  const mins = Math.floor(timeLeft.value / 60)
  const secs = timeLeft.value % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
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

      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <UtensilsCrossed :size="16" class="text-arcade-neon" />
          <span class="text-lg font-bold text-white">Lv.{{ level }}</span>
        </div>
        <div class="flex items-center space-x-2" :class="timeLeft <= 10 ? 'animate-pulse' : ''">
          <Timer :size="16" :class="timeLeft <= 10 ? 'text-red-500' : 'text-amber-500'" />
          <span class="text-lg font-mono font-bold" :class="timeLeft <= 10 ? 'text-red-500' : 'text-white'">{{ formattedTime }}</span>
        </div>
      </div>
    </div>

    <!-- Game Canvas -->
    <div class="relative glass-card p-3 md:p-4 border-2 border-white/5 shadow-2xl w-full max-w-4xl">
      <canvas ref="canvasRef" width="800" height="350" class="bg-black/40 rounded-xl w-full cursor-none"></canvas>

      <!-- Idle Screen -->
      <div v-if="gameState === 'idle'" class="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl">
        <div class="text-center space-y-6 p-8">
          <div class="space-y-2">
            <UtensilsCrossed :size="48" class="text-arcade-neon mx-auto" />
            <h2 class="text-3xl md:text-4xl font-display font-black uppercase text-arcade-neon tracking-tighter">
              Food Frenzy
            </h2>
            <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Click to Collect</p>
          </div>
          <div class="space-y-3 text-xs text-slate-400">
            <p>Click or tap on food to collect it</p>
            <p>Avoid the <span class="text-lg">💣</span> bombs!</p>
            <p>Higher level = more points, but watch out for bombs</p>
          </div>
          <button @click="startGame" class="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-arcade-neon transition-all pointer-events-auto shadow-lg shadow-arcade-neon/30">
            Let's Feast
          </button>
        </div>
      </div>

      <!-- Game Over Screen -->
      <div v-if="gameState === 'gameover'" class="absolute inset-0 flex items-center justify-center bg-red-950/70 backdrop-blur-md rounded-xl">
        <div class="text-center space-y-6 p-8">
          <div class="space-y-2">
            <Trophy :size="48" class="text-arcade-neon mx-auto" />
            <h2 class="text-3xl font-display font-black text-red-500 uppercase tracking-tighter">Kitchen Closed!</h2>
            <p class="text-sm font-bold text-white">Score: {{ formattedScore }}</p>
            <p class="text-xs font-black text-arcade-neon uppercase tracking-widest">Level Reached: {{ level }}</p>
            <p v-if="score >= highScore && score > 0" class="text-xs font-black text-amber-500 uppercase tracking-widest">New High Score!</p>
          </div>
          <button @click="startGame" class="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-arcade-neon transition-all pointer-events-auto">
            I'm Still Hungry
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile hint -->
    <div class="md:hidden text-xs text-slate-500 font-bold uppercase tracking-widest">
      Tap to collect food
    </div>
  </div>
</template>
