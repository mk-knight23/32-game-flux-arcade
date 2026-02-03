<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import Lobby from '../views/Lobby.vue'
import SeniorDance from '../arcade/senior-dance/SeniorDance.vue'
import FoodFrenzy from '../arcade/food-frenzy/FoodFrenzy.vue'
import CatChaos from '../arcade/cat-chaos/CatChaos.vue'
import GameChamber from '../views/GameChamber.vue'

const router = useRouter()
const gameStore = useGameStore()

// Get game ID from route or default to lobby
const gameId = computed(() => router.currentRoute.value.params.id?.toString())

// Determine which component to show
const gameComponent = computed(() => {
  if (!gameId.value) {
    return Lobby
  }

  switch (gameId.value) {
    case 'senior-dance':
      return SeniorDance
    case 'food-frenzy':
      return FoodFrenzy
    case 'cat-chaos':
      return CatChaos
    default:
      return GameChamber
  }
})

// Handle game completion
function handleGameComplete(score: number) {
  if (gameId.value) {
    gameStore.addScore(score)
  }
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Navigation -->
    <nav v-if="gameId" class="fixed top-0 left-0 right-0 z-50 bg-flux-card/80 backdrop-blur-sm border-b border-flux-neon/20 p-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <button
          @click="router.push('/')"
          class="flex items-center gap-2 text-flux-neon hover:text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Lobby
        </button>

        <div v-if="gameId" class="text-center">
          <h2 class="text-lg font-display font-bold uppercase text-white">
            {{ gameId }}
          </h2>
        </div>

        <div class="w-20"></div> <!-- Spacer for alignment -->
      </div>
    </nav>

    <!-- Game Content -->
    <div class="pt-16" v-if="gameComponent">
      <component
        :is="gameComponent"
        @game-complete="handleGameComplete"
      />
    </div>
    <div v-else class="pt-16">
      <component :is="gameComponent" />
    </div>
  </div>
</template>