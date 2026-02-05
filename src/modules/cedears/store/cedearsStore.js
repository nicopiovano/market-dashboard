import { defineStore } from 'pinia'
import { useUiStore } from '../../ui/store/uiStore'

const CCL_FALLBACK_MOCK = 1200 // educativo: si no está cargado el CCL real.

export const useCedearsStore = defineStore('cedears', {
  state: () => ({
    items: [],
    source: 'mock-local',
    updatedAt: null,
    loadedAt: null,
    query: '',
    sector: 'Todos',
  }),
  getters: {
    sectors(state) {
      const set = new Set()
      for (const i of state.items) set.add(i.sector)
      return ['Todos', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
    },
    filtered(state) {
      const q = state.query.trim().toLowerCase()
      return state.items.filter((i) => {
        const matchQ = !q || i.ticker.toLowerCase().includes(q) || i.name.toLowerCase().includes(q)
        const matchSector = state.sector === 'Todos' || i.sector === state.sector
        return matchQ && matchSector
      })
    },
  },
  actions: {
    setQuery(v) {
      this.query = v
    },
    setSector(v) {
      this.sector = v
    },
    async load() {
      const ui = useUiStore()
      ui.setLoading('cedears', true)
      ui.clearError('cedears')
      try {
        const mod = await import('../mocks/cedears.json')
        const data = mod.default
        this.items = Array.isArray(data.items) ? data.items : []
        this.source = data.source ?? 'mock-local'
        this.updatedAt = data.updatedAt ?? null
        this.loadedAt = new Date().toISOString()
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error desconocido'
        ui.setError('cedears', `No se pudo cargar CEDEARs (mock): ${msg}`)
      } finally {
        ui.setLoading('cedears', false)
      }
    },

    toRows(cclRate) {
      const ccl = cclRate?.sell ?? CCL_FALLBACK_MOCK
      return this.filtered
        .slice()
        .sort((a, b) => a.ticker.localeCompare(b.ticker))
        .map((c) => {
          const usdPerCedear = ccl > 0 ? c.priceArs / ccl : null
          const usdUnderlyingApprox = usdPerCedear == null ? null : usdPerCedear * c.ratio
          return {
            ...c,
            usdPerCedear: usdPerCedear == null ? null : Number(usdPerCedear.toFixed(2)),
            usdUnderlyingApprox: usdUnderlyingApprox == null ? null : Number(usdUnderlyingApprox.toFixed(2)),
            cclUsed: ccl,
            source: this.source,
            updatedAt: this.updatedAt ?? '',
          }
        })
    },
  },
})

