import { useMemo, useState } from 'react'
import StatCard from '../components/StatCard'
import CategoryPie from '../components/CategoryPie'
import { BarChart, LineChart } from '../components/Charts'
import { formatMoney, formatMonthLabel, monthKeyOf } from '../lib/utils'
import { monthSeries, monthTotals, prevMonthKey, lastDayOfMonthKey, categoryBreakdown, getBudgetInfo, currentMonthKey } from '../lib/stats'
import { transactionsCSV, budgetsCSV, downloadCSV, downloadJSON } from '../lib/export'

export default function Reports({ data, onDataChange }) {
  const settings = data.settings
  const [monthKey, setMonthKey] = useState(currentMonthKey())
  const [mode, setMode] = useState('month')

  const monthTotal = useMemo(() => monthTotals(data, monthKey), [data, monthKey])
  const breakdown = useMemo(
    () => categoryBreakdown(data, { start: `${monthKey}-01`, end: lastDayOfMonthKey(monthKey) }),
    [data, monthKey],
  )
  const prevKey = useMemo(() => prevMonthKey(monthKey), [monthKey])
  const prevTotal = useMemo(() => monthTotals(data, prevKey), [data, prevKey])
  const budgetInfo = useMemo(() => getBudgetInfo(data, monthKey), [data, monthKey])
  const series = useMemo(() => monthSeries(data, 12), [data])

  const income = monthTotal.income
  const expense = monthTotal.expense
  const net = monthTotal.net
  const savingsRate = income > 0 ? expense / income : 0
  const prevExpense = prevTotal.expense
  const expenseDelta = expense - prevExpense
  const monthExpenseTotal = breakdown.reduce((s, b) => s + b.total, 0)
  const transactionsThisMonth = data.transactions.filter((t) => t.date >= monthKey).length
  const yearExpense = useMemo(() => series.reduce((s, m) => s + m.expense, 0), [series])

  const trendBars = useMemo(
    () => series.map((s) => ({ label: monthKeyOf(s.month)?.slice(5) || String(s.month).slice(5), value: s.expense })),
    [series],
  )

  function exportTransactions() {
    downloadCSV('finora-transactions.csv', transactionsCSV(data.transactions))
  }
  function exportBudgets() {
    downloadCSV('finora-budgets.csv', budgetsCSV(budgetInfo))
  }
  function exportAll() {
    downloadJSON('finora-backup.json', data)
  }

  return (
    <main className="reports">
      <div className="reports-header">
        <h1>📈 Reports</h1>
        <label>
          <span>Month</span>
          <input type="month" value={monthKey} onChange={(e) => setMonthKey(e.target.value)} />
        </label>
        <div className="seg-group" role="group" aria-label="View">
          <button type="button" className={mode === 'month' ? 'primary' : 'secondary'} onClick={() => setMode('month')}>
            Month report
          </button>
          <button type="button" className={mode === 'trend' ? 'primary' : 'secondary'} onClick={() => setMode('trend')}>
            Trend
          </button>
        </div>
      </div>

      <div className="stats-row">
        <StatCard label="Income" value={formatMoney(income, settings)} color="var(--success)" />
        <StatCard label="Expenses" value={formatMoney(expense, settings)} color="var(--danger)" />
        <StatCard
          label="Net savings"
          value={formatMoney(net, settings)}
          color={net >= 0 ? 'var(--success)' : 'var(--danger)'}
        />
        <StatCard label="Savings rate" value={`${Math.round(savingsRate * 100)}%`} />
        <StatCard label="Transactions" value={String(transactionsThisMonth)} />
      </div>

      <div className="grid-2">
        <CategoryPie
          breakdown={breakdown}
          settings={settings}
          title={`Expenses by category — ${formatMonthLabel(monthKey)}`}
          totalFormatted={formatMoney(monthExpenseTotal, settings)}
        />
        <div className="card">
          <h2>📊 Monthly expenses</h2>
          <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
            Previous month: {formatMoney(prevExpense, settings)}
            {' '}
            {expenseDelta >= 0 ? (
              <span className="green">+{formatMoney(expenseDelta, settings)}</span>
            ) : (
              <span className="red">-{formatMoney(-expenseDelta, settings)}</span>
            )}
            {' vs previous month'}
          </div>
          <BarChart bars={trendBars} valueFormatter={(v) => formatMoney(v, settings)} height={130} />
        </div>
      </div>

      {budgetInfo.budgets.length > 0 && (
        <div className="card">
          <h2>Budget progress — {formatMonthLabel(monthKey)}</h2>
          {budgetInfo.budgets.map((b) => (
            <div key={b.id} className="progress-row">
              <div className="progress-row-head">
                <span className="progress-row-label">{b.category}</span>
                <span className="progress-row-value">
                  {formatMoney(b.spent, settings)} / {formatMoney(b.limit, settings)}
                </span>
              </div>
              <div className="progress">
                <span
                  style={{
                    width: `${Math.min(100, Math.round(b.percent * 100))}%`,
                    background: b.over ? 'var(--danger)' : 'var(--primary)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {mode === 'trend' && (
        <div className="card">
          <h2>📈 Expense trend — last 12 months</h2>
          <LineChart points={series.map((s) => ({ x: s.month, y: s.expense }))} width={480} height={140} />
          <div className="stats-row">
            <StatCard label="Total expenses (12mo)" value={formatMoney(yearExpense, settings)} color="var(--danger)" />
            <StatCard label="Avg monthly expense" value={formatMoney(yearExpense / Math.max(1, series.length), settings)} />
            <StatCard
              label="Avg monthly savings"
              value={formatMoney(series.reduce((s, m) => s + m.net, 0) / Math.max(1, series.length), settings)}
              color="var(--success)"
            />
          </div>
        </div>
      )}

      <div className="actions-row">
        <button type="button" onClick={exportTransactions}>Export transactions (CSV)</button>
        <button type="button" onClick={exportBudgets}>Export budgets (CSV)</button>
        <button type="button" onClick={exportAll}>Export data (JSON)</button>
      </div>
    </main>
  )
}
