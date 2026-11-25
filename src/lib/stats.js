import { lastDayOfMonthKey, parseNumber, prevMonthKey, shiftDays, todayISO } from './utils'

export { lastDayOfMonthKey, prevMonthKey }

export function isInRange(dateStr, period) {
  if (!period) return true
  if (period.start && String(dateStr) < String(period.start)) return false
  if (period.end && String(dateStr) > String(period.end)) return false
  return true
}

export function sumTransactions(data, matcher) {
  let total = 0
  for (const t of data.transactions) if (matcher(t)) total += t.amount
  return total
}

export function totalIncome(data, period) {
  return sumTransactions(data, (t) => t.kind === 'income' && isInRange(t.date, period))
}

export function totalExpense(data, period) {
  return sumTransactions(data, (t) => t.kind === 'expense' && isInRange(t.date, period))
}

export function netSavings(data, period) {
  return totalIncome(data, period) - totalExpense(data, period)
}

export function categoryBreakdown(data, period) {
  const map = new Map()
  for (const t of data.transactions) {
    if (t.kind !== 'expense' || !isInRange(t.date, period)) continue
    map.set(t.category, (map.get(t.category) || 0) + t.amount)
  }
  return [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

export function monthTotals(data, monthKey) {
  const start = `${monthKey}-01`
  const end = lastDayOfMonthKey(monthKey)
  return {
    income: totalIncome(data, { start, end }),
    expense: totalExpense(data, { start, end }),
    net: netSavings(data, { start, end }),
  }
}

export function currentMonthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function currentMonthKeys(count = 12) {
  let key = currentMonthKey()
  const keys = []
  for (let i = 0; i < count; i += 1) {
    keys.push(key)
    key = prevMonthKey(key)
  }
  return keys
}

export function monthSeries(data, count = 12) {
  return currentMonthKeys(count).map((k) => ({ month: k, ...monthTotals(data, k) }))
}

export function getTodayTotals(data) {
  const day = todayISO()
  const period = { start: day, end: day }
  return {
    expense: totalExpense(data, period),
    income: totalIncome(data, period),
    net: netSavings(data, period),
  }
}

export function avgDailyExpense(data, days = 30) {
  const end = todayISO()
  const start = shiftDays(end, -(days - 1))
  const expense = totalExpense(data, { start, end })
  return { expense, days, avg: days > 0 ? expense / days : 0 }
}

export function getBudgetInfo(data, monthKey = currentMonthKey()) {
  const start = `${monthKey}-01`
  const end = lastDayOfMonthKey(monthKey)
  const info = data.budgets
    .filter((b) => b.month === monthKey)
    .map((b) => {
      const spent = sumTransactions(
        data,
        (t) => t.kind === 'expense' && isInRange(t.date, { start, end }) && t.category === b.category,
      )
      const limit = Math.max(0, parseNumber(b.limit, 0))
      return {
        id: b.id,
        category: b.category,
        limit,
        spent,
        remaining: limit - spent,
        percent: limit > 0 ? spent / limit : 0,
        over: limit > 0 && spent > limit + 1e-9,
      }
    })
    .sort((a, b) => b.spent - a.spent || a.category.localeCompare(b.category))
  const totalLimit = info.reduce((s, b) => s + b.limit, 0)
  const totalSpent = info.reduce((s, b) => s + b.spent, 0)
  return {
    month: monthKey,
    budgets: info,
    totalLimit,
    totalSpent,
    overallPercent: totalLimit > 0 ? Math.min(1, totalSpent / totalLimit) : 0,
  }
}

export function goalProgress(goal) {
  const target = Math.max(0, parseNumber(goal.target, 0))
  const saved = Math.max(0, parseNumber(goal.saved, 0))
  const percent = target > 0 ? Math.min(1, saved / target) : 1
  let daysLeft = null
  const deadline = goal.deadline ? new Date(String(goal.deadline).slice(0, 10) + 'T00:00:00') : null
  if (deadline) {
    const ms = deadline.getTime() - Date.now()
    daysLeft = Math.ceil(ms / 86400000)
  }
  return { target, saved, percent, daysLeft }
}

export function totalGoalProgress(goals) {
  const totalTarget = goals.reduce((s, g) => s + Math.max(0, parseNumber(g?.target, 0)), 0)
  const totalSaved = goals.reduce((s, g) => s + Math.max(0, parseNumber(g?.saved, 0)), 0)
  return {
    totalTarget,
    totalSaved,
    percent: totalTarget > 0 ? Math.min(1, totalSaved / totalTarget) : 0,
  }
}
