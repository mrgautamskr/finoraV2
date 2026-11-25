import { useMemo, useState } from 'react'
import { nextId } from '../lib/data'
import { formatMoney, formatMonthLabel, parseNumber } from '../lib/utils'
import { currentMonthKey, getBudgetInfo } from '../lib/stats'
import { DEFAULT_CATEGORIES } from '../lib/constants'

export default function Budgets({ data, onDataChange }) {
  const settings = data.settings
  const monthKey = currentMonthKey()
  const info = useMemo(() => getBudgetInfo(data, monthKey), [data, monthKey])
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState('')
  const [note, setNote] = useState(null)

  const categories = useMemo(() => {
    const set = new Set(settings.categories || DEFAULT_CATEGORIES)
    for (const b of data.budgets) if (b?.category) set.add(b.category)
    return [...set]
  }, [settings.categories, data.budgets])

  function addBudget(e) {
    e.preventDefault()
    const cat = category.trim()
    if (!cat) {
      setNote({ text: 'Pick or type a category.', isError: true })
      return
    }
    const amt = parseNumber(limit, NaN)
    if (!Number.isFinite(amt) || amt < 0) {
      setNote({ text: 'Enter a valid limit (a number).', isError: true })
      return
    }
    onDataChange((prev) => ({
      ...prev,
      budgets: [...(prev.budgets || []), { id: nextId('budget'), category: cat, limit: amt, month: monthKey }],
    }))
    setCategory('')
    setLimit('')
    setNote({ text: `Budget for "${cat}" set to ${formatMoney(amt, settings)}.`, isError: false })
  }

  function removeBudget(id) {
    if (!window.confirm('Remove this budget?')) return
    onDataChange((prev) => ({ ...prev, budgets: (prev.budgets || []).filter((b) => b.id !== id) }))
  }

  return (
    <main className="budgets">
      <h1>💰 Budgets — {formatMonthLabel(monthKey)}</h1>

      <div className="card">
        <h2>🛠️ Set a budget</h2>
        <form className="form-grid" onSubmit={addBudget}>
          <label>
            <span>Category</span>
            <input
              type="text"
              list="finora-categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Food & Dining"
            />
            <datalist id="finora-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label>
            <span>Monthly limit</span>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="e.g. 300"
            />
          </label>
          <div className="span-2">
            <button type="submit">Add budget</button>
            {note && <span className={`note ${note.isError ? 'err' : ''}`} role="status">{note.text}</span>}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>📅 This month — {formatMonthLabel(monthKey)}</h2>
        <div className="budget-summary">
          <div>
            <span className="label">Total spent</span>
            <span className="value amt-expense">{formatMoney(info.totalSpent, settings)}</span>
          </div>
          <div>
            <span className="label">Total limit</span>
            <span className="value">{formatMoney(info.totalLimit, settings)}</span>
          </div>
          <div>
            <span className="label">Overall progress</span>
            <span className="value">{Math.round(info.overallPercent * 100)}%</span>
          </div>
        </div>
        <div className="progress">
          <span
            style={{
              width: `${Math.min(100, Math.round(info.overallPercent * 100))}%`,
              background: info.totalSpent > info.totalLimit ? 'var(--danger)' : 'var(--primary)',
            }}
          />
        </div>
      </div>

      {info.budgets.length > 0 ? (
        <div className="card">
          <h2>📋 Category budgets</h2>
          <table className="budgets-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Limit</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {info.budgets.map((b) => {
                const pct = Math.min(100, Math.round(b.percent * 100))
                return (
                  <tr key={b.id}>
                    <td>{b.category}</td>
                    <td>{formatMoney(b.limit, settings)}</td>
                    <td>{formatMoney(b.spent, settings)}</td>
                    <td className={`amt amt-${b.over ? 'expense' : 'income'}`}>{formatMoney(b.remaining, settings)}</td>
                    <td>
                      <span className={`progress progress-sm ${b.over ? 'over' : ''}`}>
                        <span style={{ width: `${pct}%`, background: b.over ? 'var(--danger)' : 'var(--primary)' }} />
                      </span>
                    </td>
                    <td className="actions">
                      {b.over && <span className="badge badge-over">Over</span>}
                      <button type="button" className="secondary danger" onClick={() => removeBudget(b.id)}>Remove</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card"><p className="empty-text">No budgets set for this month yet.</p></div>
      )}
    </main>
  )
}
