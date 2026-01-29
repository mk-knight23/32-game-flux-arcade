<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Trophy, Music, Target } from 'lucide-vue-next'
import { useArcadeStore } from '@/stores/arcade'

const arcadeStore = useArcadeStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

const gameState = ref<'idle' | 'playing' | 'gameover'>('idle')
const score = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const highScore = ref(0)
let animationId: number | null = null

// Arrow positions
const arrows = ref<Array<{ lane: number; y: number; speed: number; hit: boolean }>>([])
const targets = ref<Array<{ lane: number; y: number; hit: boolean; flash: number }>>([])
const particles = ref<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([])

// Game settings
const laneCount = 4
const laneWidth = 80
const targetY = 320
const spawnY = -50
const baseSpeed = 3

// Arrow key codes
const keyMap: Record<string, number> = {
  'ArrowLeft': 0,
  'KeyA': 0,
  'ArrowUp': 1,
  'KeyW': 1,
  'ArrowDown': 2,
  'KeyS': 2,
  'ArrowRight': 3,
  'KeyD': 3
}

const laneColors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308']
const laneLabels = ['←', '↑', '↓', '→']

// Load high score
onMounted(() => {
  const saved = arcadeStore.highScores['senior-dance']
  if (saved) highScore.value = saved

  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    draw()

    window.addEventListener('keydown', handleKeyPress)
  }
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('keydown', handleKeyPress)
})

function handleKeyPress(e: KeyboardEvent) {
  if (gameState.value !== 'playing') return

  const lane = keyMap[e.code]
  if (lane !== undefined) {
    e.preventDefault()
    checkHit(lane)

    // Flash the target
    const target = targets.value.find(t => t.lane === lane)
    if (target) {
      target.flash = 1
    }
  }
}

function checkHit(lane: number) {
  const hitWindow = 60
  const perfectWindow = 20

  // Find closest arrow in this lane
  let closestIndex = -1
  let closestDist = Infinity

  arrows.value.forEach((arrow, index) => {
    if (arrow.lane === lane && !arrow.hit) {
      const dist = Math.abs(arrow.y - targetY)
      if (dist < closestDist) {
        closestDist = dist
        closestIndex = index
      }
    }
  })

  if (closestIndex !== -1 && closestDist < hitWindow) {
    const arrow = arrows.value[closestIndex]
    arrow.hit = true

    // Determine hit quality
    if (closestDist < perfectWindow) {
      score.value += 100 + (combo.value * 10)
      combo.value++
      spawnParticles(lane * laneWidth + laneWidth / 2 + 160, targetY, laneColors[lane], 12)
    } else {
      score.value += 50 + (combo.value * 5)
      combo.value++
      spawnParticles(lane * laneWidth + laneWidth / 2 + 160, targetY, laneColors[lane], 6)
    }

    if (combo.value > maxCombo.value) {
      maxCombo.value = combo.value
    }

    // Flash target
    const target = targets.value.find(t => t.lane === lane)
    if (target) {
      target.hit = true
      target.flash = 1
    }
  } else {
    // Miss - reset combo
    if (combo.value > 0) {
      spawnParticles(320, 100, '#ef4444', 8)
    }
    combo.value = 0
  }
}

function startGame() {
  gameState.value = 'playing'
  score.value = 0
  combo.value = 0
  maxCombo.value = 0
  arrows.value = []
  targets.value = []
  particles.value = []

  // Initialize targets
  for (let i = 0; i < laneCount; i++) {
    targets.value.push({ lane: i, y: targetY, hit: false, flash: 0 })
  }

  gameLoop()
}

function gameOver() {
  gameState.value = 'gameover'
  if (score.value > highScore.value) {
    highScore.value = score.value
    arcadeStore.updateHighScore('senior-dance', score.value)
  }
  // Award tickets for playing
  const ticketsEarned = arcadeStore.awardTickets(score.value, 'senior-dance')
}

function spawnArrow() {
  const lane = Math.floor(Math.random() * laneCount)
  arrows.value.push({
    lane,
    y: spawnY,
    speed: baseSpeed + (score.value / 5000),
    hit: false
  })
}

function spawnParticles(x: number, y: number, color: string, count: number = 8) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count
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
    p.life -= 0.04
    return p.life > 0
  })
}

