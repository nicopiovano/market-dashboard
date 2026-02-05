<script setup>
import { computed, onMounted } from 'vue'
import AppShell from '../ui/layouts/AppShell.vue'
import { useRatesStore } from './store/ratesStore'
import { useUiStore } from '../ui/store/uiStore'
import AssetTable from '../ui/components/AssetTable.vue'
import TrendBadge from '../ui/components/TrendBadge.vue'
import SourceTag from '../ui/components/SourceTag.vue'
import LineChart from '../ui/charts/LineChart.vue'
import { formatArs, formatDateAxisDM } from '../ui/utils/format'

const ratesStore = useRatesStore()
const ui = useUiStore()

onMounted(async () => {
  if (!ratesStore.rates.length) await ratesStore.refresh()
})

const tabs = [
  { key: 'oficial', label: 'Oficial' },
  { key: 'blue', label: 'Blue' },
  { key: 'mep', label: 'MEP' },
  { key: 'ccl', label: 'CCL' },
]

const rows = computed(() =>
  ratesStore.rates.map((r) => ({
    key: r.key,
    label: r.label,
    buy: r.buy,
    sell: r.sell,
    changePct: r.dailyChange?.pct ?? null,
    updatedAt: r.updatedAt,
    source: r.source,
  })),
)

const columns = [
  { key: 'label', label: 'Tipo' },
  { key: 'buy', label: 'Compra', align: 'right' },
  { key: 'sell', label: 'Venta', align: 'right' },
  { key: 'changePct', label: 'Var. diaria', align: 'right' },
  { key: 'updatedAt', label: 'Actualización', align: 'right' },
]

const selected = computed(() => ratesStore.selectedRate)
const chartLabels = computed(() => (selected.value?.history ?? []).map((p) => formatDateAxisDM(p.date)))
const chartData = computed(() => (selected.value?.history ?? []).map((p) => p.value))
</script>

<template>
  <AppShell>
    <section class="panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">Dólar</div>
          <div class="text-xs muted">Comparativa de tipos + fuente + histórico simple</div>
        </div>
        <div class="flex items-center gap-2">
          <SourceTag :label="selected?.source ?? '—'" />
          <button
            type="button"
            class="rounded-lg border border-border bg-white/5 px-3 py-2 text-xs font-semibold text-text hover:bg-white/10 transition disabled:opacity-50"
            :disabled="ui.loading.rates"
            @click="ratesStore.refresh()"
          >
            {{ ui.loading.rates ? 'Cargando…' : 'Actualizar' }}
          </button>
        </div>
      </div>

      <div v-if="ui.error.rates" class="p-4">
        <div class="rounded-lg border border-orange-400/20 bg-orange-400/10 px-4 py-3 text-sm text-orange-200">
          {{ ui.error.rates }}
        </div>
      </div>

      <div class="p-4 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="t in tabs"
              :key="t.key"
              type="button"
              class="rounded-lg border px-3 py-2 text-xs font-semibold transition"
              :class="
                ratesStore.selectedKey === t.key
                  ? 'border-border bg-white/10 text-text'
                  : 'border-transparent bg-white/5 text-muted hover:bg-white/10'
              "
              @click="ratesStore.setSelected(t.key)"
            >
              {{ t.label }}
            </button>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs muted">Sin tiempo real • fetch manual</span>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div class="panel bg-panel2 p-4">
            <div class="flex items-center justify-between">
              <div class="text-sm font-semibold">{{ selected?.label ?? '—' }}</div>
              <TrendBadge :value-pct="selected?.dailyChange?.pct ?? null" />
            </div>
            <div class="mt-2 text-xs muted">Histórico (mock) últimos 30 días</div>
            <div class="mt-3">
              <LineChart
                :labels="chartLabels"
                :datasets="[
                  {
                    label: 'Venta',
                    data: chartData,
                    borderColor: 'rgba(34,197,94,0.9)',
                    backgroundColor: 'rgba(34,197,94,0.15)',
                  },
                ]"
                :height="240"
              />
            </div>
          </div>

          <div class="panel bg-panel2 p-4">
            <div class="text-sm font-semibold">Tabla comparativa</div>
            <div class="mt-2 text-xs muted">
              Datos actuales: <span class="font-mono">dolarapi.com</span>. Variación diaria: contra el último snapshot
              guardado localmente.
            </div>

            <div class="mt-4">
              <AssetTable :columns="columns" :rows="rows" :row-key="(r) => r.key">
                <template #cell-buy="{ row }">
                  <span class="font-semibold text-text">{{ formatArs(row.buy) }}</span>
                </template>
                <template #cell-sell="{ row }">
                  <span class="font-semibold text-text">{{ formatArs(row.sell) }}</span>
                </template>
                <template #cell-changePct="{ row }">
                  <TrendBadge :value-pct="row.changePct" />
                </template>
                <template #cell-updatedAt="{ row }">
                  <span class="text-xs muted">{{ row.updatedAt ? row.updatedAt.slice(0, 16).replace('T', ' ') : '—' }}</span>
                </template>
              </AssetTable>
            </div>
          </div>
        </div>
      </div>
    </section>
  </AppShell>
</template>

