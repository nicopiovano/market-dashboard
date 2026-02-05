<script setup>
import { computed, onMounted, ref } from 'vue'
import AppShell from '../ui/layouts/AppShell.vue'
import SourceTag from '../ui/components/SourceTag.vue'
import StatCard from '../ui/components/StatCard.vue'
import BarChart from '../ui/charts/BarChart.vue'
import LineChart from '../ui/charts/LineChart.vue'
import { useUiStore } from '../ui/store/uiStore'
import { useRatesStore } from '../dolar/store/ratesStore'
import { useCryptoStore } from '../crypto/store/cryptoStore'
import { useCommoditiesStore } from '../commodities/store/commoditiesStore'
import { inflationMock } from './mocks/inflation'
import { buildDeterministicHistory, pctReturn, sliceLastDays } from './utils/history'
import { formatDateAxisDM, formatPct } from '../ui/utils/format'

const ui = useUiStore()
const rates = useRatesStore()
const crypto = useCryptoStore()
const commodities = useCommoditiesStore()

const assetKey = ref('bitcoin') // bitcoin | ethereum | sp500 | gold | blue
const period = ref('30d') // 7d | 30d | 6m

onMounted(async () => {
  if (!rates.rates.length) await rates.refresh()
  if (!crypto.top.length) await crypto.refreshTop()
  if (!commodities.items.length) await commodities.load()

  // Calentamos cache básico
  await crypto.ensureHistory('bitcoin', 30)
  await crypto.ensureHistory('ethereum', 30)
})

const blue = computed(() => rates.byKey.blue ?? null)
const gold = computed(() => commodities.items.find((c) => c.key === 'gold') ?? null)

function periodDays() {
  return period.value === '7d' ? 7 : period.value === '30d' ? 30 : 180
}

function inflationPctForPeriod() {
  // Aproximación educativa:
  // - 7d: proporcional al último dato mensual / 30
  // - 30d: último dato mensual
  // - 6m: suma de últimos 6 meses
  const monthly = inflationMock.monthlyPct ?? []
  const last = monthly[monthly.length - 1]?.value ?? null
  if (period.value === '7d') return typeof last === 'number' ? (last * 7) / 30 : null
  if (period.value === '30d') return typeof last === 'number' ? last : null
  const last6 = monthly.slice(Math.max(0, monthly.length - 6)).map((p) => p.value)
  if (last6.some((v) => typeof v !== 'number')) return null
  return last6.reduce((a, b) => a + b, 0)
}

async function refreshForSelection() {
  await rates.refresh()
  await crypto.refreshTop()
  await commodities.load()

  const days = periodDays()
  if (assetKey.value === 'bitcoin') await crypto.ensureHistory('bitcoin', days)
  if (assetKey.value === 'ethereum') await crypto.ensureHistory('ethereum', days)
}

const series = computed(() => {
  const days = periodDays()

  // Dólar Blue (mock determinístico desde la venta actual)
  const blueBase = blue.value?.sell ?? null
  const blueSeries = blueBase == null ? [] : buildDeterministicHistory('blue', blueBase, days, { trendPerDay: 0.002, noiseScale: 0.007 })

  // Activo seleccionado
  let assetLabel = '—'
  let assetSeries = []

  if (assetKey.value === 'blue') {
    assetLabel = 'Dólar Blue'
    assetSeries = blueSeries
  } else if (assetKey.value === 'gold') {
    assetLabel = 'Oro (mock)'
    const base = gold.value?.priceUsd ?? null
    assetSeries = base == null ? [] : buildDeterministicHistory('gold', base, days, { trendPerDay: 0.0011, noiseScale: 0.006 })
  } else if (assetKey.value === 'sp500') {
    assetLabel = 'S&P 500 (mock)'
    const base = 4380.72
    assetSeries = buildDeterministicHistory('sp500', base, days, { trendPerDay: 0.001, noiseScale: 0.005 })
  } else if (assetKey.value === 'bitcoin') {
    assetLabel = 'Bitcoin (BTC)'
    const key = `bitcoin:${days}`
    assetSeries = crypto.historyByKey[key] ?? []
  } else if (assetKey.value === 'ethereum') {
    assetLabel = 'Ethereum (ETH)'
    const key = `ethereum:${days}`
    assetSeries = crypto.historyByKey[key] ?? []
  }

  return { assetLabel, assetSeries, blueSeries }
})

const assetReturn = computed(() => pctReturn(series.value.assetSeries))
const blueReturn = computed(() => pctReturn(series.value.blueSeries))
const inflReturn = computed(() => inflationPctForPeriod())

const comparisonHint = computed(() => {
  const a = assetReturn.value
  const d = blueReturn.value
  const i = inflReturn.value
  if (a == null || d == null || i == null) return 'Cargando series…'

  if (a >= d && a >= i) return 'El activo supera a dólar e inflación en esta ventana (contexto educativo).'
  if (a >= d && a < i) return 'El activo le gana al dólar, pero no a la inflación (en esta ventana).'
  if (a < d && a >= i) return 'El activo no le gana al dólar, pero sí a la inflación (en esta ventana).'
  return 'El activo queda por debajo de dólar e inflación en esta ventana.'
})

