import { defineStore } from 'pinia'

// Keys de carga por módulo (simple y extensible).
// Nota: es JS puro; usamos strings para mantenerlo liviano.
export const useUiStore = defineStore('ui', {
  state: () => ({
    loading: {},
    error: {},
  }),
  actions: {
    setLoading(key, value) {
      this.loading[key] = value
    },
    setError(key, value) {
      this.error[key] = value
    },
    clearError(key) {
      this.error[key] = null
    },
  },
})

