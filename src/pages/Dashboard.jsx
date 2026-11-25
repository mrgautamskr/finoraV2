import { useMemo } from 'react'
import AddForm from '../components/AddForm'
import TransactionTable from '../components/TransactionTable'
import BudgetCard from '../components/BudgetCard'
import CategoryPie from '../components/CategoryPie'
import StatCard from '../components/StatCard'
import { formatMoney, timeGreeting } from '../lib/utils'
import {
  currentMonthKey,
  lastDayOfMonthKey,
  monthTotals,
  getTodayTotals,
  avgDailyExpense,
  getBudgetInfo,
  categoryBreakdown,
} from '../lib/stats'
import { computeAccountBalance, getAccounts } from '../lib/data'
import AccountsCard from '../components/AccountsCard'

export default function Dashboard({ data, onDataChange, onNavigate }) {
  const settings = data.settings
  const monthKey = currentMonthKey()
  const monthTotal = useMemo(() => monthTotals(data, monthKey), [data, monthKey])
  const today = useMemo(() => getTodayTotals(data), [data])
  const daily = useMemo(() => avgDailyExpense(data), [data])
  const breakdown = useMemo(
    () => categoryBreakdown(data, { start: `${monthKey}-01`, end: lastDayOfMonthKey(monthKey) }),
    [data, monthKey],
  )
  const budgetInfo = useMemo(() => getBudgetInfo(data, monthKey), [data, monthKey])
  const totalBreakdown = breakdown.reduce((s, b) => s + b.total, 0)
  const accounts = getAccounts(data)
  const totalBalance = accounts.reduce((s, a) => s + computeAccountBalance(data, a.id), 0)
  const profile = data.profile || {}

  return (
    <main className="dashboard">
      <h1>📊 Dashboard</h1>
      <div className="card welcome-card">
        <h2>{timeGreeting()}{profile.name ? `, ${profile.name}` : ''}</h2>
        <p className="muted">
          {profile.profession ? `${profile.profession} · ` : ''}
          {profile.name
            ? 'Here is a quick summary of your money today and this month.'
            : 'Add your name and profession in Settings to get a personal greeting.'}
        </p>
      </div>
      <div className="stats-row">
        <StatCard label="Today's expenses" value={formatMoney(today.expense, settings)} color="var(--danger)" />
        <StatCard label="Today's income" value={formatMoney(today.income, settings)} color="var(--success)" />
        <StatCard label="Month expenses" value={formatMoney(monthTotal.expense, settings)} color="var(--danger)" />
        <StatCard label="Month income" value={formatMoney(monthTotal.income, settings)} color="var(--success)" />
        <StatCard
          label="Month net savings"
          value={formatMoney(monthTotal.net, settings)}
          color={monthTotal.net >= 0 ? 'var(--success)' : 'var(--danger)'}
        />
        <StatCard label="Avg daily expense (30d)" value={formatMoney(daily.avg, settings)} />
        <StatCard label="Total balance" value={formatMoney(totalBalance, settings)} color="var(--primary)" />
      </div>
      <AddForm data={data} onDataChange={onDataChange} />
      <div className="grid-2">
        <TransactionTable data={data} onDataChange={onDataChange} limit={6} />
        <BudgetCard budgetInfo={budgetInfo} data={data} onDataChange={onDataChange} onNavigate={onNavigate} />
      </div>
      <CategoryPie
        breakdown={breakdown}
        settings={settings}
        title="📊 Expenses by category (this month)"
        totalFormatted={formatMoney(totalBreakdown, settings)}
      />
      <AccountsCard data={data} onDataChange={onDataChange} onNavigate={onNavigate} />
    </main>
  )
}