const barLabels = computed(() => [series.value.assetLabel, 'Dólar Blue', inflationMock.label])
const barValues = computed(() => [assetReturn.value ?? 0, blueReturn.value ?? 0, inflReturn.value ?? 0])

const chartLabels = computed(() => series.value.assetSeries.map((p) => formatDateAxisDM(p.date)))
const chartAsset = computed(() => series.value.assetSeries.map((p) => p.value))
const chartBlue = computed(() => series.value.blueSeries.map((p) => p.value))

const displaySeries = computed(() => {
  // Para el line chart, si las series tienen distintas longitudes (por API), recortamos al final.
  const a = series.value.assetSeries
  const b = series.value.blueSeries
  const len = Math.min(a.length, b.length)
  const a2 = len ? a.slice(a.length - len) : []
  const b2 = len ? b.slice(b.length - len) : []
  return { a2, b2 }
})

const displayLabels = computed(() => displaySeries.value.a2.map((p) => formatDateAxisDM(p.date)))
</script>

<template>
  <AppShell>
    <section class="panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">Comparador</div>
          <div class="text-xs muted">Rendimiento vs dólar vs inflación (mock) • educativo</div>
        </div>
        <div class="flex items-center gap-2">
          <SourceTag label="Inflación: mock • Dólar: mock desde valor actual • Cripto: CoinGecko" />
          <button
            type="button"
            class="rounded-lg border border-border bg-white/5 px-3 py-2 text-xs font-semibold text-text hover:bg-white/10 transition disabled:opacity-50"
            :disabled="ui.loading.rates || ui.loading.crypto || ui.loading.commodities"
            @click="refreshForSelection"
          >
            {{ ui.loading.rates || ui.loading.crypto || ui.loading.commodities ? 'Cargando…' : 'Actualizar' }}
          </button>
        </div>
      </div>

      <div class="p-4 space-y-4">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div class="panel bg-panel2 p-4">
            <div class="text-xs muted">Activo</div>
            <select v-model="assetKey" class="mt-2 w-full rounded-lg border border-border bg-black/20 px-3 py-2 text-sm text-text outline-none">
              <option value="bitcoin">Bitcoin (BTC)</option>
              <option value="ethereum">Ethereum (ETH)</option>
              <option value="gold">Oro (mock)</option>
              <option value="sp500">S&P 500 (mock)</option>
              <option value="blue">Dólar Blue</option>
            </select>
          </div>

          <div class="panel bg-panel2 p-4">
            <div class="text-xs muted">Ventana</div>
            <select v-model="period" class="mt-2 w-full rounded-lg border border-border bg-black/20 px-3 py-2 text-sm text-text outline-none">
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="6m">Últimos 6 meses</option>
            </select>
            <div class="mt-2 text-xs muted">Tip: para cripto, 6m puede rate-limitear en CoinGecko.</div>
          </div>

          <div class="panel bg-panel2 p-4">
            <div class="text-xs muted">Lectura rápida</div>
            <div class="mt-2 text-sm text-text font-semibold">{{ comparisonHint }}</div>
            <div class="mt-2 text-xs muted">No es recomendación; es contexto.</div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <StatCard :title="series.assetLabel" :value="formatPct(assetReturn)" value-sub="Retorno" :change-pct="assetReturn" />
          <StatCard title="Dólar Blue" :value="formatPct(blueReturn)" value-sub="Retorno" :change-pct="blueReturn" />
          <StatCard :title="inflationMock.label" :value="formatPct(inflReturn)" value-sub="Aprox." :change-pct="inflReturn" />
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div class="panel bg-panel2 p-4">
            <div class="text-sm font-semibold">Comparación de retornos (%)</div>
            <div class="mt-3">
              <BarChart
                :labels="barLabels"
                :datasets="[
                  {
                    label: '%',
                    data: barValues,
                    backgroundColor: ['rgba(96,165,250,0.35)', 'rgba(34,197,94,0.35)', 'rgba(245,158,11,0.35)'],
                    borderColor: ['rgba(96,165,250,0.9)', 'rgba(34,197,94,0.9)', 'rgba(245,158,11,0.9)'],
                    borderWidth: 1,
                  },
                ]"
                :height="260"
              />
            </div>
          </div>

          <div class="panel bg-panel2 p-4">
            <div class="text-sm font-semibold">Series (normalizadas por ventana)</div>
            <div class="mt-2 text-xs muted">Línea: activo (azul) vs Dólar Blue (verde). Valores absolutos, no retornos.</div>
            <div class="mt-3">
              <LineChart
                :labels="displayLabels"
                :datasets="[
                  { label: series.assetLabel, data: displaySeries.a2.map((p) => p.value), borderColor: 'rgba(96,165,250,0.9)', backgroundColor: 'rgba(96,165,250,0.12)' },
                  { label: 'Dólar Blue', data: displaySeries.b2.map((p) => p.value), borderColor: 'rgba(34,197,94,0.9)', backgroundColor: 'rgba(34,197,94,0.12)' }
                ]"
                :height="260"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </AppShell>
</template>

