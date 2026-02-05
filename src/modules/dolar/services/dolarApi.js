import { http } from '../../core/http'
import { safeParseNumber } from '../../ui/utils/format'

const BASE = 'https://dolarapi.com/v1'

const MAP = {
  oficial: { key: 'oficial', label: 'Dólar Oficial', source: 'dolarapi.com' },
  blue: { key: 'blue', label: 'Dólar Blue', source: 'dolarapi.com' },
  mep: { key: 'mep', label: 'Dólar MEP', source: 'dolarapi.com' },
  ccl: { key: 'ccl', label: 'Dólar CCL', source: 'dolarapi.com' },
}

function normalizeKey(item) {
  const raw = String(item?.casa ?? item?.nombre ?? '').toLowerCase()
  if (!raw) return null
  if (raw.includes('oficial')) return 'oficial'
  if (raw.includes('blue')) return 'blue'
  if (raw.includes('mep')) return 'mep'
  if (raw.includes('contado') || raw.includes('ccl')) return 'ccl'
  return null
}

export async function fetchDollarRates() {
  const { data } = await http.get(`${BASE}/dolares`)
  const out = []

  for (const item of data ?? []) {
    const key = normalizeKey(item)
    if (!key || !MAP[key]) continue
    const sell = safeParseNumber(item.venta)
    const buy = safeParseNumber(item.compra)
    if (sell == null) continue
    out.push({
      key: MAP[key].key,
      label: MAP[key].label,
      buy,
      sell,
      updatedAt: item.fechaActualizacion ?? null,
      source: MAP[key].source,
      dailyChange: null,
    })
  }

  const order = ['oficial', 'blue', 'mep', 'ccl']
  out.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
  return out
}

