import { useMemo, useState } from 'react'
import EditTransactionModal from './EditTransactionModal'
import { formatDateLabel, formatMoney } from '../lib/utils'
import { accountName, deleteTransaction } from '../lib/data'

export default function TransactionTable({ data, transactions, onDataChange, limit }) {
  const settings = data.settings || {}
  const [editingId, setEditingId] = useState(null)
  const txns = useMemo(() => {
    const all = transactions || data.transactions
    return limit ? all.slice(0, limit) : all
  }, [transactions, data.transactions, limit])

  function deleteTxn(id) {
    if (!window.confirm('Delete this entry?')) return
    if (editingId === id) setEditingId(null)
    onDataChange((prev) => deleteTransaction(prev, id))
  }

  const editingTxn = txns.find((t) => t.id === editingId)

  return (
    <section className="card" aria-label="Transaction history">
      <h2>{txns.length ? `📋 Transactions (${txns.length})` : '📋 No transactions yet'}</h2>
      {txns.length === 0 ? (
        <p className="empty-text">Add your first expense or income to see it here.</p>
      ) : (
        <table className="txn-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Account</th>
              <th>Category</th>
              <th>Description</th>
              <th className="amt-header">Amount</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id} className={`txn-row kind-${t.kind}`}>
                <td className="txn-date">{formatDateLabel(t.date, settings)}</td>
                <td>
                  <span className={`badge badge-${t.kind}`}>{t.kind === 'expense' ? 'Expense' : 'Income'}</span>
                </td>
                <td className="txn-acct">{t.accountId ? accountName(data, t.accountId) : '—'}</td>
                <td className="txn-cat">{t.category}</td>
                <td className="txn-desc">{t.description || ''}</td>
                <td className={`amt amt-${t.kind}`}>{formatMoney(t.amount, settings)}</td>
                <td className="actions">
                  <button type="button" className="secondary" onClick={() => setEditingId(t.id)}>Edit</button>
                  <button type="button" className="secondary danger" onClick={() => deleteTxn(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editingTxn && (
        <EditTransactionModal
          txn={editingTxn}
          data={data}
          onDataChange={onDataChange}
          onClose={() => setEditingId(null)}
        />
      )}
    </section>
  )
}
