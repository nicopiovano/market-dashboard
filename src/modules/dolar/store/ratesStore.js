import { defineStore } from 'pinia'
import { fetchDollarRates } from '../services/dolarApi'
import { buildDollarHistory } from '../mocks/dollarHistory'
import { useUiStore } from '../../ui/store/uiStore'

const LS_KEY = 'market-dashboard:ratedSnapshot:v1'

function loadSnapshot() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveSnapshot(snap) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(snap))
  } catch {
    // ignore
  }
}

export const useRatesStore = defineStore('rates', {
  state: () => ({
    rates: [],
    selectedKey: 'blue',
    lastFetchedAt: null,
  }),
  getters: {
    byKey(state) {
      const m = {}
      for (const r of state.rates) m[r.key] = r
      return m
    },
    selectedRate(state) {
      return state.rates.find((r) => r.key === state.selectedKey) ?? null
    },
  },
  actions: {
    setSelected(key) {
      this.selectedKey = key
    },

    async refresh() {
      const ui = useUiStore()
      ui.setLoading('rates', true)
      ui.clearError('rates')
      try {
        const prev = loadSnapshot()
        const now = await fetchDollarRates()

        for (const r of now) {
          const prevSell = prev?.sellByKey?.[r.key]
          if (typeof prevSell === 'number' && prevSell > 0) {
            const abs = r.sell - prevSell
            r.dailyChange = { abs, pct: (abs / prevSell) * 100 }
          } else {
            r.dailyChange = null
          }
          r.history = buildDollarHistory(r.key, r.sell, 30)
        }

        this.rates = now
        this.lastFetchedAt = new Date().toISOString()

        saveSnapshot({
          at: this.lastFetchedAt,
          sellByKey: Object.fromEntries(now.map((r) => [r.key, r.sell])),
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error desconocido'
        ui.setError('rates', `No se pudo cargar Dólar: ${msg}`)
      } finally {
        ui.setLoading('rates', false)
      }
    },
  },
})

