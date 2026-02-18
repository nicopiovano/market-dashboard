<template>
  <div class="min-h-screen pb-20">
    <RouterView />

    <!-- Firma / stack -->
    <div class="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-4">
      <div
        class="pointer-events-auto max-w-xl rounded-2xl border border-black/10 bg-white/75 px-3 py-2 text-xs text-zinc-800 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-100"
      >
        <span class="font-medium">Desarrollado con</span>
        <span class="mx-2 text-zinc-600 dark:text-zinc-300">
          Vue · Tailwind · Pinia · Chart.js · AI
        </span>
        <a
          href="https://nico-piovano-porfolio.vercel.app/es"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-2 hover:opacity-80"
        >
          <span class="font-medium">by Nico Piovano</span>
        </a>
      </div>
    </div>
  </div>
</template>
