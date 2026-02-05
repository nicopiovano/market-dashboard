import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // Módulos (feature-first)
  { path: '/', name: 'dashboard', component: () => import('../modules/dashboard/DashboardView.vue') },
  { path: '/dolar', name: 'dolar', component: () => import('../modules/dolar/DolarView.vue') },
  { path: '/cedears', name: 'cedears', component: () => import('../modules/cedears/CedearsView.vue') },
  { path: '/cripto', name: 'cripto', component: () => import('../modules/crypto/CryptoView.vue') },
  { path: '/commodities', name: 'commodities', component: () => import('../modules/commodities/CommoditiesView.vue') },
  { path: '/comparador', name: 'comparador', component: () => import('../modules/comparator/ComparatorView.vue') },
  { path: '/about', name: 'about', component: () => import('../modules/about/AboutView.vue') },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

