<script setup>
import { computed, onMounted } from 'vue'
import AppShell from '../ui/layouts/AppShell.vue'
import AssetTable from '../ui/components/AssetTable.vue'
import TrendBadge from '../ui/components/TrendBadge.vue'
import SourceTag from '../ui/components/SourceTag.vue'
import { useCedearsStore } from './store/cedearsStore'
import { useRatesStore } from '../dolar/store/ratesStore'
import { useUiStore } from '../ui/store/uiStore'
import { formatArs, formatCompact, formatUsd } from '../ui/utils/format'

const cedears = useCedearsStore()
const rates = useRatesStore()
const ui = useUiStore()

onMounted(async () => {
  if (!cedears.items.length) await cedears.load()
  if (!rates.rates.length) await rates.refresh()
})

const ccl = computed(() => rates.byKey.ccl ?? null)
const rows = computed(() => cedears.toRows(ccl.value))

const columns = [
  { key: 'ticker', label: 'Ticker' },
  { key: 'name', label: 'Nombre' },
  { key: 'sector', label: 'Sector' },
  { key: 'ratio', label: 'Ratio', align: 'right' },
  { key: 'priceArs', label: 'Precio (ARS)', align: 'right' },
  { key: 'changeDailyPct', label: 'Var. diaria', align: 'right' },
  { key: 'usdPerCedear', label: 'USD (CCL)', align: 'right' },
  { key: 'usdUnderlyingApprox', label: 'USD subyacente (aprox)', align: 'right' },
]

function onQueryInput(e) {
  cedears.setQuery(e.target.value)
}

function onSectorChange(e) {
  cedears.setSector(e.target.value)
}
</script>

<template>
  <AppShell>
    <section class="panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">CEDEARs</div>
          <div class="text-xs muted">Lista filtrable + ratio + sector + comparación vs CCL (mock)</div>
        </div>
        <div class="flex items-center gap-2">
          <SourceTag :label="cedears.source" />
          <button
            type="button"
            class="rounded-lg border border-border bg-white/5 px-3 py-2 text-xs font-semibold text-text hover:bg-white/10 transition disabled:opacity-50"
            :disabled="ui.loading.cedears"
            @click="cedears.load()"
          >
            {{ ui.loading.cedears ? 'Cargando…' : 'Actualizar' }}
          </button>
        </div>
      </div>

      <div v-if="ui.error.cedears" class="p-4">
        <div class="rounded-lg border border-orange-400/20 bg-orange-400/10 px-4 py-3 text-sm text-orange-200">
          {{ ui.error.cedears }}
        </div>
      </div>

      <div class="p-4 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <div class="panel bg-panel2 px-3 py-2">
              <label class="text-xs muted">Buscar</label>
              <input
                class="mt-1 w-60 bg-transparent text-sm text-text outline-none placeholder:text-muted/60"
                placeholder="AAPL, Tesla…"
                :value="cedears.query"
                @input="onQueryInput"
              />
            </div>

            <div class="panel bg-panel2 px-3 py-2">
              <label class="text-xs muted">Sector</label>
              <select class="mt-1 w-56 bg-transparent text-sm text-text outline-none" :value="cedears.sector" @change="onSectorChange">
                <option v-for="s in cedears.sectors" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs muted">
              CCL usado: <span class="font-mono text-text">{{ ccl?.sell ? formatArs(ccl.sell) : 'mock' }}</span>
            </span>
            <span class="text-xs muted">
              Actualizado: <span class="font-mono text-text">{{ cedears.loadedAt ? cedears.loadedAt.slice(11, 19) : '—' }}</span>
            </span>
            <span class="text-xs muted">Items: {{ formatCompact(rows.length) }}</span>
          </div>
        </div>

        <div class="panel bg-panel2 p-4">
          <div class="text-sm font-semibold">Tabla (mock local)</div>
          <div class="mt-2 text-xs muted">
            La columna <span class="font-semibold">USD (CCL)</span> es el precio ARS convertido por CCL. “USD subyacente” multiplica por el ratio para un proxy educativo.
          </div>

          <div class="mt-4">
            <AssetTable :columns="columns" :rows="rows" :row-key="(r) => r.ticker">
              <template #cell-ticker="{ row }">
                <span class="font-mono font-semibold text-text">{{ row.ticker }}</span>
              </template>
              <template #cell-priceArs="{ row }">
                <span class="font-semibold text-text">{{ formatArs(row.priceArs) }}</span>
              </template>
              <template #cell-changeDailyPct="{ row }">
                <TrendBadge :value-pct="row.changeDailyPct" />
              </template>
              <template #cell-usdPerCedear="{ row }">
                <span class="text-text">{{ formatUsd(row.usdPerCedear) }}</span>
              </template>
              <template #cell-usdUnderlyingApprox="{ row }">
                <span class="text-text">{{ formatUsd(row.usdUnderlyingApprox) }}</span>
              </template>
            </AssetTable>
          </div>
        </div>
      </div>
    </section>
  </AppShell>
</template>