let lastSpawn = 0
let lastMissCheck = 0

function gameLoop() {
  if (gameState.value !== 'playing') return

  const now = Date.now()

  // Spawn arrows at intervals
  if (now - lastSpawn > Math.max(400, 800 - score.value / 10)) {
    spawnArrow()
    lastSpawn = now
  }

  // Update arrows
  arrows.value.forEach(arrow => {
    arrow.y += arrow.speed
  })

  // Check for missed arrows
  if (now - lastMissCheck > 100) {
    arrows.value.forEach(arrow => {
      if (!arrow.hit && arrow.y > targetY + 80) {
        arrow.hit = true
        combo.value = 0
      }
    })
    lastMissCheck = now
  }

  // Remove off-screen arrows
  arrows.value = arrows.value.filter(a => a.y < 450)

  // Update target flash
  targets.value.forEach(target => {
    if (target.flash > 0) {
      target.flash -= 0.1
      if (target.flash < 0) target.flash = 0
      target.hit = false
    }
  })

  // Update particles
  updateParticles()

  // Game over after 50 arrows
  const totalHits = arrows.value.filter(a => a.hit).length
  if (totalHits >= 50) {
    gameOver()
    return
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
  gradient.addColorStop(0, '#1a1a2e')
  gradient.addColorStop(1, '#16213e')
  c.fillStyle = gradient
  c.fillRect(0, 0, canvas.width, canvas.height)

  // Draw lanes
  const startX = (canvas.width - laneCount * laneWidth) / 2
  for (let i = 0; i < laneCount; i++) {
    const x = startX + i * laneWidth

    // Lane background
    c.fillStyle = 'rgba(255, 255, 255, 0.02)'
    c.fillRect(x, 0, laneWidth - 4, canvas.height)

    // Lane divider
    c.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    c.lineWidth = 2
    c.beginPath()
    c.moveTo(x + laneWidth - 2, 0)
    c.lineTo(x + laneWidth - 2, canvas.height)
    c.stroke()

    // Lane label at bottom
    c.fillStyle = laneColors[i]
    c.font = 'bold 24px sans-serif'
    c.textAlign = 'center'
    c.fillText(laneLabels[i], x + laneWidth / 2, 380)
  }

  // Draw target line
  c.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  c.lineWidth = 3
  c.setLineDash([10, 10])
  c.beginPath()
  c.moveTo(startX, targetY + 35)
  c.lineTo(startX + laneCount * laneWidth, targetY + 35)
  c.stroke()
  c.setLineDash([])

  // Draw targets
  targets.value.forEach(target => {
    const x = startX + target.lane * laneWidth
    const flashIntensity = target.flash

    // Outer ring
    c.shadowBlur = 15 + flashIntensity * 20
    c.shadowColor = laneColors[target.lane]
    c.strokeStyle = laneColors[target.lane]
    c.lineWidth = 3
    c.beginPath()
    c.arc(x + laneWidth / 2, targetY + 15, 25, 0, Math.PI * 2)
    c.stroke()

    // Inner fill when hit
    if (target.flash > 0) {
      c.fillStyle = `rgba(${parseInt(laneColors[target.lane].slice(1, 3), 16)}, ${parseInt(laneColors[target.lane].slice(3, 5), 16)}, ${parseInt(laneColors[target.lane].slice(5, 7), 16)}, ${flashIntensity})`
      c.fill()
    }

    // Arrow indicator
    c.fillStyle = laneColors[target.lane]
    c.font = 'bold 20px sans-serif'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillText(laneLabels[target.lane], x + laneWidth / 2, targetY + 15)
  })
  c.shadowBlur = 0

  // Draw arrows
  arrows.value.forEach(arrow => {
    if (arrow.hit) return

    const x = startX + arrow.lane * laneWidth
    const progress = (arrow.y - spawnY) / (targetY - spawnY)
    const alpha = Math.min(1, progress)

    c.globalAlpha = alpha
    c.shadowBlur = 15
    c.shadowColor = laneColors[arrow.lane]
    c.fillStyle = laneColors[arrow.lane]

    // Arrow shape
    c.beginPath()
    const arrowY = arrow.y + 15
    const arrowX = x + laneWidth / 2

    if (arrow.lane === 0) { // Left
      c.moveTo(arrowX + 15, arrowY)
      c.lineTo(arrowX - 5, arrowY - 10)
      c.lineTo(arrowX - 5, arrowY + 10)
    } else if (arrow.lane === 1) { // Up
      c.moveTo(arrowX, arrowY - 15)
      c.lineTo(arrowX - 10, arrowY + 5)
      c.lineTo(arrowX + 10, arrowY + 5)
    } else if (arrow.lane === 2) { // Down
      c.moveTo(arrowX, arrowY + 15)
      c.lineTo(arrowX - 10, arrowY - 5)
      c.lineTo(arrowX + 10, arrowY - 5)
    } else { // Right
      c.moveTo(arrowX - 15, arrowY)
      c.lineTo(arrowX + 5, arrowY - 10)
      c.lineTo(arrowX + 5, arrowY + 10)
    }
    c.closePath()
    c.fill()
  })
  c.globalAlpha = 1
  c.shadowBlur = 0

  // Draw particles
  particles.value.forEach(p => {
    c.globalAlpha = p.life
    c.fillStyle = p.color
    c.beginPath()
    c.arc(p.x, p.y, 5, 0, Math.PI * 2)
    c.fill()
  })
  c.globalAlpha = 1
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

      <div class="flex items-center space-x-4">
        <div class="flex flex-col items-center">
          <span class="text-[8px] font-black uppercase text-slate-500 tracking-widest">Combo</span>
          <span class="text-xl font-mono font-bold text-arcade-neon" :class="combo > 5 ? 'animate-pulse' : ''">{{ combo }}x</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-[8px] font-black uppercase text-slate-500 tracking-widest">Max</span>
          <span class="text-lg font-mono text-white">{{ maxCombo }}x</span>
        </div>
      </div>
    </div>

    <!-- Game Canvas -->
    <div class="relative glass-card p-3 md:p-4 border-2 border-white/5 shadow-2xl w-full max-w-4xl">
      <canvas ref="canvasRef" width="640" height="400" class="bg-black/40 rounded-xl w-full"></canvas>

      <!-- Idle Screen -->
      <div v-if="gameState === 'idle'" class="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl">
        <div class="text-center space-y-6 p-8">
          <div class="space-y-2">
            <Music :size="48" class="text-arcade-neon mx-auto" />
            <h2 class="text-3xl md:text-4xl font-display font-black uppercase text-arcade-neon tracking-tighter">
              Senior Dance
            </h2>
            <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Rhythm Game</p>
          </div>
          <div class="space-y-3 text-xs text-slate-400">
            <p>Hit arrows when they reach the target circle</p>
            <div class="flex justify-center gap-2">
              <kbd class="px-2 py-1 bg-white/10 rounded">←/A</kbd>
              <kbd class="px-2 py-1 bg-white/10 rounded">↑/W</kbd>
              <kbd class="px-2 py-1 bg-white/10 rounded">↓/S</kbd>
              <kbd class="px-2 py-1 bg-white/10 rounded">→/D</kbd>
            </div>
            <p>Build combos for bonus points!</p>
          </div>
          <button @click="startGame" class="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-arcade-neon transition-all pointer-events-auto shadow-lg shadow-arcade-neon/30">
            Start Dance
          </button>
        </div>
      </div>

      <!-- Game Over Screen -->
      <div v-if="gameState === 'gameover'" class="absolute inset-0 flex items-center justify-center bg-red-950/70 backdrop-blur-md rounded-xl">
        <div class="text-center space-y-6 p-8">
          <div class="space-y-2">
            <Trophy :size="48" class="text-arcade-neon mx-auto" />
            <h2 class="text-3xl font-display font-black text-red-500 uppercase tracking-tighter">Dance Off Over!</h2>
            <p class="text-sm font-bold text-white">Score: {{ formattedScore }}</p>
            <p class="text-xs font-black text-arcade-neon uppercase tracking-widest">Max Combo: {{ maxCombo }}x</p>
            <p v-if="score >= highScore && score > 0" class="text-xs font-black text-amber-500 uppercase tracking-widest">New High Score!</p>
          </div>
          <button @click="startGame" class="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-arcade-neon transition-all pointer-events-auto">
            Encore?
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
