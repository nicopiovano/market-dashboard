<script setup>
import AppShell from '../ui/layouts/AppShell.vue'
</script>

<template>
  <AppShell>
    <section class="panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">About / Metodología</div>
          <div class="text-xs muted">Fuentes • objetivo educativo • no asesoramiento</div>
        </div>
      </div>
      <div class="p-4 space-y-3 text-sm">
        <p class="muted">Esta app no brinda asesoramiento financiero. Los datos se muestran con fines informativos y educativos.</p>
        <div class="panel bg-panel2 p-4">
          <div class="text-sm font-semibold">Fuentes</div>
          <ul class="mt-2 list-disc pl-5 text-sm muted space-y-1">
            <li>Dólar: <span class="font-mono">dolarapi.com</span></li>
            <li>Cripto: CoinGecko API (free)</li>
            <li>Acciones/CEDEARs/Commodities: mocks locales</li>
          </ul>
        </div>
      </div>
    </section>
  </AppShell>
</template>

