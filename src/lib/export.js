function csvEscape(value) {
  const s = value === null || value === undefined ? '' : String(value)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function transactionsCSV(transactions) {
  const header = ['date', 'type', 'category', 'description', 'amount']
  const lines = [header.map(csvEscape).join(',')]
  for (const t of transactions) {
    lines.push([t.date, t.kind, t.category, t.description, t.amount].map(csvEscape).join(','))
  }
  return lines.join('\n')
}

export function budgetsCSV(budgetInfo) {
  const header = ['category', 'limit', 'spent', 'remaining']
  const lines = [header.map(csvEscape).join(',')]
  for (const b of budgetInfo.budgets) {
    lines.push([b.category, b.limit, b.spent, b.remaining].map(csvEscape).join(','))
  }
  if (budgetInfo.totalLimit > 0) {
    lines.push(['TOTAL', budgetInfo.totalLimit, budgetInfo.totalSpent, budgetInfo.totalLimit - budgetInfo.totalSpent].map(csvEscape).join(','))
  }
  return lines.join('\n')
}

function triggerDownload(filename, text, type) {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function downloadCSV(filename, text) {
  triggerDownload(filename, text, 'text/csv;charset=utf-8')
}

export function downloadJSON(filename, data) {
  triggerDownload(filename, JSON.stringify(data, null, 2), 'application/json;charset=utf-8')
}
