import { useState } from 'react'
import { addAccount, addTransaction, computeAccountBalance, getAccounts, removeAccount, setDefaultAccount, accountName } from '../lib/data'
import { formatMoney, parseNumber, todayISO } from '../lib/utils'
import { ACCOUNT_TYPES } from '../lib/constants'
import StatCard from '../components/StatCard'

const ACTIONS = ['Deposit', 'Withdraw', 'Credit', 'Debit']
const ACTION_VERB = { Deposit: 'Deposited', Withdraw: 'Withdrawn', Credit: 'Credited', Debit: 'Debited' }

export default function Accounts({ data, onDataChange, onNavigate }) {
  const accounts = getAccounts(data)
  const total = accounts.reduce((s, a) => s + computeAccountBalance(data, a.id), 0)
  const defaultId = data.settings?.defaultAccountId || accounts[0]?.id || null

  const [name, setName] = useState('')
  const [type, setType] = useState('Checking')
  const [opening, setOpening] = useState('')
  const [setDefault, setSetDefault] = useState(true)
  const [note, setNote] = useState(null)

  const [action, setAction] = useState('Deposit')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [actionAccount, setActionAccount] = useState('')
  const [actionNote, setActionNote] = useState(null)

  const actionAccountId = actionAccount && accounts.some((a) => a.id === actionAccount) ? actionAccount : defaultId

  function performAction(a) {
    const amt = parseNumber(amount, NaN)
    if (!Number.isFinite(amt) || amt <= 0) {
      setActionNote({ text: 'Enter a valid amount.', isError: true })
      return
    }
    const kind = a === 'Deposit' || a === 'Credit' ? 'income' : 'expense'
    onDataChange((prev) =>
      addTransaction(prev, {
        kind,
        category: a,
        amount: amt,
        date: todayISO(),
        description: desc.trim(),
        accountId: actionAccountId || undefined,
      }),
    )
    setAmount('')
    setDesc('')
    setActionNote({
      text: `${ACTION_VERB[a]}: ${formatMoney(amt, data.settings)}.`,
      isError: false,
    })
  }

  function addAccountForm(e) {
    e.preventDefault()
    const nm = name.trim()
    if (!nm) {
      setNote({ text: 'Enter an account name.', isError: true })
      return
    }
    const isFirst = !accounts.length
    let next = addAccount(data, { name: nm, type, openingBalance: Number(opening) || 0 })
    if (setDefault || isFirst) {
      const last = next.accounts[next.accounts.length - 1]
      next = setDefaultAccount(next, last.id)
    }
    onDataChange(() => next)
    setName('')
    setOpening('')
    setNote({ text: `Account "${nm}" added.`, isError: false })
  }

  function remove(id) {
    if (!window.confirm('Delete this account?')) return
    onDataChange((prev) => removeAccount(prev, id))
  }

  return (
    <main className="accounts">
      <h1>🏦 Accounts</h1>
      <div className="card accounts-summary">
        <StatCard label="Total balance" value={formatMoney(total, data.settings)} />
        <StatCard label="Accounts" value={String(accounts.length)} />
        <button type="button" className="secondary" onClick={() => onNavigate('dashboard')}>← Back to Dashboard</button>
      </div>

      <div className="card">
        <h2>➕ Add an account</h2>
        <form className="form-grid" onSubmit={addAccountForm}>
          <label>
            <span>Name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Main Account" />
          </label>
          <label>
            <span>Type</span>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Opening balance</span>
            <input type="number" step="0.01" min="0" value={opening} onChange={(e) => setOpening(e.target.value)} placeholder="0.00" />
          </label>
          <label className="full-span">
            <span>Set as default</span>
            <input type="checkbox" checked={setDefault} onChange={(e) => setSetDefault(e.target.checked)} />
          </label>
          <div className="span-2">
            <button type="submit">Add Account</button>
            {note && <span className={`note ${note.isError ? 'err' : ''}`} role="status">{note.text}</span>}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>💳 Account activity</h2>
        <form className="form-grid" onSubmit={(e) => { e.preventDefault(); performAction(action) }}>
          <label>
            <span>Account</span>
            <select value={actionAccountId || ''} onChange={(e) => setActionAccount(e.target.value)}>
              <option value="">Default account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.type}
                </option>
              ))}
            </select>
          </label>
          <label className="full-span actions-row">
            <span>Action</span>
            <div className="action-buttons">
              {ACTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={action === a ? 'primary' : 'secondary'}
                  onClick={() => {
                    setAction(a)
                    performAction(a)
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </label>
          <label>
            <span>Amount</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label className="full-span">
            <span>Description (optional)</span>
            <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Salary, gift" />
          </label>
          <div className="span-2 actions-row">
            {actionNote && (
              <span className={`note ${actionNote.isError ? 'err' : ''}`} role="status">
                {actionNote.text}
              </span>
            )}
          </div>
        </form>
        {actionAccountId && (
          <p className="muted" style={{ marginTop: 8 }}>
            Operations on <strong>{accountName(data, actionAccountId) || 'default account'}</strong> update its balance.
          </p>
        )}
      </div>

      <div className="card">
        <h2>📋 Your accounts</h2>
        {accounts.length === 0 ? (
          <p className="empty-text">No accounts yet. Add one above — you can add as many as you need.</p>
        ) : (
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Currency</th>
                <th style={{ textAlign: 'right' }}>Balance</th>
                <th>Default</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td><span className="badge">{a.type}</span></td>
                  <td className="amt">{a.currency || data.settings.code || 'USD'}</td>
                  <td className="amt amt-expense">{formatMoney(computeAccountBalance(data, a.id), data.settings)}</td>
                  <td>
                    {a.id === defaultId ? (
                      <span className="badge badge-success">● Default</span>
                    ) : (
                      <button type="button" className="secondary" onClick={() => onDataChange((prev) => setDefaultAccount(prev, a.id))}>
                        Set default
                      </button>
                    )}
                  </td>
                  <td>
                    <button type="button" className="secondary danger" onClick={() => remove(a.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
