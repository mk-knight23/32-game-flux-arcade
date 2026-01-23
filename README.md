# Mini Games Arcade

A professional arcade hub featuring a collection of addictive mini-games. Built with React 18, TypeScript, and Tailwind CSS.

## Games Collection

- **🐱 Clumsy Cat Chaos** - Navigate your cat through household obstacles. Jump and run to survive!
- **👵 Dance Battle Seniors** - *Coming Soon* - Hit the beats with the coolest grandparents.
- **🍕 Food Fight Frenzy** - *Coming Soon* - Dodge flying cafeteria food.
- **💼 Office Prank Wars** - *Coming Soon* - Set up pranks without getting caught.
- **🧟 Zombie Plant Defenders** - *Coming Soon* - Protect your garden from the undead.

## Features

- **Centralized Dashboard** - Browse and play all games from a single hub.
- **Persistent High Scores** - Your best scores are saved automatically using Zustand persistence.
- **Dark/Light Mode** - Play in the theme that suits your mood.
- **Mobile Responsive** - Built-in touch controls for playing on the go.
- **Smooth Animations** - Powered by Framer Motion.
- **Retro Aesthetic** - Modern UI with a nostalgic pixel-perfect touch.

## Tech Stack

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - High-performance build tool
- **Tailwind CSS** - Modern styling
- **Zustand** - Global state management & persistence
- **Framer Motion** - Fluid UI animations
- **Lucide React** - High-quality icon set

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/mk-knight23/35-JS-Mini-Games-Collection.git

# Navigate to project
cd 35-JS-Mini-Games-Collection

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
35-JS-Mini-Games-Collection/
├── public/
│   └── favicon.svg      # Arcade icon
├── src/
│   ├── components/
│   │   └── games/       # Individual game components
│   │       └── ClumsyCatChaos.tsx
│   ├── stores/
│   │   └── arcadeStore.ts # Centralized arcade state
│   ├── types/
│   │   └── game.ts       # TypeScript interfaces
│   ├── App.tsx          # Main dashboard
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Game Mechanics

### Clumsy Cat Chaos
- **Goal:** Survive as long as possible by jumping over obstacles.
- **Scoring:** Points are awarded for each obstacle cleared.
- **Progression:** Speed and obstacle frequency increase with score levels.

## Deployment

This project includes a GitHub Actions workflow for automatic deployment to GitHub Pages.

1. Enable GitHub Pages in repository settings.
2. Set source to "GitHub Actions".
3. Push to the `main` branch to trigger deployment.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Live Demo:** [https://mk-knight23.github.io/35-JS-Mini-Games-Collection/](https://mk-knight23.github.io/35-JS-Mini-Games-Collection/)
