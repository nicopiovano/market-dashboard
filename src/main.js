import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// Dark mode por defecto (se puede expandir a toggle si querés)
document.documentElement.classList.add('dark')

app.use(createPinia())
app.use(router)
app.mount('#app')

