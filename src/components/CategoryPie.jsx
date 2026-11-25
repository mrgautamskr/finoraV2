import { PieChart } from './Charts'
import { categoryColor } from '../lib/constants'

export default function CategoryPie({ breakdown, settings, title = 'Expenses by category', totalFormatted }) {
  const total = breakdown.reduce((s, b) => s + b.total, 0)
  const slices = breakdown.map((b) => ({
    category: b.category,
    color: categoryColor(b.category),
    value: b.total,
  }))
  return (
    <section className="card">
      <h2>{title}</h2>
      <PieChart slices={slices} totalLabel={totalFormatted} />
    </section>
  )
}
