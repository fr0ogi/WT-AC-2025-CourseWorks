export const formatAvg = (value) => {
  const n = typeof value === 'number' ? value : parseFloat(value)
  if (!Number.isFinite(n)) return '' // на всякий случай
  return Number.isInteger(n) ? n.toFixed(1) : String(n)
}
