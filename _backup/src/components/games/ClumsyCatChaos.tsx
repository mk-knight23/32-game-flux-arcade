import { useRef, useEffect, useState, useCallback } from 'react'
import { useArcadeStore } from '@/stores/arcadeStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Heart, Play, Home, RotateCcw } from 'lucide-react'

interface Cat {
  x: number
  y: number
  vx: number
  vy: number
  width: number
  height: number
  onGround: boolean
}

interface Obstacle {
  x: number
  y: number
  vx: number
  width: number
  height: number
  emoji: string
  points: number
}

export function ClumsyCatChaos() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle')
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const { updateHighScore, setActiveGame } = useArcadeStore()
  
  const gameRef = useRef({
    cat: { x: 100, y: 300, vx: 0, vy: 0, width: 40, height: 40, onGround: false } as Cat,
    obstacles: [] as Obstacle[],
    lastSpawn: 0,
    keys: { Left: false, Right: false },
    animationId: 0
  })

  const jump = useCallback(() => {
    if (gameRef.current.cat.onGround) {
      gameRef.current.cat.vy = -12
    }
  }, [])

  const spawnObstacle = useCallback((width: number, height: number) => {
    const types = [
      { emoji: '🪴', w: 40, h: 60, p: 10 },
      { emoji: '📦', w: 50, h: 50, p: 15 },
      { emoji: '🎾', w: 30, h: 30, p: 20 }
    ]
    const type = types[Math.floor(Math.random() * types.length)]
    gameRef.current.obstacles.push({
      x: width,
      y: height - 60 - type.h,
      vx: -4 - level * 0.5,
      width: type.w,
      height: type.h,
      emoji: type.emoji,
      points: type.p
    })
  }, [level])

  const update = useCallback(() => {
    const { cat, obstacles, keys } = gameRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    // Movement
    if (keys.Left) cat.vx = -6
    else if (keys.Right) cat.vx = 6
    else cat.vx *= 0.8

    cat.vy += 0.6 // Gravity
    cat.x += cat.vx
    cat.y += cat.vy

    // Boundaries
    if (cat.x < 0) cat.x = 0
    if (cat.x > canvas.width - cat.width) cat.x = canvas.width - cat.width

    // Ground
    const groundY = canvas.height - 60 - cat.height
    if (cat.y >= groundY) {
      cat.y = groundY
      cat.vy = 0
      cat.onGround = true
    } else {
      cat.onGround = false
    }

    // Obstacles
    if (Date.now() - gameRef.current.lastSpawn > Math.max(800, 2000 - level * 200)) {
      spawnObstacle(canvas.width, canvas.height)
      gameRef.current.lastSpawn = Date.now()
    }

    gameRef.current.obstacles = obstacles.filter(obs => {
      obs.x += obs.vx
      
      // Collision
      if (cat.x < obs.x + obs.width &&
          cat.x + cat.width > obs.x &&
          cat.y < obs.y + obs.height &&
          cat.y + cat.height > obs.y) {
        setLives(l => {
          if (l <= 1) {
            setGameState('gameover')
            return 0
          }
          return l - 1
        })
        return false
      }

      if (obs.x < -obs.width) {
        setScore(s => {
          const newScore = s + obs.points
          if (newScore > level * 100) setLevel(l => l + 1)
          return newScore
        })
        return false
      }
      return true
    })
  }, [level, spawnObstacle])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Ground
    ctx.fillStyle = '#10b981'
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60)

    // Cat
    ctx.font = '40px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('🐱', gameRef.current.cat.x + 20, gameRef.current.cat.y + 40)

    // Obstacles
    gameRef.current.obstacles.forEach(obs => {
      ctx.font = `${obs.height}px Arial`
      ctx.fillText(obs.emoji, obs.x + obs.width / 2, obs.y + obs.height)
    })
  }, [])

  const loop = useCallback(() => {
    if (gameState === 'playing') {
      update()
      draw()
      gameRef.current.animationId = requestAnimationFrame(loop)
    }
  }, [gameState, update, draw])

  useEffect(() => {
    if (gameState === 'playing') {
      gameRef.current.animationId = requestAnimationFrame(loop)
    }
    return () => cancelAnimationFrame(gameRef.current.animationId)
  }, [gameState, loop])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') gameRef.current.keys.Left = true
      if (e.key === 'ArrowRight') gameRef.current.keys.Right = true
      if (e.key === 'ArrowUp' || e.key === ' ') jump()
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') gameRef.current.keys.Left = false
      if (e.key === 'ArrowRight') gameRef.current.keys.Right = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [jump])

  const startGame = () => {
    setScore(0)
    setLevel(1)
    setLives(3)
    setGameState('playing')
    gameRef.current.obstacles = []
    gameRef.current.cat = { x: 100, y: 300, vx: 0, vy: 0, width: 40, height: 40, onGround: false }
  }

  useEffect(() => {
    if (gameState === 'gameover') {
      updateHighScore('clumsy-cat', score)
    }
  }, [gameState, score, updateHighScore])

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex justify-between w-full max-w-[800px] bg-slate-800 p-4 rounded-xl pixel-border">
        <div className="flex items-center gap-2">
          <Trophy className="text-game-gold" />
          <span className="font-game text-sm">{score}</span>
        </div>
        <div className="font-game text-sm text-game-accent">LEVEL {level}</div>
        <div className="flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <Heart 
              key={i} 
              className={i < lives ? "text-game-danger fill-current" : "text-slate-600"} 
              size={20}
            />
          ))}
        </div>
      </div>

      <div className="relative group">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="bg-slate-900 rounded-xl pixel-border w-full max-w-[800px] aspect-video"
        />
        
        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm"
            >
              <button 
                onClick={startGame}
                className="bg-game-accent text-white font-game p-6 rounded-xl hover:scale-105 transition-transform flex items-center gap-3"
              >
                <Play fill="currentColor" /> START
              </button>
            </motion.div>
          )}

          {gameState === 'gameover' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl backdrop-blur-md"
            >
              <div className="text-center">
                <h2 className="font-game text-4xl text-game-danger mb-4">GAME OVER</h2>
                <p className="font-game text-xl text-white mb-8">SCORE: {score}</p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={startGame}
                    className="bg-game-success text-white font-game p-4 rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    <RotateCcw size={20} /> RETRY
                  </button>
                  <button 
                    onClick={() => setActiveGame(null)}
                    className="bg-slate-700 text-white font-game p-4 rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    <Home size={20} /> MENU
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-[400px] md:hidden">
        <button 
          className="bg-slate-700 p-6 rounded-xl pixel-border active:bg-slate-600"
          onTouchStart={() => gameRef.current.keys.Left = true}
          onTouchEnd={() => gameRef.current.keys.Left = false}
        >⬅️</button>
        <button 
          className="bg-game-accent p-6 rounded-xl pixel-border active:bg-sky-400 font-bold"
          onTouchStart={jump}
        >JUMP</button>
        <button 
          className="bg-slate-700 p-6 rounded-xl pixel-border active:bg-slate-600"
          onTouchStart={() => gameRef.current.keys.Right = true}
          onTouchEnd={() => gameRef.current.keys.Right = false}
        >➡️</button>
      </div>

      <p className="text-slate-500 text-sm hidden md:block">
        Use Arrow Keys to move and jump!
      </p>
    </div>
  )
}
