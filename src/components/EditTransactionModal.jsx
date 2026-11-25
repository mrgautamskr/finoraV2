import { useState } from 'react'
import { updateTransaction, getAccounts, getDefaultAccountId } from '../lib/data'
import { DEFAULT_CATEGORIES } from '../lib/constants'
import { parseNumber, todayISO } from '../lib/utils'

export default function EditTransactionModal({ txn, data, onDataChange, onClose }) {
  const [kind, setKind] = useState(txn.kind)
  const [category, setCategory] = useState(txn.category || '')
  const [amount, setAmount] = useState(String(txn.amount || ''))
  const [date, setDate] = useState(txn.date || todayISO())
  const [description, setDescription] = useState(txn.description || '')
  const [note, setNote] = useState(null)
  const [account, setAccount] = useState(txn.accountId || null)
  const categories = data.settings?.categories || DEFAULT_CATEGORIES
  const accounts = getAccounts(data)
  const defaultAccountId = getDefaultAccountId(data)
  const selectedAccount = (account && accounts.some((a) => a.id === account) ? account : defaultAccountId) || ''

  function save(e) {
    e.preventDefault()
    const amt = parseNumber(amount, NaN)
    if (!Number.isFinite(amt) || amt < 0) {
      setNote({ text: 'Enter a valid non-negative amount.', isError: true })
      return
    }
    const cat = (category || '').trim() || 'Other'
    onDataChange((prev) =>
      updateTransaction(prev, txn.id, {
        kind,
        category: cat,
        amount: Math.abs(amt),
        date: String(date || '').slice(0, 10),
        description,
        accountId: selectedAccount || null,
      }),
    )
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" role="dialog" aria-modal="true" onSubmit={save}>
        <h3>Edit entry</h3>
        <label>
          <span>Type</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label>
          <span>Account</span>
          <select value={selectedAccount} onChange={(e) => setAccount(e.target.value)}>
            <option value="">— none —</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {a.type}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Category</span>
          <input type="text" list="finora-categories" value={category} onChange={(e) => setCategory(e.target.value)} />
          <datalist id="finora-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label>
          <span>Amount</span>
          <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label>
          <span>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="span-2">
          <span>Description</span>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        {note && (
          <p className={`note ${note.isError ? 'err' : ''}`} role={note.isError ? 'alert' : 'status'}>
            {note.text}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary">Save</button>
        </div>
      </form>
    </div>
  )
}
