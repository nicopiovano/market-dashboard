<script setup>
defineProps({
  label: { type: String, required: true },
})
</script>

<template>
  <span class="inline-flex items-center gap-1 rounded-md border border-border bg-white/5 px-2 py-1 text-xs text-muted">
    <span class="h-1.5 w-1.5 rounded-full bg-info" />
    <span>Fuente: <span class="font-mono text-xs text-text">{{ label }}</span></span>
  </span>
</template>

