import { useMemo, useState } from 'react'
import TransactionTable from '../components/TransactionTable'
import StatCard from '../components/StatCard'
import { totalIncome, totalExpense, netSavings } from '../lib/stats'
import { formatMoney } from '../lib/utils'

function matches(t, { kind, category, from, to, search }) {
  if (kind !== 'all' && t.kind !== kind) return false
  if (category && t.category !== category) return false
  if (from && t.date < from) return false
  if (to && t.date > to) return false
  const q = (search || '').trim().toLowerCase()
  if (q) {
    const hay = `${t.category} ${t.description || ''}`.toLowerCase()
    if (!hay.includes(q)) return false
  }
  return true
}

export default function History({ data, onDataChange }) {
  const [kind, setKind] = useState('all')
  const [category, setCategory] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () => data.transactions.filter((t) => matches(t, { kind, category, from, to, search })),
    [data.transactions, kind, category, from, to, search],
  )
  const period = { start: from, end: to }
  const totals = useMemo(
    () => ({
      income: totalIncome(data, period),
      expense: totalExpense(data, period),
      net: netSavings(data, period),
      count: filtered.length,
    }),
    [data, period, filtered.length],
  )
  const categories = useMemo(() => {
    const set = new Set()
    for (const t of data.transactions) if (t.category) set.add(t.category)
    return [...set].sort()
  }, [data.transactions])

  const clearFilters = () => {
    setKind('all')
    setCategory('')
    setFrom('')
    setTo('')
    setSearch('')
  }

  return (
    <main className="history">
      <h1>🕒 History</h1>
      <div className="filters history-filters">
        <label>
          <span>Type</span>
          <div className="seg-group" role="group" aria-label="Filter by type">
            <button type="button" className={kind === 'all' ? 'primary' : 'secondary'} onClick={() => setKind('all')}>
              All
            </button>
            <button type="button" className={kind === 'expense' ? 'primary' : 'secondary'} onClick={() => setKind('expense')}>
              Expense
            </button>
            <button type="button" className={kind === 'income' ? 'primary' : 'secondary'} onClick={() => setKind('income')}>
              Income
            </button>
          </div>
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          <span>From</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          <span>To</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <label>
          <span>Search</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category or description"
          />
        </label>
        <div>
          <button type="button" className="secondary" onClick={clearFilters}>Clear filters</button>
        </div>
      </div>
      <div className="stats-row history-summary">
        <StatCard label="Entries" value={String(totals.count)} />
        <StatCard label="Income" value={formatMoney(totals.income, data.settings)} color="var(--success)" />
        <StatCard label="Expenses" value={formatMoney(totals.expense, data.settings)} color="var(--danger)" />
        <StatCard
          label="Net"
          value={formatMoney(totals.net, data.settings)}
          color={totals.net >= 0 ? 'var(--success)' : 'var(--danger)'}
        />
      </div>
      <TransactionTable data={data} transactions={filtered} onDataChange={onDataChange} />
    </main>
  )
}
