import { useMemo, useState } from 'react'
import { nextId } from '../lib/data'
import { formatMoney, parseNumber } from '../lib/utils'
import { goalProgress } from '../lib/stats'
import { DEFAULT_CATEGORIES } from '../lib/constants'

export default function Goals({ data, onDataChange }) {
  const settings = data.settings
  const goals = useMemo(() => data.goals || [], [data.goals])
  const [form, setForm] = useState({ name: '', target: '', category: 'Salary', deadline: '' })
  const [note, setNote] = useState(null)
  const [saveInputs, setSaveInputs] = useState({})

  const overall = useMemo(() => {
    const totalTarget = goals.reduce((s, g) => s + Math.max(0, parseNumber(g?.target, 0)), 0)
    const totalSaved = goals.reduce((s, g) => s + Math.max(0, parseNumber(g?.saved, 0)), 0)
    return {
      totalTarget,
      totalSaved,
      percent: totalTarget > 0 ? Math.min(1, totalSaved / totalTarget) : 0,
    }
  }, [goals])

  function addGoal(e) {
    e.preventDefault()
    const name = (form.name || '').trim()
    const target = parseNumber(form.target, NaN)
    if (!name) {
      setNote({ text: 'Enter a goal name.', isError: true })
      return
    }
    if (!Number.isFinite(target) || target <= 0) {
      setNote({ text: 'Enter a valid target amount.', isError: true })
      return
    }
    const cat = (form.category || '').trim()
    onDataChange((prev) => ({
      ...prev,
      goals: [
        ...(prev.goals || []),
        {
          id: nextId('goal'),
          name,
          target,
          saved: 0,
          category: cat,
          deadline: form.deadline || null,
          createdAt: Date.now(),
        },
      ],
    }))
    setForm({ name: '', target: '', category: 'Salary', deadline: '' })
    setNote({ text: `Goal "${name}" created.`, isError: false })
  }

  function addPayment(goalId) {
    const goal = goals.find((g) => g.id === goalId)
    const amt = parseNumber(saveInputs[goalId], NaN)
    if (!goal || !Number.isFinite(amt) || amt <= 0) return
    onDataChange((prev) => ({
      ...prev,
      goals: (prev.goals || []).map((g) =>
        g.id === goalId ? { ...g, saved: Math.min(g.target, g.saved + amt), updatedAt: Date.now() } : g,
      ),
    }))
    setSaveInputs((prev) => ({ ...prev, [goalId]: '' }))
  }

  return (
    <main className="goals">
      <h1>🎯 Goals</h1>
      <div className="card">
        <h2>Overall savings</h2>
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-label">Saved</span>
            <span className="stat-value">{formatMoney(overall.totalSaved, settings)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Target</span>
            <span className="stat-value">{formatMoney(overall.totalTarget, settings)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Overall progress</span>
            <span className="stat-value">{Math.round(overall.percent * 100)}%</span>
          </div>
        </div>
        <div className="progress">
          <span style={{ width: `${Math.round(overall.percent * 100)}%`, background: 'var(--success)' }} />
        </div>
      </div>

      <div className="card">
        <h2>➕ Add a goal</h2>
        <form className="form-grid" onSubmit={addGoal}>
          <label>
            <span>Name</span>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. New laptop" />
          </label>
          <label>
            <span>Target amount</span>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
            />
          </label>
          <label>
            <span>Category</span>
            <input
              type="text"
              list="finora-categories"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Salary"
            />
            <datalist id="finora-categories">
              {(settings.categories || DEFAULT_CATEGORIES).map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label>
            <span>Deadline (optional)</span>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </label>
          <div className="span-2">
            <button type="submit">Add Goal</button>
            {note && <span className={`note ${note.isError ? 'err' : ''}`} role="status">{note.text}</span>}
          </div>
        </form>
      </div>

      {goals.length === 0 ? (
        <div className="card"><p className="empty-text">No goals yet. Add one above to start saving toward a target.</p></div>
      ) : (
        <div className="goals-list">
          {goals.map((g) => {
            const gp = goalProgress(g)
            return (
              <div key={g.id} className="goal-card">
                <div className="goal-head">
                  <h3>{g.name}</h3>
                  <span className={`progress-value ${gp.percent >= 1 ? 'done' : ''}`}>{Math.round(gp.percent * 100)}%</span>
                </div>
                <div className="progress">
                  <span style={{ width: `${Math.min(100, Math.round(gp.percent * 100))}%`, background: 'var(--primary)' }} />
                </div>
                <div className="goal-meta">
                  <span>
                    Saved {formatMoney(gp.saved, settings)} / {formatMoney(gp.target, settings)}
                  </span>
                  {g.deadline && <span>Due {String(g.deadline).slice(0, 10)}{gp.daysLeft !== null && ` (${gp.daysLeft} days left)`}</span>}
                  {g.category && <span className="badge">{g.category}</span>}
                </div>
                <div className="goal-add">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    inputMode="decimal"
                    placeholder="Add saving"
                    value={saveInputs[g.id] || ''}
                    onChange={(e) => setSaveInputs((prev) => ({ ...prev, [g.id]: e.target.value }))}
                  />
                  <button type="button" className="secondary" onClick={() => addPayment(g.id)}>
                    Log saving
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
