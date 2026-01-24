import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useSettingsStore } from './stores/settings'
import { useStatsStore } from './stores/stats'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const settings = useSettingsStore()
const stats = useStatsStore()

settings.loadFromStorage()
settings.applyTheme()
stats.loadFromStorage()

app.mount('#app')
