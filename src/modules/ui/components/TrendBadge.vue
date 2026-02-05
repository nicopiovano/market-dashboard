<script setup>
import { computed } from 'vue'
import { formatPct } from '../utils/format'

const props = defineProps({
  valuePct: { type: Number, default: null },
})

const tone = computed(() => {
  if (props.valuePct == null) return 'neutral'
  return props.valuePct >= 0 ? 'up' : 'down'
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold"
    :class="
      tone === 'up'
        ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
        : tone === 'down'
          ? 'border-orange-400/20 bg-orange-400/10 text-orange-300'
          : 'border-border bg-white/5 text-muted'
    "
  >
    <span v-if="tone === 'up'">▲</span>
    <span v-else-if="tone === 'down'">▼</span>
    <span v-else>•</span>
    <span>{{ formatPct(valuePct) }}</span>
  </span>
</template>

