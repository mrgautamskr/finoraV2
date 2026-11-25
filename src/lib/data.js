import { parseNumber, todayISO } from './utils'
import { DEFAULT_CATEGORIES } from './constants'

export const STORAGE_KEY = 'finora.data.v1'

export function createEmptyData() {
  return {
    transactions: [],
    budgets: [],
    goals: [],
    accounts: [],
    profile: { name: '', profession: '' },
    settings: {
      currency: 'USD',
      code: 'USD',
      symbol: '$',
      decimals: 2,
      dateFormat: 'yyyy-mm-dd',
      theme: 'light',
      categories: [...DEFAULT_CATEGORIES],
      defaultAccountId: null,
    },
  }
}

export function defaultCategoryFor(kind) {
  return kind === 'income' ? 'Salary' : 'Food & Dining'
}

export function nextId(prefix) {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${random}`
}

export function accountName(data, accountId) {
  const a = (data.accounts || []).find((x) => x.id === accountId)
  return a ? a.name : ''
}

export function getAccounts(data) {
  return data.accounts || []
}

export function getDefaultAccountId(data) {
  const id = data.settings?.defaultAccountId
  if (id && (data.accounts || []).some((a) => a.id === id)) return id
  return (data.accounts || [])[0]?.id || null
}

export function computeAccountBalance(data, accountId) {
  const a = (data.accounts || []).find((x) => x.id === accountId)
  if (!a) return 0
  let total = 0
  for (const t of data.transactions) {
    if (t.accountId !== accountId) continue
    total += t.kind === 'income' ? t.amount : -t.amount
  }
  return (a.openingBalance || 0) + total
}

export function addAccount(data, input) {
  const accounts = [...(data.accounts || [])]
  const account = {
    id: nextId('acct'),
    name: String(input.name || '').trim() || 'Account',
    type: String(input.type || 'Checking'),
    openingBalance: Math.abs(parseNumber(input.openingBalance, 0)),
    createdAt: Date.now(),
  }
  accounts.push(account)
  const isFirst = accounts.length === 1
  return {
    ...data,
    accounts,
    settings: {
      ...data.settings,
      defaultAccountId: isFirst ? account.id : data.settings.defaultAccountId,
    },
  }
}

export function removeAccount(data, accountId) {
  const accounts = (data.accounts || []).filter((a) => a.id !== accountId)
  const defaultId = accounts[0]?.id || null
  const transactions = data.transactions.map((t) =>
    t.accountId === accountId ? { ...t, accountId: defaultId } : t,
  )
  return {
    ...data,
    accounts,
    transactions,
    settings: {
      ...data.settings,
      defaultAccountId: data.settings.defaultAccountId === accountId ? defaultId : data.settings.defaultAccountId,
    },
  }
}

export function setDefaultAccount(data, accountId) {
  if (!(data.accounts || []).some((a) => a.id === accountId)) return data
  return { ...data, settings: { ...data.settings, defaultAccountId: accountId } }
}

function validTransactions(list) {
  if (!Array.isArray(list)) return []
  return list.filter((t) => t && typeof t === 'object' && typeof t.id === 'string' && typeof t.amount === 'number')
}

export function loadData() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyData()
    const parsed = JSON.parse(raw)
    const base = createEmptyData()
    const parsedSettings = parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {}
    const mergedCategories =
      Array.isArray(parsedSettings.categories) && parsedSettings.categories.length
        ? Array.from(new Set([...parsedSettings.categories, ...DEFAULT_CATEGORIES]))
        : [...DEFAULT_CATEGORIES]
    return {
      transactions: validTransactions(parsed.transactions),
      budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      profile: {
        ...base.profile,
        ...(parsed.profile && typeof parsed.profile === 'object' ? parsed.profile : {}),
      },
      settings: { ...base.settings, ...parsedSettings, categories: mergedCategories },
    }
  } catch {
    return createEmptyData()
  }
}

export function saveData(data) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* storage may be unavailable; ignore */
  }
}

export function sortTransactions(transactions) {
  return [...transactions].sort(
    (a, b) => String(b.date).localeCompare(String(a.date)) || (b.createdAt || 0) - (a.createdAt || 0),
  )
}

export function addTransaction(data, input) {
  const kind = input.kind === 'income' ? 'income' : 'expense'
  const category = (input.category || '').trim() || defaultCategoryFor(kind)
  const amount = parseNumber(input.amount, 0)
  const date = String(input.date || todayISO()).slice(0, 10)
  const accountId = input.accountId ? String(input.accountId) : null
  const txn = {
    id: nextId('txn'),
    kind,
    category,
    amount: Math.abs(amount),
    date,
    description: String(input.description || '').trim(),
    accountId,
    createdAt: Date.now(),
  }
  return { ...data, transactions: sortTransactions([...data.transactions, txn]) }
}

export function updateTransaction(data, id, patch) {
  return {
    ...data,
    transactions: sortTransactions(
      data.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    ),
  }
}

export function deleteTransaction(data, id) {
  return { ...data, transactions: data.transactions.filter((t) => t.id !== id) }
}

export function validateImportedData(data) {
  if (!data || typeof data !== 'object') return null
  const t = Array.isArray(data.transactions) ? data.transactions : []
  const b = Array.isArray(data.budgets) ? data.budgets : []
  const g = Array.isArray(data.goals) ? data.goals : []
  const a = Array.isArray(data.accounts) ? data.accounts : []
  if (t.length === 0 && b.length === 0 && g.length === 0 && a.length === 0) return null
  const base = createEmptyData()
  const settings = {
    ...base.settings,
    ...(data.settings && typeof data.settings === 'object' ? data.settings : {}),
  }
  if (!Array.isArray(settings.categories) || settings.categories.length === 0) {
    settings.categories = [...DEFAULT_CATEGORIES]
  }
  return {
    transactions: t.filter((x) => x && typeof x.id === 'string' && typeof x.amount === 'number'),
    budgets: b.filter((x) => x && typeof x.id === 'string'),
    goals: g.filter((x) => x && typeof x.id === 'string'),
    accounts: a.filter((x) => x && typeof x.id === 'string'),
    profile: {
      name: String((data.profile && data.profile.name) || ''),
      profession: String((data.profile && data.profile.profession) || ''),
    },
    settings,
  }
}
