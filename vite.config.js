import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: { port: 5172 },
  appType: 'spa',
  preview: {
    strict: false, // sirve index.html para rutas como /login (evita 404)
  },
})

