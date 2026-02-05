<script setup>
import TrendBadge from './TrendBadge.vue'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: String, required: true },
  valueSub: { type: String, default: null },
  changePct: { type: Number, default: null },
  hint: { type: String, default: null },
})
</script>

<template>
  <div class="panel bg-panel2 p-4 transition hover:bg-white/5">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="text-xs muted">{{ props.title }}</div>
        <div class="mt-1 text-2xl font-semibold text-text truncate">{{ props.value }}</div>
        <div v-if="props.valueSub" class="mt-1 text-xs muted">{{ props.valueSub }}</div>
      </div>
      <TrendBadge :value-pct="props.changePct ?? null" />
    </div>
    <div v-if="props.hint" class="mt-3 text-xs muted">
      {{ props.hint }}
    </div>
  </div>
</template>

