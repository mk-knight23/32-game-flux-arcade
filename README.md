# Arcade Hub - Professional Games Collection

A modular high-fidelity arcade portal built with **Vue 3**, **TypeScript**, and **Pinia**. Designed for seamless game engine integration, featuring global player stats, persistent earnings, and a "Cyber Arcade" lobby experience.

## Overview
This collection replaces the legacy React dashboard with a modern, code-split Vue 3 architecture. Each game operates as an independent engine within a secured "Game Chamber", sharing a unified state system for achievements and tickets.

## Features Comparison

| Feature | Legacy (React) | Upgraded (Vue 3 v2.0) |
| :--- | :--- | :--- |
| **Architecture** | Monolithic dashboard | **Modular Engine-based Design** |
| **State** | Standard Reducers | **Pinia (Cross-module persistence)** |
| **Routing** | Component switching | **Vue Router (Chamber Isolation)** |
| **Loading** | Bulk asset load | **Dynamic Import (On-demand play)** |
| **UX** | Static list | **Animated 3D Discovery Lobby** |
| **Stats** | Local only | **Global XP & Ticket Ecosystem** |
| **Games** | 1 placeholder | **3 Fully Playable Games** |
| **Unlock System** | None | **Ticket-based Unlocking** |

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

## 📝 Design Notes (V2)

### Intentional Quirk: The Daily Challenge Rotation
Every day, one game is featured with 2x ticket bonus. The rotation is deterministic (based on day of year), not random. This means you can predict tomorrow's challenge. The quirk: it's "unfair" that some days favor games you don't like. But that's life. Daily challenges should feel like weather—sometimes sunny, sometimes rainy. You learn all games or you wait.

### Tradeoff: LocalStorage Over Backend
All progress (tickets, unlocks, daily status) lives in localStorage. Clear your browser, lose everything. The tradeoff: no accounts, no passwords, no "sync across devices." This is an arcade you visit, not a home you own. The ephemeral nature makes each session feel self-contained.

### What I Chose NOT to Build
No microtransactions. The ticket economy could easily be "buy 1000 tickets for $0.99." I didn't build that. Virtual currencies in free games always lead to dark patterns. These tickets have no monetary value—they're just a progress abstraction. The only way to earn them is to play.