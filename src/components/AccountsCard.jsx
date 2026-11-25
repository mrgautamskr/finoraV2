import { useMemo } from 'react'
import { computeAccountBalance, getAccounts } from '../lib/data'
import { formatMoney } from '../lib/utils'

export default function AccountsCard({ data, onDataChange, onNavigate }) {
  const accounts = getAccounts(data)
  const total = accounts.reduce((s, a) => s + computeAccountBalance(data, a.id), 0)

  return (
    <section className="card accounts-card">
      <h2>🏦 Accounts</h2>
      {accounts.length === 0 ? (
        <p className="muted">No accounts yet — add your first account on the Accounts page.</p>
      ) : (
        <div className="account-list">
          {accounts.map((a) => (
            <div key={a.id} className="account-row">
              <div className="account-info">
                <span className="account-name">{a.name}</span>
                <span className="account-type">{a.type}</span>
              </div>
              <span className="account-balance amt">{formatMoney(computeAccountBalance(data, a.id), data.settings)}</span>
            </div>
          ))}
          <div className="account-total">Total: {formatMoney(total, data.settings)}</div>
        </div>
      )}
      <button type="button" className="secondary" onClick={() => onNavigate && onNavigate('accounts')}>
        Manage accounts →
      </button>
    </section>
  )
}
