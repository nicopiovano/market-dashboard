function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function keySeed(key) {
  return (
    String(key)
      .split('')
      .reduce((acc, c) => acc + c.charCodeAt(0) * 17, 0) + 20260205
  )
}

function daysAgoIso(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

// Histórico mock determinístico (educativo).
export function buildDollarHistory(key, baseSell, days = 30) {
  const rand = mulberry32(keySeed(key))

  const trendPerDay =
    key === 'oficial' ? 0.0012 : key === 'mep' ? 0.0015 : key === 'ccl' ? 0.0017 : 0.0022
  const noiseScale = key === 'oficial' ? 0.004 : 0.007

  const out = []
  let v = baseSell * (1 - trendPerDay * (days / 2))
  for (let i = days - 1; i >= 0; i--) {
    const noise = (rand() - 0.5) * 2 * noiseScale
    v = v * (1 + trendPerDay + noise)
    out.push({ date: daysAgoIso(i), value: Number(v.toFixed(2)) })
  }
  return out
}

