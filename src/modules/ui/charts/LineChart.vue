<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  labels: { type: Array, required: true },
  datasets: { type: Array, required: true },
  height: { type: Number, default: 220 },
})

const canvasRef = ref(null)
let chart = null

function render() {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  if (chart) chart.destroy()
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: props.datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false },
      },
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          ticks: { color: 'rgba(255,255,255,0.55)' },
          grid: { color: 'rgba(255,255,255,0.06)' },
        },
        y: {
          ticks: { color: 'rgba(255,255,255,0.55)' },
          grid: { color: 'rgba(255,255,255,0.06)' },
        },
      },
      elements: {
        line: { tension: 0.35, borderWidth: 2 },
        point: { radius: 0, hitRadius: 10 },
      },
    },
  })
}

onMounted(render)
watch(() => [props.labels, props.datasets], render, { deep: true })
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="w-full" :style="{ height: `${props.height}px` }">
    <canvas ref="canvasRef" />
  </div>
</template>

