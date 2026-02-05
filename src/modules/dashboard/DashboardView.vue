<script setup>
import { computed, onMounted, ref } from 'vue'
import AppShell from '../ui/layouts/AppShell.vue'
import StatCard from '../ui/components/StatCard.vue'
import SourceTag from '../ui/components/SourceTag.vue'
import LineChart from '../ui/charts/LineChart.vue'
import BarChart from '../ui/charts/BarChart.vue'
import { useUiStore } from '../ui/store/uiStore'
import { useRatesStore } from '../dolar/store/ratesStore'
import { useCryptoStore } from '../crypto/store/cryptoStore'
import { useCommoditiesStore } from '../commodities/store/commoditiesStore'
import { sp500Mock } from './mocks/indices'
import { formatArs, formatCompact, formatDateAxisDM, formatUsd } from '../ui/utils/format'

const ui = useUiStore()
const rates = useRatesStore()
const crypto = useCryptoStore()
const commodities = useCommoditiesStore()

const chartTab = ref('dolar')

onMounted(async () => {
  if (!rates.rates.length) await rates.refresh()
  if (!crypto.top.length) await crypto.refreshTop()
  await crypto.ensureHistory7d('bitcoin')
  await crypto.ensureHistory7d('ethereum')
  if (!commodities.items.length) await commodities.load()
})

const lastUpdate = computed(() => {
  const candidates = [rates.lastFetchedAt, crypto.lastFetchedAt, commodities.updatedAt].filter(Boolean)
  if (!candidates.length) return null
  candidates.sort()
  return candidates[candidates.length - 1]
})

const oficial = computed(() => rates.byKey.oficial ?? null)
const blue = computed(() => rates.byKey.blue ?? null)
const mep = computed(() => rates.byKey.mep ?? null)

const btc = computed(() => crypto.top.find((c) => c.id === 'bitcoin') ?? null)
const eth = computed(() => crypto.top.find((c) => c.id === 'ethereum') ?? null)

const gold = computed(() => commodities.items.find((c) => c.key === 'gold') ?? null)

const btcHist = computed(() => crypto.history7dById['bitcoin'] ?? [])
const blueHist = computed(() => blue.value?.history ?? [])

const barLabels = ['Dólar Blue', 'BTC', 'S&P 500', 'Oro']
const barValues = computed(() => [
  blue.value?.dailyChange?.pct ?? 0,
  btc.value?.change24hPct ?? 0,
  sp500Mock.changeDailyPct ?? 0,
  gold.value?.changeDailyPct ?? 0,
])

const hint = computed(() => {
  const d = blue.value?.dailyChange?.pct ?? null
  const c = btc.value?.change24hPct ?? null
  if (d == null || c == null) return 'Cuando carguen los datos, vas a ver pistas automáticas según el movimiento del dólar y los activos.'
  if (d > 0 && c > 0) return 'Si el dólar sube y el activo acompaña, suele “cubrir” parte de la inflación (contexto educativo).'
  if (d > 0 && c < 0) return 'Dólar al alza y cripto a la baja: ojo con la volatilidad; mirá ventanas más largas.'
  if (d < 0 && c > 0) return 'Dólar estable/bajando con cripto al alza: puede ser riesgo-on global (no recomendación).'
  return 'Movimientos mixtos: compará contra inflación y horizonte (semanal/mensual) para contexto.'
})

async function refreshAll() {
  await rates.refresh()
  await crypto.refreshTop()
  await crypto.ensureHistory7d('bitcoin')
  await commodities.load()
}
</script>

