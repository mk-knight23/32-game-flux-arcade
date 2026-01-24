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

## Tech Stack
- **Framework:** Vue 3.5 (Composition API)
- **Routing:** Vue Router 4
- **State:** Pinia (Enterprise patterns)
- **Styling:** Tailwind CSS (Neon-modern palette)
- **Icons:** Lucide Vue

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
