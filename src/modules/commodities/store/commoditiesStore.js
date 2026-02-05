import { defineStore } from 'pinia'
import { useUiStore } from '../../ui/store/uiStore'
import { commoditiesMock } from '../mocks/commodities'

function toPack(items) {
  const first = items[0]
  const lastDate = first?.history?.[first.history.length - 1]?.date
  const updatedAt = lastDate ? `${lastDate}T00:00:00Z` : null
  return { source: 'mock-local', items, updatedAt }
}

export const useCommoditiesStore = defineStore('commodities', {
  state: () => ({
    items: [],
    source: 'mock-local',
    updatedAt: null,
    selectedKey: 'gold',
  }),
  getters: {
    selected(state) {
      return state.items.find((c) => c.key === state.selectedKey) ?? null
    },
  },
  actions: {
    setSelected(key) {
      this.selectedKey = key
    },
    async load() {
      const ui = useUiStore()
      ui.setLoading('commodities', true)
      ui.clearError('commodities')
      try {
        const pack = toPack(commoditiesMock)
        this.items = pack.items
        this.source = pack.source
        this.updatedAt = pack.updatedAt
        if (!this.items.some((c) => c.key === this.selectedKey)) {
          this.selectedKey = this.items[0]?.key ?? 'gold'
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error desconocido'
        ui.setError('commodities', `No se pudo cargar Commodities (mock): ${msg}`)
      } finally {
        ui.setLoading('commodities', false)
      }
    },
  },
})

