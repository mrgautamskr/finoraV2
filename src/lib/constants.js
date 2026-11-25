export const DEFAULT_CATEGORIES = [
  // Income
  'Salary',
  'Freelance',
  'Investment Income',
  'Gift Income',
  'Other Income',
  // Expenses
  'Food & Dining',
  'Restaurants',
  'Groceries',
  'Transportation',
  'Gasoline',
  'Car Maintenance',
  'Rent & Housing',
  'Mortgage Payment',
  'Property Tax',
  'Utilities',
  'Health & Fitness',
  'Entertainment',
  'Shopping',
  'Education',
  'Insurance Premium',
  'Taxes',
  'Donations',
  'Deposit',
  'Withdraw',
  'Credit',
  'Debit',
  'Other',
]

export const ACCOUNT_TYPES = [
  'Checking',
  'Savings',
  'Credit Card',
  'Investment',
  'Brokerage',
  'Cash',
  'Other',
]

export const CURRENCIES = [
  { code: 'USD', symbol: '$', decimals: 2, name: 'US Dollar' },
  { code: 'EUR', symbol: '€', decimals: 2, name: 'Euro' },
  { code: 'GBP', symbol: '£', decimals: 2, name: 'British Pound' },
  { code: 'JPY', symbol: '¥', decimals: 0, name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', decimals: 2, name: 'Indian Rupee' },
  { code: 'CNY', symbol: '¥', decimals: 2, name: 'Chinese Yuan' },
  { code: 'AUD', symbol: 'A$', decimals: 2, name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'CA$', decimals: 2, name: 'Canadian Dollar' },
]

export const DATE_FORMATS = [
  { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' },
  { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY' },
  { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY' },
  { value: 'mmm d, yyyy', label: 'Month D, YYYY' },
]

export const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

const CATEGORY_COLORS = {
  'Food & Dining': '#f97316',
  Transportation: '#0ea5e9',
  'Rent & Housing': '#6366f1',
  Utilities: '#8b5cf6',
  'Health & Fitness': '#10b981',
  Entertainment: '#ec4899',
  Shopping: '#f59e0b',
  Education: '#3b82f6',
  Salary: '#22c55e',
  Income: '#22c55e',
  Other: '#6b7280',
}

function hashStr(str) {
  let h = 0
  for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) | 0
  return Math.abs(h)
}

export function categoryColor(name) {
  const key = String(name || '').trim()
  if (CATEGORY_COLORS[key]) return CATEGORY_COLORS[key]
  if (!key) return '#6b7280'
  return `hsl(${hashStr(key) % 360}, 60%, 45%)`
}
