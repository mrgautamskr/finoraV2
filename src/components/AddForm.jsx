import { useState } from 'react'
import { DEFAULT_CATEGORIES } from '../lib/constants'
import { addTransaction, defaultCategoryFor, getAccounts, getDefaultAccountId } from '../lib/data'
import { isPositiveAmount, parseNumber, todayISO } from '../lib/utils'

export default function AddForm({ data, onDataChange }) {
  const [kind, setKind] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(defaultCategoryFor('expense'))
  const [date, setDate] = useState(todayISO())
  const [description, setDescription] = useState('')
  const [note, setNote] = useState(null)
  const [account, setAccount] = useState('')

  const categories = data.settings?.categories || DEFAULT_CATEGORIES
  const accounts = getAccounts(data)
  const defaultAccountId = getDefaultAccountId(data)
  const selectedAccount = account && accounts.some((a) => a.id === account) ? account : defaultAccountId

  function changeKind(next) {
    setKind(next)
    setCategory(defaultCategoryFor(next))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!isPositiveAmount(amount)) {
      setNote({ text: 'Please enter a positive amount.', isError: true })
      return
    }
    const amt = parseNumber(amount, NaN)
    const cat = (category || '').trim() || defaultCategoryFor(kind)
    onDataChange((prev) =>
      addTransaction(prev, { kind, category: cat, amount: amt, date, description, accountId: selectedAccount }),
    )
    setAmount('')
    setCategory(defaultCategoryFor(kind))
    setDate(todayISO())
    setDescription('')
    setNote({ text: kind === 'income' ? 'Income recorded.' : 'Expense saved.', isError: false })
  }

  return (
    <section className="card add-form">
      <h2>{kind === 'income' ? '📥 Add income' : '📝 Add expense'}</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>Type</span>
          <select value={kind} onChange={(e) => changeKind(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label>
          <span>Account</span>
          <select value={selectedAccount || ''} onChange={(e) => setAccount(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {a.type}
              </option>
            ))}
            {accounts.length === 0 && (
              <option value="">No accounts — open the Accounts page</option>
            )}
          </select>
        </label>
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
          <span>Amount</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </label>
        <label>
          <span>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="span-2">
          <span>Description (optional)</span>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Where, what for" />
        </label>
        <div className="span-2 buttons">
          <button type="submit">{kind === 'income' ? 'Add Income' : 'Add Expense'}</button>
          {note && <span className={`note ${note.isError ? 'err' : ''}`} role="status">{note.text}</span>}
        </div>
      </form>
    </section>
  )
}
