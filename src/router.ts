import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'lobby',
      component: () => import('./views/Lobby.vue')
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
