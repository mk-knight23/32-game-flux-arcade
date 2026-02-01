# 32-game-flux-arcade

<p align="center">
  <img src="https://img.shields.io/badge/Version-3.0.0-EC4899?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/Style-Quantum_Flux-A855F7?style=for-the-badge" alt="Style">
  <img src="https://img.shields.io/badge/Stack-Vue_Pinia-4FC08D?style=for-the-badge&logo=vue.js" alt="Stack">
</p>

## 🌐 The Modular Arcade Nexus

**FLUX_ARCADE** is a high-fidelity, component-based game engine hosting a suite of arcade experiences. Built on a unified state system ("Core System"), it treats individual games as pluggable modules ("Chambers") within a persistent quantum hub.

### ⚡ Flux Engine Features
- **Quantum Lobby**: Immersive animated discovery interface with "Flux Neon" aesthetics.
- **Global Economy**: "Core Tickets" persistence across all modules.
- **Dynamic Loading**: On-demand module injection for optimized bundle splitting.
- **Daily Protocol**: Deterministic daily challenges with 2x multiplier bonuses.

## Available Games

### 1. Cat Chaos (Unlocked)
- **Genre:** Endless Runner
- **Controls:** Space/Up/W to jump, Tap on mobile
- **Features:** Jump over dogs and brooms, collect golden fish for bonus points
- **Progression:** Speed increases over time, 3 lives

### 2. Senior Dance (200 Tickets)
- **Genre:** Rhythm Game
- **Controls:** Arrow keys or WASD
- **Features:** Hit arrows to the beat, build combos for multiplier
- **Progression:** 50 arrows per session, perfect hits give bonus points

### 3. Food Frenzy (500 Tickets)
- **Genre:** Clicker/Arcade
- **Controls:** Mouse click or tap
- **Features:** Click food to collect, avoid bombs
- **Progression:** 60-second timer, level up for more point multipliers

## New Features

### Ticket Economy
- Earn 1 ticket per 100 points scored in any game
- Spend tickets to unlock new games
- Starting balance: 100 tickets

### Unlock System
- Games can be unlocked with earned tickets
- Persistent unlock state across sessions
- Visual feedback for unlockable/locked games

### High Score Tracking
- Per-game high scores saved locally
- Personal best displayed in lobby
- Global ticket count visible in header

## Tech Stack
- **Framework:** Vue 3.5 (Composition API)
- **Routing:** Vue Router 4
- **State:** Pinia (Enterprise patterns)
- **Styling:** Tailwind CSS (Neon-modern palette)
- **Icons:** Lucide Vue
- **Build:** Vite 6

## Setup & Build Instructions

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

## Deployment
Deployed to GitHub Pages with automated CI/CD. Optimized for sub-second first meaningful paint via Vite 6.

---

**License:** MIT
**Architect:** mk-knight23

---

### Live Demo
- GitHub Pages: <https://mk-knight23.github.io/30-js-mini-games/>
- Vercel: [Deploy your own](https://vercel.com/new)
- Netlify: [Deploy your own](https://app.netlify.com/start)

---

## 📝 Design Notes (V2)

### Intentional Quirk: The Daily Challenge Rotation
Every day, one game is featured with 2x ticket bonus. The rotation is deterministic (based on day of year), not random. This means you can predict tomorrow's challenge. The quirk: it's "unfair" that some days favor games you don't like. But that's life. Daily challenges should feel like weather—sometimes sunny, sometimes rainy. You learn all games or you wait.

### Tradeoff: LocalStorage Over Backend
All progress (tickets, unlocks, daily status) lives in localStorage. Clear your browser, lose everything. The tradeoff: no accounts, no passwords, no "sync across devices." This is an arcade you visit, not a home you own. The ephemeral nature makes each session feel self-contained.

### What I Chose NOT to Build
No microtransactions. The ticket economy could easily be "buy 1000 tickets for $0.99." I didn't build that. Virtual currencies in free games always lead to dark patterns. These tickets have no monetary value—they're just a progress abstraction. The only way to earn them is to play.

## 🎉 Additional Features (V3)

Three quality-of-life improvements for the arcade experience:

### Sound Toggle in Lobby
**Why added**: Previously, you had to enter a game and then pause to toggle sound. In the lobby, there was no way to mute before playing.

**What changed**: Added a sound toggle button directly in the lobby header. Your preference persists across games and sessions via localStorage.

### Achievement Badges
**Why added**: Playing games without milestones feels aimless beyond tickets.

**What changed**: Added achievement badges for each game—"First Win," "Score 1000," "5-Game Streak." Badges display on your player card in the lobby. They're purely cosmetic; no gameplay effect.

### Session Timer
**Why added**: For mindful gaming, it's useful to know how long you've been playing.

**What changed**: Added a subtle session timer in the footer showing time since page load. Helps with self-regulation without being intrusive.

### Intentionally Rejected: Global Leaderboards
I considered adding cross-player leaderboards. Rejected because this is a local, self-contained arcade. Leaderboards would require accounts, which adds friction and complexity. Competing against your own scores is enough. Sometimes you just want to play alone.
