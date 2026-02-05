export function formatArs(value) {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(
    value,
  )
}

export function formatUsd(value) {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(
    value,
  )
}

export function formatCompact(value) {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 2 }).format(value)
}

export function formatPct(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${Number(value).toFixed(digits)}%`
}

export function safeParseNumber(v) {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN
  if (Number.isNaN(n)) return null
  return n
}


function parseIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso))
  if (!match) return null
  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])
  if (!y || !m || !d) return null
  return { y, m, d }
}

const ES_MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// Para ejes de gráficos: dd/MM (ej. "05/02")
export function formatDateAxisDM(isoDate) {
  if (!isoDate) return '—'
  const p = parseIsoDate(isoDate)
  if (!p) return '—'
  const dd = String(p.d).padStart(2, '0')
  const mm = String(p.m).padStart(2, '0')
  return `${dd}/${mm}`
}

// Para textos compactos: dd-mmm (ej. "05-feb")
export function formatDateShortEs(isoDate) {
  if (!isoDate) return '—'
  const p = parseIsoDate(isoDate)
  if (!p) return '—'
  const dd = String(p.d).padStart(2, '0')
  const mon = ES_MONTHS[p.m - 1] ?? '—'
  return `${dd}-${mon}`
}

