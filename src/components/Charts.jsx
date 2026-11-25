export function PieChart({ slices = [], totalLabel }) {
  const total = slices.reduce((s, x) => s + (x.value || 0), 0)
  if (!Number.isFinite(total) || total <= 0) {
    return <div className="empty">No expense data for this period yet.</div>
  }
  const size = 220
  const r = size / 2 - 16
  const cx = size / 2
  const cy = size / 2
  let angle = -Math.PI / 2
  const arcs = slices.map((s, i) => {
    const v = Math.max(0, s.value || 0)
    const sweep = (v / total) * 2 * Math.PI
    const x1 = cx + r * Math.cos(angle)
    const y1 = cy + r * Math.sin(angle)
    angle += sweep
    const x2 = cx + r * Math.cos(angle)
    const y2 = cy + r * Math.sin(angle)
    const large = sweep > Math.PI ? 1 : 0
    const d = `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`
    return <path key={s.category || i} d={d} fill={s.color} />
  })
  const legend = slices.map((s, i) => (
    <div key={s.category || i} className="legend-row">
      <span className="legend-dot" style={{ background: s.color }} />
      <span className="legend-name">{s.category}</span>
      <span className="legend-amt">{s.value}</span>
    </div>
  ))
  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Expense by category">
        {arcs}
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize={size / 6.5} fontWeight={700} fill="var(--text)">
          {totalLabel || total}
        </text>
      </svg>
      <div className="legend">{legend}</div>
    </div>
  )
}

export function BarChart({ bars = [], max, width = 400, height = 150, valueFormatter }) {
  const maxV = Math.max(1, max || 0, ...bars.map((b) => b.value || 0))
  const inner = width - 20
  const gap = bars.length ? Math.max(2, Math.min(10, inner / bars.length / 2)) : 4
  const step = inner / Math.max(1, bars.length)
  return (
    <div className="bar-chart" style={{ height: `${height}px`, width: `${width}px` }} role="img" aria-label="Bar chart">
      {bars.map((b, i) => {
        const v = Math.max(0, b.value || 0)
        const h = (v / maxV) * height
        const left = i * step + gap
        const barW = step - gap * 2
        return (
          <div key={b.label || i} className="bar-col" style={{ left, width: `${barW}px` }}>
            <div className="bar-val">{valueFormatter ? valueFormatter(v) : v}</div>
            <div
              className="bar"
              style={{ height: `${Math.max(v > 0 ? 4 : 0, h)}px`, background: b.color || 'var(--primary)' }}
              title={`${b.label}: ${valueFormatter ? valueFormatter(v) : v}`}
            />
            <div className="bar-lbl">{b.label}</div>
          </div>
        )
      })}
    </div>
  )
}

export function LineChart({ points = [], width = 380, height = 120 }) {
  if (!points.length) return null
  const maxY = Math.max(...points.map((p) => p.y || 0), 1)
  const xOf = (i) => (points.length === 1 ? 0 : (i / (points.length - 1)) * width)
  const yOf = (v) => height - (v / maxY) * height
  const linePoints = points.map((p, i) => `${xOf(i).toFixed(1)},${yOf(p.y).toFixed(1)}`).join(' ')
  const dots = points.map((p, i) => `<circle cx="${xOf(i).toFixed(1)}" cy="${yOf(p.y).toFixed(1)}" r="3" fill="var(--primary)" />`).join('')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" width={width} height={height} role="img" aria-label="Trend chart">
      <polyline fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={linePoints} />
      <g dangerouslySetInnerHTML={{ __html: dots }} />
    </svg>
  )
}
