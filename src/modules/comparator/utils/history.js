function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFromKey(key) {
  return (
    String(key)
      .split('')
      .reduce((acc, c) => acc + c.charCodeAt(0) * 19, 0) + 20260205
  )
}

function daysAgoIso(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

/**
 * Genera una serie determinística (educativa) a partir de un valor base.
 * Útil cuando no hay histórico real disponible (mocks).
 */
export function buildDeterministicHistory(key, baseValue, days, { trendPerDay = 0.0012, noiseScale = 0.006 } = {}) {
  const rand = mulberry32(seedFromKey(key))
  const out = []
  let v = baseValue * (1 - trendPerDay * (days / 2))
  for (let i = days - 1; i >= 0; i--) {
    const noise = (rand() - 0.5) * 2 * noiseScale
    v = v * (1 + trendPerDay + noise)
    out.push({ date: daysAgoIso(i), value: Number(v.toFixed(2)) })
  }
  return out
}

export function sliceLastDays(series, days) {
  if (!Array.isArray(series) || !series.length) return []
  return series.slice(Math.max(0, series.length - days))
}

export function pctReturn(series) {
  if (!Array.isArray(series) || series.length < 2) return null
  const first = series[0]?.value
  const last = series[series.length - 1]?.value
  if (typeof first !== 'number' || typeof last !== 'number' || first === 0) return null
  return ((last - first) / first) * 100
}

