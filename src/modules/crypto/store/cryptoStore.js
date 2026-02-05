import { defineStore } from 'pinia'
import { fetchCryptoHistory, fetchCryptoHistory7d, fetchTopCryptoByMarketCap } from '../services/coingecko'
import { useUiStore } from '../../ui/store/uiStore'

export const useCryptoStore = defineStore('crypto', {
  state: () => ({
    top: [],
    selectedId: 'bitcoin',
    history7d: [],
    history7dById: {},
    historyByKey: {},
    lastFetchedAt: null,
  }),
  getters: {
    selected(state) {
      return state.top.find((c) => c.id === state.selectedId) ?? null
    },
  },
  actions: {
    setSelected(id) {
      this.selectedId = id
    },

    async refreshTop() {
      const ui = useUiStore()
      ui.setLoading('crypto', true)
      ui.clearError('crypto')
      try {
        const top = await fetchTopCryptoByMarketCap(10)
        this.top = top
        if (!top.some((c) => c.id === this.selectedId)) {
          this.selectedId = top[0]?.id ?? 'bitcoin'
        }
        this.lastFetchedAt = new Date().toISOString()
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error desconocido'
        ui.setError('crypto', `No se pudo cargar Cripto: ${msg}`)
      } finally {
        ui.setLoading('crypto', false)
      }
    },

    async refreshHistory7d() {
      const ui = useUiStore()
      ui.setLoading('crypto', true)
      ui.clearError('crypto')
      try {
        const points = await fetchCryptoHistory7d(this.selectedId)
        this.history7d = points
        this.history7dById[this.selectedId] = points
        this.lastFetchedAt = new Date().toISOString()
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error desconocido'
        ui.setError('crypto', `No se pudo cargar histórico (7d): ${msg}`)
      } finally {
        ui.setLoading('crypto', false)
      }
    },

    async ensureHistory7d(id) {
      if (this.history7dById[id]?.length) return
      const ui = useUiStore()
      ui.setLoading('crypto', true)
      ui.clearError('crypto')
      try {
        const points = await fetchCryptoHistory7d(id)
        this.history7dById[id] = points
        if (id === this.selectedId) this.history7d = points
        this.lastFetchedAt = new Date().toISOString()
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error desconocido'
        ui.setError('crypto', `No se pudo cargar histórico (7d): ${msg}`)
      } finally {
        ui.setLoading('crypto', false)
      }
    },

    async ensureHistory(id, days) {
      const key = `${id}:${days}`
      if (this.historyByKey[key]?.length) return
      const ui = useUiStore()
      ui.setLoading('crypto', true)
      ui.clearError('crypto')
      try {
        const points = await fetchCryptoHistory(id, days)
        this.historyByKey[key] = points
        this.lastFetchedAt = new Date().toISOString()
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error desconocido'
        ui.setError('crypto', `No se pudo cargar histórico (${days}d): ${msg}`)
      } finally {
        ui.setLoading('crypto', false)
      }
    },

    async refreshAll() {
      await this.refreshTop()
      await this.refreshHistory7d()
    },
  },
})

