import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'lobby',
      component: () => import('./pages/Game.vue')
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('./pages/Stats.vue')
    },
    {
      path: '/achievements',
      name: 'achievements',
      component: () => import('./pages/Achievements.vue')
    },
    {
      path: '/play/:id',
      name: 'game',
      component: () => import('./views/GameChamber.vue'),
      props: true
    }
  ]
})

export default router
