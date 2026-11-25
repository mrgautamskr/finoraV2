import { formatMoney } from '../lib/utils'

export default function BudgetCard({ budgetInfo, data, onDataChange, onNavigate }) {
  const settings = data.settings || {}
  const totalLimit = budgetInfo.totalLimit
  const totalSpent = budgetInfo.totalSpent
  const percent = budgetInfo.overallPercent * 100

  return (
    <section className="card budget-card">
      <h2>💰 Budget this month</h2>
      <div className="budget-summary">
        <div>
          <span className="label">Spent</span>
          <span className="value amt-expense">{formatMoney(totalSpent, settings)}</span>
        </div>
        <div>
          <span className="label">Limit</span>
          <span className="value">{formatMoney(totalLimit, settings)}</span>
        </div>
        <div>
          <span className="label">Progress</span>
          <span className={`value ${totalSpent > totalLimit ? 'over' : ''}`}>{Math.round(percent)}%</span>
        </div>
      </div>
      <div className="progress">
        <span
          style={{
            width: `${Math.min(100, percent)}%`,
            background: totalSpent > totalLimit ? 'var(--danger)' : 'var(--primary)',
          }}
        />
      </div>
      <div className="budget-actions">
        <button type="button" className="secondary" onClick={() => onNavigate && onNavigate('budgets')}>
          View budgets →
        </button>
      </div>
      {budgetInfo.budgets.length > 0 && (
        <ul className="budget-list">
          {budgetInfo.budgets.map((b) => (
            <li key={b.id}>
              {b.category} — spent {formatMoney(b.spent, settings)} / limit {formatMoney(b.limit, settings)}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