<template>
  <AppShell>
    <section class="panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">Dashboard</div>
          <div class="text-xs muted">Resumen educativo (sin tiempo real)</div>
        </div>
        <div class="flex items-center gap-2">
          <SourceTag label="Dólar: dolarapi.com • Cripto: CoinGecko • Resto: mocks" />
          <div class="text-xs muted">
            Última actualización:
            <span class="font-mono text-text">{{ lastUpdate ? lastUpdate.slice(0, 16).replace('T', ' ') : '—' }}</span>
          </div>
          <button
            type="button"
            class="rounded-lg border border-border bg-white/5 px-3 py-2 text-xs font-semibold text-text hover:bg-white/10 transition disabled:opacity-50"
            :disabled="ui.loading.rates || ui.loading.crypto || ui.loading.commodities"
            @click="refreshAll"
          >
            {{ ui.loading.rates || ui.loading.crypto || ui.loading.commodities ? 'Cargando…' : 'Actualizar' }}
          </button>
        </div>
      </div>

      <div class="p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-xs muted">No es asesoramiento financiero</span>
          <div class="text-xs muted">
            Snapshot: {{ formatCompact(rates.rates.length + crypto.top.length + commodities.items.length) }} items
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Dólar oficial" :value="formatArs(oficial?.sell ?? null)" value-sub="Venta" :change-pct="oficial?.dailyChange?.pct ?? null" />
          <StatCard title="Dólar blue" :value="formatArs(blue?.sell ?? null)" value-sub="Venta" :change-pct="blue?.dailyChange?.pct ?? null" />
          <StatCard title="Dólar MEP" :value="formatArs(mep?.sell ?? null)" value-sub="Venta" :change-pct="mep?.dailyChange?.pct ?? null" />

          <StatCard title="Bitcoin (BTC)" :value="formatUsd(btc?.priceUsd ?? null)" value-sub="Precio" :change-pct="btc?.change24hPct ?? null" />
          <StatCard title="Ethereum (ETH)" :value="formatUsd(eth?.priceUsd ?? null)" value-sub="Precio" :change-pct="eth?.change24hPct ?? null" />

          <StatCard
            title="S&P 500 (mock)"
            :value="sp500Mock.last.toLocaleString('en-US', { maximumFractionDigits: 2 })"
            value-sub="Índice"
            :change-pct="sp500Mock.changeDailyPct"
          />
          <StatCard title="Oro (mock)" :value="formatUsd(gold?.priceUsd ?? null)" :value-sub="gold ? gold.unit : undefined" :change-pct="gold?.changeDailyPct ?? null" />
        </div>

        <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div class="panel bg-panel2 p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="text-sm font-semibold">Gráficos</div>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
                  :class="chartTab === 'dolar' ? 'border-border bg-white/10 text-text' : 'border-transparent bg-white/5 text-muted hover:bg-white/10'"
                  @click="chartTab = 'dolar'"
                >
                  Dólar
                </button>
                <button
                  type="button"
                  class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
                  :class="chartTab === 'cripto' ? 'border-border bg-white/10 text-text' : 'border-transparent bg-white/5 text-muted hover:bg-white/10'"
                  @click="chartTab = 'cripto'"
                >
                  Cripto
                </button>
                <button
                  type="button"
                  class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
                  :class="chartTab === 'indices' ? 'border-border bg-white/10 text-text' : 'border-transparent bg-white/5 text-muted hover:bg-white/10'"
                  @click="chartTab = 'indices'"
                >
                  Índices
                </button>
                <button
                  type="button"
                  class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
                  :class="
                    chartTab === 'commodities'
                      ? 'border-border bg-white/10 text-text'
                      : 'border-transparent bg-white/5 text-muted hover:bg-white/10'
                  "
                  @click="chartTab = 'commodities'"
                >
                  Commodities
                </button>
              </div>
            </div>

            <div class="mt-3">
              <LineChart
                v-if="chartTab === 'dolar'"
                :labels="blueHist.map((p) => formatDateAxisDM(p.date))"
                :datasets="[
                  { label: 'Blue (venta)', data: blueHist.map((p) => p.value), borderColor: 'rgba(34,197,94,0.9)', backgroundColor: 'rgba(34,197,94,0.12)' }
                ]"
                :height="240"
              />
              <LineChart
                v-else-if="chartTab === 'cripto'"
                :labels="btcHist.map((p) => formatDateAxisDM(p.date))"
                :datasets="[
                  { label: 'BTC (USD)', data: btcHist.map((p) => p.value), borderColor: 'rgba(96,165,250,0.9)', backgroundColor: 'rgba(96,165,250,0.12)' }
                ]"
                :height="240"
              />
              <LineChart
                v-else-if="chartTab === 'indices'"
                :labels="sp500Mock.history.map((p) => formatDateAxisDM(p.date))"
                :datasets="[
                  { label: 'S&P 500 (mock)', data: sp500Mock.history.map((p) => p.value), borderColor: 'rgba(245,158,11,0.9)', backgroundColor: 'rgba(245,158,11,0.12)' }
                ]"
                :height="240"
              />
              <LineChart
                v-else
                :labels="(gold?.history ?? []).map((p) => formatDateAxisDM(p.date))"
                :datasets="[
                  { label: 'Oro (mock)', data: (gold?.history ?? []).map((p) => p.value), borderColor: 'rgba(34,197,94,0.9)', backgroundColor: 'rgba(34,197,94,0.12)' }
                ]"
                :height="240"
              />
            </div>
          </div>

          <div class="panel bg-panel2 p-4">
            <div class="text-sm font-semibold">Contexto rápido</div>
            <p class="mt-2 text-sm muted">{{ hint }}</p>

            <div class="mt-4">
              <div class="text-sm font-semibold">Variación diaria (comparativa)</div>
              <div class="mt-2 text-xs muted">Barras: % (Dólar es contra snapshot local; resto 24h o mock)</div>
              <div class="mt-3">
                <BarChart
                  :labels="barLabels"
                  :datasets="[
                    {
                      label: '%',
                      data: barValues,
                      backgroundColor: ['rgba(34,197,94,0.35)', 'rgba(96,165,250,0.35)', 'rgba(245,158,11,0.35)', 'rgba(34,197,94,0.35)'],
                      borderColor: ['rgba(34,197,94,0.9)', 'rgba(96,165,250,0.9)', 'rgba(245,158,11,0.9)', 'rgba(34,197,94,0.9)'],
                      borderWidth: 1,
                    },
                  ]"
                  :height="240"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </AppShell>
</template>

