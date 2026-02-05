import axios from 'axios'

// Cliente HTTP común (sin auth, sin tiempo real).
export const http = axios.create({
  timeout: 12_000,
  headers: { Accept: 'application/json' },
})

