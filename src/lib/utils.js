export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function formatMoney(amount = 0, settings = {}) {
  const code = settings.code || 'USD'
  const decimals = typeof settings.decimals === 'number' ? settings.decimals : 2
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  } catch {
    return `${settings.symbol || code}${Number(amount).toFixed(decimals)}`
  }
}

export function parseDateStr(str) {
  if (!str) return null
  const [y, m, d] = String(str).split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function monthKeyOf(dateStr) {
  return String(dateStr || '').slice(0, 7) || null
}

export function currentMonthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function prevMonthKey(key) {
  const [y, mo] = key.split('-').map(Number)
  const ny = mo === 1 ? y - 1 : y
  const nm = mo === 1 ? 12 : mo - 1
  return `${ny}-${String(nm).padStart(2, '0')}`
}

export function monthStartKey(key) {
  return `${key}-01`
}

export function lastDayOfMonthKey(key) {
  const [y, mo] = key.split('-').map(Number)
  const days = new Date(y, mo, 0).getDate()
  return `${key}-${String(days).padStart(2, '0')}`
}

export function formatMonthLabel(key) {
  if (!key) return '—'
  const [y, m] = key.split('-').map(Number)
  return `${MONTHS[m - 1] || m} ${y}`
}

export function formatDateLabel(dateStr, settings = {}) {
  if (!dateStr) return '—'
  const [y, m, d] = String(dateStr).split('-').map(Number)
  const fmt = settings.dateFormat || 'yyyy-mm-dd'
  const M = String(m).padStart(2, '0')
  const DD = String(d).padStart(2, '0')
  if (fmt === 'dd/mm/yyyy') return `${String(d).padStart(2, '0')}/${M}/${y}`
  if (fmt === 'mm/dd/yyyy') return `${M}/${String(d).padStart(2, '0')}/${y}`
  if (fmt === 'mmm d, yyyy') return `${MONTHS[m - 1]} ${d}, ${y}`
  return `${y}-${M}-${DD}`
}

export function shiftDays(dateStr, days) {
  const [y, m, d] = String(dateStr || '').split('-').map(Number)
  if (!y || !m || !d) return dateStr
  const t = new Date(y, m - 1, d + days)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

export function parseNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function isPositiveAmount(text) {
  return typeof text === 'string' && text.trim() !== '' && Number.isFinite(Number(text.trim())) && Number(text.trim()) > 0
}

export function timeGreeting() {
  const hour = new Date().getHours()
  if (hour >= 0 && hour < 6) return 'Good night'
  if (hour >= 6 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 23) return 'Good evening'
  return 'Good night'
}
