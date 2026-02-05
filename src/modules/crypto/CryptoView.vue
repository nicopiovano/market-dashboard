<script setup>
import { computed, onMounted, watch } from 'vue'
import AppShell from '../ui/layouts/AppShell.vue'
import { useCryptoStore } from './store/cryptoStore'
import { useUiStore } from '../ui/store/uiStore'
import AssetTable from '../ui/components/AssetTable.vue'
import TrendBadge from '../ui/components/TrendBadge.vue'
import SourceTag from '../ui/components/SourceTag.vue'
import LineChart from '../ui/charts/LineChart.vue'
import { formatCompact, formatDateAxisDM, formatUsd } from '../ui/utils/format'

const crypto = useCryptoStore()
const ui = useUiStore()

onMounted(async () => {
  if (!crypto.top.length) await crypto.refreshAll()
})

watch(
  () => crypto.selectedId,
  async () => {
    await crypto.ensureHistory7d(crypto.selectedId)
  },
)

const rows = computed(() =>
  crypto.top.map((c) => ({
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    priceUsd: c.priceUsd,
    change24hPct: c.change24hPct,
    marketCapUsd: c.marketCapUsd,
  })),
)

const columns = [
  { key: 'symbol', label: 'Ticker' },
  { key: 'name', label: 'Activo' },
  { key: 'priceUsd', label: 'Precio (USD)', align: 'right' },
  { key: 'change24hPct', label: 'Var. 24h', align: 'right' },
  { key: 'marketCapUsd', label: 'Market Cap', align: 'right' },
]

const labels = computed(() => crypto.history7d.map((p) => formatDateAxisDM(p.date)))
const data = computed(() => crypto.history7d.map((p) => p.value))

function onSelectChange(e) {
  crypto.setSelected(e.target.value)
}
</script>

<template>
  <AppShell>
    <section class="panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">Cripto</div>
          <div class="text-xs muted">Top 10 market cap + variación 24h + gráfico</div>
        </div>
        <div class="flex items-center gap-2">
          <SourceTag label="CoinGecko API (free)" />
          <button
            type="button"
            class="rounded-lg border border-border bg-white/5 px-3 py-2 text-xs font-semibold text-text hover:bg-white/10 transition disabled:opacity-50"
            :disabled="ui.loading.crypto"
            @click="crypto.refreshAll()"
          >
            {{ ui.loading.crypto ? 'Cargando…' : 'Actualizar' }}
          </button>
        </div>
      </div>

      <div v-if="ui.error.crypto" class="p-4">
        <div class="rounded-lg border border-orange-400/20 bg-orange-400/10 px-4 py-3 text-sm text-orange-200">
          {{ ui.error.crypto }}
        </div>
      </div>

      <div class="p-4 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs muted">Sin auth • sin tiempo real</span>
          </div>
          <div class="text-xs muted">Items: {{ formatCompact(rows.length) }}</div>
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div class="panel bg-panel2 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-sm font-semibold">{{ crypto.selected?.name ?? '—' }}</div>
                <div class="mt-1 text-xs muted">
                  {{ crypto.selected?.symbol ?? '—' }} •
                  <span class="font-semibold text-text">{{ formatUsd(crypto.selected?.priceUsd) }}</span>
                  <span class="ml-2">
                    <TrendBadge :value-pct="crypto.selected?.change24hPct ?? null" />
                  </span>
                </div>
              </div>
              <div class="panel bg-black/20 px-3 py-2">
                <label class="text-xs muted">Seleccionar</label>
                <select class="mt-1 w-56 bg-transparent text-sm text-text outline-none" :value="crypto.selectedId" @change="onSelectChange">
                  <option v-for="c in crypto.top" :key="c.id" :value="c.id">{{ c.name }} ({{ c.symbol }})</option>
                </select>
              </div>
            </div>

            <div class="mt-2 text-xs muted">Precio (7 días)</div>
            <div class="mt-3">
              <LineChart
                :labels="labels"
                :datasets="[
                  {
                    label: 'USD',
                    data,
                    borderColor: 'rgba(96,165,250,0.9)',
                    backgroundColor: 'rgba(96,165,250,0.12)',
                  },
                ]"
                :height="240"
              />
            </div>
          </div>

          <div class="panel bg-panel2 p-4">
            <div class="text-sm font-semibold">Top 10 por market cap</div>
            <div class="mt-2 text-xs muted">El top se ordena por capitalización. No es recomendación; es contexto de mercado.</div>

            <div class="mt-4">
              <AssetTable :columns="columns" :rows="rows" :row-key="(r) => r.id">
                <template #cell-symbol="{ row }">
                  <button
                    type="button"
                    class="font-mono font-semibold text-text hover:underline"
                    :class="crypto.selectedId === row.id ? 'text-info' : ''"
                    @click="crypto.setSelected(row.id)"
                  >
                    {{ row.symbol }}
                  </button>
                </template>
                <template #cell-priceUsd="{ row }">
                  <span class="font-semibold text-text">{{ formatUsd(row.priceUsd) }}</span>
                </template>
                <template #cell-change24hPct="{ row }">
                  <TrendBadge :value-pct="row.change24hPct" />
                </template>
                <template #cell-marketCapUsd="{ row }">
                  <span class="text-text">{{ row.marketCapUsd == null ? '—' : formatCompact(row.marketCapUsd) }}</span>
                </template>
              </AssetTable>
            </div>

            <div class="mt-3 text-xs muted">Si ves errores intermitentes, puede ser rate limit (429). Esperá 30–60s y reintentá.</div>
          </div>
        </div>
      </div>
    </section>
  </AppShell>
</template>

