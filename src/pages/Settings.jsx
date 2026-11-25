import { useState } from 'react'
import { CURRENCIES, DATE_FORMATS, THEMES, DEFAULT_CATEGORIES } from '../lib/constants'
import { formatMoney, parseNumber } from '../lib/utils'
import { createEmptyData, saveData, validateImportedData } from '../lib/data'
import { transactionsCSV, budgetsCSV, downloadCSV, downloadJSON } from '../lib/export'
import { getBudgetInfo, currentMonthKey } from '../lib/stats'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function Settings({ data, onDataChange, onNavigate }) {
  const settings = data.settings
  const profile = data.profile || {}
  const [note, setNote] = useState(null)
  const [importNote, setImportNote] = useState(null)
  const [newCategory, setNewCategory] = useState('')

  const categories = settings.categories || DEFAULT_CATEGORIES
  const currency = CURRENCIES.find((c) => c.code === (settings.code || 'USD')) || CURRENCIES[0]

  function setSetting(patch) {
    onDataChange((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }))
  }

  function setProfile(patch) {
    onDataChange((prev) => ({ ...prev, profile: { ...(prev.profile || {}), ...patch } }))
  }

  function logout() {
    supabase?.auth.signOut().catch(() => {})
    if (onNavigate) onNavigate('auth')
  }

  function addCategory(e) {
    e.preventDefault()
    const cat = newCategory.trim()
    if (!cat || categories.includes(cat)) {
      setNewCategory('')
      return
    }
    setSetting({ categories: [...categories, cat] })
    setNewCategory('')
    setNote({ text: `Category "${cat}" added.`, isError: false })
  }

  function removeCategory(cat) {
    setSetting({ categories: categories.filter((c) => c !== cat) })
  }

  function exportTransactions() {
    downloadCSV('finora-transactions.csv', transactionsCSV(data.transactions))
    setNote({ text: 'Transactions CSV downloaded.', isError: false })
  }

  function exportBudgets() {
    downloadCSV('finora-budgets.csv', budgetsCSV(getBudgetInfo(data, currentMonthKey())))
    setNote({ text: 'Budgets CSV downloaded.', isError: false })
  }

  function exportAll() {
    downloadJSON('finora-backup.json', data)
    setNote({ text: 'Full data backup downloaded (JSON).', isError: false })
  }

  function importData(e) {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    file
      .text()
      .then((text) => {
        let parsed
        try {
          parsed = JSON.parse(text)
        } catch {
          setImportNote({ text: 'That file is not valid JSON. Choose a Finora JSON backup file.', isError: true })
          return
        }
        const next = validateImportedData(parsed)
        if (!next) {
          setImportNote({ text: 'File does not contain valid Finora data. Nothing was changed.', isError: true })
          return
        }
        if (!window.confirm('Replace current data with the imported data? This cannot be undone.')) {
          setImportNote({ text: 'Import cancelled.', isError: true })
          return
        }
        onDataChange(() => next)
        setImportNote({ text: 'Data imported and saved.', isError: false })
      })
      .catch(() => setImportNote({ text: 'Could not read the selected file.', isError: true }))
  }

  function deleteAll() {
    if (!window.confirm('Delete ALL data (transactions, budgets, goals)? This cannot be undone.')) return
    onDataChange(createEmptyData())
    setNote({ text: 'All data deleted.', isError: false })
  }

  return (
    <main className="settings">
      <h1>⚙️ Settings</h1>

      <div className="card">
        <h2>Profile</h2>
        <div className="form-grid">
          <label>
            <span>Name</span>
            <input type="text" value={profile.name || ''} onChange={(e) => setProfile({ name: e.target.value })} placeholder="e.g. Dali" />
          </label>
          <label>
            <span>Profession</span>
            <input type="text" value={profile.profession || ''} onChange={(e) => setProfile({ profession: e.target.value })} placeholder="e.g. Freelancer designer" />
          </label>
        </div>
        {profile.name && (
          <p className="muted" style={{ marginTop: 8 }}>
            The Dashboard greets you by name, like "Good morning, Dali".
          </p>
        )}
      </div>

      <div className="card">
        <h2>Currency</h2>
        <div className="form-grid">
          <label>
            <span>Currency</span>
            <select
              value={settings.code || 'USD'}
              onChange={(e) => {
                const c = CURRENCIES.find((x) => x.code === e.target.value)
                setSetting({ code: c.code, symbol: c.symbol, decimals: c.decimals })
              }}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Decimal places</span>
            <select value={String(settings.decimals ?? 2)} onChange={(e) => setSetting({ decimals: Number(e.target.value) })}>
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="full-span">
            <span>Current format</span>
            <input readOnly value={`Example: ${formatMoney(1234567.89, settings)}`} />
          </label>
        </div>
      </div>

      <div className="card">
        <h2>Date format</h2>
        <div className="form-grid">
          <label>
            <span>Format</span>
            <select value={settings.dateFormat || 'yyyy-mm-dd'} onChange={(e) => setSetting({ dateFormat: e.target.value })}>
              {DATE_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="card">
        <h2>Theme</h2>
        <div className="form-grid">
          <label>
            <span>Theme</span>
            <select value={settings.theme || 'light'} onChange={(e) => setSetting({ theme: e.target.value })}>
              {THEMES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="card">
        <h2>Categories</h2>
        <form className="form-grid" onSubmit={addCategory}>
          <label>
            <span>Add a category</span>
            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="e.g. Books" />
          </label>
          <div className="span-2">
            <button type="submit">Add category</button>
          </div>
        </form>
        <ul className="cat-list">
          {categories.map((c) => (
            <li key={c}>
              <span>{c}</span>
              <button type="button" className="secondary danger" onClick={() => removeCategory(c)}>✕</button>
            </li>
          ))}
        </ul>
        {note && note.text && <p className={`note ${note.isError ? 'err' : ''}`} role="status">{note.text}</p>}
      </div>

      <div className="card">
        <h2>Data backup &amp; restore</h2>
        <p className="muted">
          Export your data as JSON or export transactions/budgets as CSV. Restoring replaces your current data.
        </p>
        <div className="actions-row">
          <button type="button" onClick={exportTransactions}>Export transactions (CSV)</button>
          <button type="button" onClick={exportBudgets}>Export budgets (CSV)</button>
          <button type="button" onClick={exportAll}>Export data (JSON backup)</button>
          <label className="secondary">
            Import data (JSON)
            <input type="file" accept="application/json,.json" onChange={importData} hidden />
          </label>
          <button type="button" className="secondary danger" onClick={deleteAll}>Delete all data</button>
        </div>
        {importNote && importNote.text && (
          <p className={`note ${importNote.isError ? 'err' : ''}`} role="alert">{importNote.text}</p>
        )}
      </div>

      <div className="card">
        <h2>Logout</h2>
        {isSupabaseConfigured ? (
          <>
            <button type="button" className="primary" onClick={logout}>Sign out</button>
            <p className="muted" style={{ marginTop: 6 }}>Sign out of your account. Your data stays saved on Supabase.</p>
          </>
        ) : (
          <p className="muted">Not signed in — Supabase is not configured. Your data lives in local storage.</p>
        )}
      </div>
    </main>
  )
}
