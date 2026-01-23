import { motion } from 'framer-motion'
import { useArcadeStore } from '@/stores/arcadeStore'
import { 
  Gamepad2, 
  Trophy, 
  Activity, 
  Moon, 
  Sun,
  LayoutGrid,
  Cat,
  Music,
  Pizza,
  Briefcase,
  Zap
} from 'lucide-react'
import { ClumsyCatChaos } from './components/games/ClumsyCatChaos'
import type { GameID } from '@/types/game'

const GAMES = [
  {
    id: 'clumsy-cat' as GameID,
    title: 'Clumsy Cat Chaos',
    description: 'Jump over household items and cause feline mayhem!',
    icon: <Cat className="w-8 h-8" />,
    color: 'from-orange-400 to-amber-600',
    accent: '#f59e0b'
  },
  {
    id: 'dance-battle' as GameID,
    title: 'Dance Battle Seniors',
    description: 'Hit the beats with the coolest grandparents in town!',
    icon: <Music className="w-8 h-8" />,
    color: 'from-purple-500 to-indigo-600',
    accent: '#8b5cf6'
  },
  {
    id: 'food-fight' as GameID,
    title: 'Food Fight Frenzy',
    description: 'Cafeteria chaos! Dodge the flying tacos and pizzas.',
    icon: <Pizza className="w-8 h-8" />,
    color: 'from-red-500 to-rose-600',
    accent: '#f43f5e'
  },
  {
    id: 'office-prank' as GameID,
    title: 'Office Prank Wars',
    description: 'Set up pranks without getting caught by the boss.',
    icon: <Briefcase className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-600',
    accent: '#06b6d4'
  },
  {
    id: 'zombie-defenders' as GameID,
    title: 'Zombie Plant Defenders',
    description: 'Protect your garden from the pixelated undead.',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-green-500 to-emerald-600',
    accent: '#10b981'
  }
]

export default function App() {
  const { 
    activeGame, 
    setActiveGame, 
    isDarkMode, 
    toggleDarkMode,
    highScores,
    stats
  } = useArcadeStore()

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'dark' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-game-accent p-2 rounded-lg rotate-12">
              <Gamepad2 className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-game tracking-tighter hidden sm:block">
              ARCADE<span className="text-game-accent">HUB</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="hidden md:flex gap-6 bg-slate-800 px-6 py-2 rounded-full border border-slate-700">
              <div className="flex items-center gap-2">
                <Trophy className="text-game-gold w-4 h-4" />
                <span className="text-xs font-game">TOTAL: {stats.totalScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="text-game-accent w-4 h-4" />
                <span className="text-xs font-game">PLAYED: {stats.gamesPlayed}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {activeGame ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setActiveGame(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LayoutGrid />
                </button>
                <h2 className="text-2xl font-game">
                  {GAMES.find(g => g.id === activeGame)?.title}
                </h2>
              </div>
              
              {activeGame === 'clumsy-cat' && <ClumsyCatChaos />}
              {activeGame !== 'clumsy-cat' && (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700">
                  <Zap size={48} className="text-slate-600 mb-4 animate-pulse" />
                  <p className="font-game text-slate-500">Coming Soon in v2.1</p>
                  <button 
                    onClick={() => setActiveGame(null)}
                    className="mt-6 text-game-accent font-game text-sm"
                  >
                    GO BACK
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <div>
              <div className="mb-12">
                <h2 className="text-4xl font-game mb-4">PICK YOUR GAME</h2>
                <p className="text-slate-500">Retro challenges for modern gamers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {GAMES.map((game, idx) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group relative bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 hover:border-game-accent transition-all cursor-pointer"
                    onClick={() => setActiveGame(game.id)}
                  >
                    <div className={`h-32 bg-gradient-to-br ${game.color} p-6 flex items-end`}>
                      <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white">
                        {game.icon}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-game group-hover:text-game-accent transition-colors">
                          {game.title}
                        </h3>
                      </div>
                      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        {game.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-game-gold">
                          <Trophy size={14} />
                          <span className="text-xs font-game">{highScores[game.id] || 0}</span>
                        </div>
                        <button className="text-xs font-game bg-slate-700 px-4 py-2 rounded-lg group-hover:bg-game-accent group-hover:text-white transition-all">
                          PLAY NOW
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-24 text-center border-t border-slate-800 pt-8">
          <p className="text-slate-600 text-sm font-game">
            &copy; 2026 MK-ARCADE. ALL RIGHTS RESERVED.
          </p>
        </footer>
      </div>
    </div>
  )
}
