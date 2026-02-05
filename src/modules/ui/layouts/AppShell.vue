<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/dolar', label: 'Dólar' },
  { to: '/cedears', label: 'CEDEARs' },
  { to: '/cripto', label: 'Cripto' },
  { to: '/commodities', label: 'Commodities' },
  { to: '/comparador', label: 'Comparador' },
  { to: '/about', label: 'About' },
]

const activePath = computed(() => route.path)
</script>

<template>
  <div class="min-h-screen bg-bg">
    <div class="mx-auto max-w-7xl px-4 py-6">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <aside class="panel h-fit">
          <div class="panel-header">
            <div class="flex items-center gap-2">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-panel2 border border-border">
                <span class="text-xs font-bold text-accent">+</span>
              </span>
              <div class="leading-tight">
                <div class="panel-title">Market Dashboard</div>
                <div class="text-xs muted">Argentina • educativo</div>
              </div>
            </div>
          </div>

          <nav class="px-2 py-2">
            <RouterLink
              v-for="item in nav"
              :key="item.to"
              :to="item.to"
              class="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-white/5"
              :class="activePath === item.to ? 'bg-white/5 border border-border' : 'border border-transparent'"
            >
              <span class="font-medium">{{ item.label }}</span>
              <span class="text-xs muted">→</span>
            </RouterLink>
          </nav>

          <div class="px-4 pb-4 pt-2 text-xs muted">Sin tiempo real. Fuentes públicas + mocks.</div>
        </aside>

        <main class="space-y-6">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

