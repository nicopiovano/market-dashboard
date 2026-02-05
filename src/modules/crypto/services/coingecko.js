import { http } from '../../core/http'
import { safeParseNumber } from '../../ui/utils/format'

const BASE = 'https://api.coingecko.com/api/v3'

export async function fetchTopCryptoByMarketCap(perPage = 10) {
  const { data } = await http.get(`${BASE}/coins/markets`, {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: perPage,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h',
    },
  })

  return (data ?? []).map((c) => ({
    id: c.id,
    symbol: String(c.symbol ?? '').toUpperCase(),
    name: c.name,
    image: c.image,
    priceUsd: safeParseNumber(c.current_price) ?? 0,
    change24hPct: safeParseNumber(c.price_change_percentage_24h),
    marketCapUsd: safeParseNumber(c.market_cap),
    updatedAt: c.last_updated ?? null,
  }))
}

export async function fetchCryptoHistory7d(coinId) {
  const { data } = await http.get(`${BASE}/coins/${coinId}/market_chart`, {
    params: { vs_currency: 'usd', days: 7, interval: 'hourly' },
  })

  const points = (data?.prices ?? []).map(([ts, price]) => ({
    date: new Date(ts).toISOString().slice(0, 10),
    value: price,
  }))

  // 1 punto por día (último del día)
  const byDay = new Map()
  for (const p of points) byDay.set(p.date, p)
  return Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date))
}


export async function fetchCryptoHistory(coinId, days) {
  const { data } = await http.get(`${BASE}/coins/${coinId}/market_chart`, {
    params: { vs_currency: 'usd', days, interval: 'daily' },
  })

  const points = (data?.prices ?? []).map(([ts, price]) => ({
    date: new Date(ts).toISOString().slice(0, 10),
    value: price,
  }))

  const byDay = new Map()
  for (const p of points) byDay.set(p.date, p)
  return Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date))
}
