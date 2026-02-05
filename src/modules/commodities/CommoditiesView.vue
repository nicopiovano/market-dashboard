<script setup>
import { computed, onMounted } from 'vue'
import AppShell from '../ui/layouts/AppShell.vue'
import { useCommoditiesStore } from './store/commoditiesStore'
import { useUiStore } from '../ui/store/uiStore'
import TrendBadge from '../ui/components/TrendBadge.vue'
import SourceTag from '../ui/components/SourceTag.vue'
import LineChart from '../ui/charts/LineChart.vue'
import { formatDateAxisDM, formatDateShortEs, formatUsd } from '../ui/utils/format'

const commodities = useCommoditiesStore()
const ui = useUiStore()

onMounted(async () => {
  if (!commodities.items.length) await commodities.load()
})

const selected = computed(() => commodities.selected)
const labels = computed(() => (selected.value?.history ?? []).map((p) => formatDateAxisDM(p.date)))
const data = computed(() => (selected.value?.history ?? []).map((p) => p.value))
const lastPoint = computed(() => {
  const h = selected.value?.history ?? []
  const last = h[h.length - 1]?.date
  return formatDateShortEs(last ?? null)
})
</script>

<template>
  <AppShell>
    <section class="panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">Commodities</div>
          <div class="text-xs muted">Oro, plata, litio, petróleo (mock) + contexto corto</div>
        </div>
        <div class="flex items-center gap-2">
          <SourceTag :label="commodities.source" />
          <button
            type="button"
            class="rounded-lg border border-border bg-white/5 px-3 py-2 text-xs font-semibold text-text hover:bg-white/10 transition disabled:opacity-50"
            :disabled="ui.loading.commodities"
            @click="commodities.load()"
          >
            {{ ui.loading.commodities ? 'Cargando…' : 'Actualizar' }}
          </button>
        </div>
      </div>

      <div v-if="ui.error.commodities" class="p-4">
        <div class="rounded-lg border border-orange-400/20 bg-orange-400/10 px-4 py-3 text-sm text-orange-200">
          {{ ui.error.commodities }}
        </div>
      </div>

      <div class="p-4 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs muted">Datos mock • sin tiempo real</span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs muted">Seleccionar:</span>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="c in commodities.items"
                :key="c.key"
                type="button"
                class="rounded-lg border px-3 py-2 text-xs font-semibold transition"
                :class="
                  commodities.selectedKey === c.key
                    ? 'border-border bg-white/10 text-text'
                    : 'border-transparent bg-white/5 text-muted hover:bg-white/10'
                "
                @click="commodities.setSelected(c.key)"
              >
                {{ c.name }}
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div class="panel bg-panel2 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-sm font-semibold">{{ selected?.name ?? '—' }}</div>
                <div class="mt-1 text-xs muted">
                  <span class="font-semibold text-text">{{ formatUsd(selected?.priceUsd) }}</span>
                  <span class="muted"> {{ selected?.unit ?? '' }}</span>
                  <span class="ml-2">
                    <TrendBadge :value-pct="selected?.changeDailyPct ?? null" />
                  </span>
                </div>
              </div>
              <div class="text-right text-xs muted">
                <div>Último punto: {{ lastPoint }}</div>
              </div>
            </div>

            <div class="mt-2 text-xs muted">Mini histórico (7 puntos)</div>
            <div class="mt-3">
              <LineChart
                :labels="labels"
                :datasets="[
                  {
                    label: 'USD',
                    data,
                    borderColor: 'rgba(34,197,94,0.9)',
                    backgroundColor: 'rgba(34,197,94,0.12)',
                  },
                ]"
                :height="240"
              />
            </div>
          </div>

          <div class="panel bg-panel2 p-4">
            <div class="text-sm font-semibold">Contexto</div>
            <p class="mt-2 text-sm muted">{{ selected?.context ?? '—' }}</p>
            <div class="mt-4 rounded-lg border border-border bg-black/20 p-4">
              <div class="text-xs muted">Nota</div>
              <p class="mt-1 text-sm muted">
                Estos precios son <span class="font-semibold">mocks</span> para fines educativos. La app está preparada
                para reemplazarlos por fuentes públicas en el futuro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </AppShell>
</template>

