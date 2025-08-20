import { create } from 'zustand'
import { categorizeTransaction } from './categorization'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Transaction = Record<string, any> & {
  amount?: number
  date?: string
}

export type NormalizedTransaction = {
  key: string
  date: Date
  description: string
  amount: number
  account?: string
  category?: string
  raw: Record<string, any>
}

export type FinanceState = {
  balances: { cash: number; investments: number; debt: number }
  transactions: Transaction[]
  monthlySpending: { month: Date; amount: number }[]
  netWorthHistory: { date: Date; value: number }[]
  budgetCategories: Record<string, number> // legacy
  categories: Record<string, { planned: number; rules: string[] }>
  transactionCategories: Record<string, string>
  currentMonth: string // YYYY-MM
  holdings: Record<string, number>
  targetAllocation: Record<string, number>
  settings: {
    currency: string
    locale?: string
    monthlyIncome: number
    monthlyInvestContribution: number
    withdrawalRatePercent: number
    enableRollovers: boolean
  }
  addTransactions: (rows: Transaction[]) => void
  clearTransactions: () => void
  addCategory: (name: string) => void
  removeCategory: (name: string) => void
  setCategoryPlanned: (name: string, amount: number) => void
  addCategoryRule: (name: string, pattern: string) => void
  removeCategoryRule: (name: string, pattern: string) => void
  applyRules: () => void
  setTransactionCategory: (key: string, category: string | undefined) => void
  setCurrentMonth: (ym: string) => void
  setBudgetAmount: (name: string, amount: number) => void // legacy helper
  setHolding: (symbol: string, shares: number) => void
  removeHolding: (symbol: string) => void
  setTargetAllocation: (symbol: string, percent: number) => void
  setBalance: (key: 'cash' | 'investments' | 'debt', value: number) => void
  setSettings: (partial: Partial<FinanceState['settings']>) => void
  exportState: () => string
  importState: (json: string) => void
  resetAll: () => void
  getMonthlyTransactions: (ym: string) => NormalizedTransaction[]
  getCategoryActuals: (ym: string) => Record<string, number>
}

const LOCAL_KEY = 'finance-pro-state-v2'

const initialState: Omit<
  FinanceState,
  | 'addTransactions'
  | 'clearTransactions'
  | 'addCategory'
  | 'removeCategory'
  | 'setCategoryPlanned'
  | 'addCategoryRule'
  | 'removeCategoryRule'
  | 'applyRules'
  | 'setTransactionCategory'
  | 'setCurrentMonth'
  | 'setBudgetAmount'
  | 'setHolding'
  | 'removeHolding'
  | 'setTargetAllocation'
  | 'setBalance'
  | 'setSettings'
  | 'exportState'
  | 'importState'
  | 'resetAll'
  | 'getMonthlyTransactions'
  | 'getCategoryActuals'
> = {
  balances: { cash: 10000, investments: 25000, debt: 5000 },
  transactions: [],
  monthlySpending: [],
  netWorthHistory: [],
  budgetCategories: { Rent: 1500, Groceries: 400, Utilities: 150, Fun: 200 },
  categories: {
    Rent: { planned: 1500, rules: ['rent', 'landlord'] },
    Groceries: {
      planned: 400,
      rules: ['grocery', 'supermarket', 'whole\\s?foods', 'trader\\s?joe'],
    },
    Utilities: {
      planned: 150,
      rules: ['utility', 'electric', 'water', 'internet', 'cable'],
    },
    Fun: {
      planned: 200,
      rules: ['netflix', 'spotify', 'entertainment', 'cinema', 'movie', 'hulu'],
    },
  },
  transactionCategories: {},
  currentMonth: (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })(),
  holdings: { VTI: 50, VXUS: 30, BND: 20 },
  targetAllocation: { VTI: 60, VXUS: 30, BND: 10 },
  settings: {
    currency: 'USD',
    monthlyIncome: 6000,
    monthlyInvestContribution: 1000,
    withdrawalRatePercent: 4,
    enableRollovers: false,
  },
}

function normalizeRow(row: Transaction): NormalizedTransaction | null {
  const rawDate =
    (row as any).date ||
    (row as any).Date ||
    (row as any).posted ||
    (row as any).POSTED
  if (!rawDate) return null
  const date = new Date(rawDate)
  if (isNaN(date.getTime())) return null
  let amount = Number((row as any).amount ?? (row as any).Amount ?? 0)
  if (!amount || isNaN(amount)) {
    const debit = Number((row as any).debit ?? (row as any).Debit ?? 0)
    const credit = Number((row as any).credit ?? (row as any).Credit ?? 0)
    if (debit) amount = -Math.abs(debit)
    else if (credit) amount = Math.abs(credit)
  }
  const description = String(
    (row as any).description ??
      (row as any).Description ??
      (row as any).name ??
      (row as any).memo ??
      (row as any).Merchant ??
      ''
  ).trim()
  const account = (row as any).account ?? (row as any).Account ?? undefined
  const key = `${date.toISOString().slice(0, 10)}|${description}|${amount}`
  return { key, date, description, amount, account, raw: row }
}

function deriveMonthlySpending(
  transactions: Transaction[]
): { month: Date; amount: number }[] {
  const map = new Map<string, number>()
  for (const t of transactions) {
    const n = normalizeRow(t)
    if (!n) continue
    const key = `${n.date.getFullYear()}-${n.date.getMonth() + 1}`
    map.set(key, (map.get(key) || 0) + n.amount)
  }
  return Array.from(map.entries())
    .map(([ym, amount]) => {
      const [y, m] = ym.split('-').map(Number)
      return { month: new Date(y, m - 1, 1), amount }
    })
    .sort((a, b) => a.month.getTime() - b.month.getTime())
}

function deriveNetWorthHistory(
  balances: FinanceState['balances'],
  monthlySpending: { month: Date; amount: number }[]
) {
  const history: { date: Date; value: number }[] = []
  let base = balances.cash + balances.investments - balances.debt
  for (const m of monthlySpending) {
    base -= Math.max(0, m.amount)
    history.push({ date: m.month, value: base })
  }
  return history
}

function coercePersisted(parsed: any): Partial<FinanceState> {
  if (!parsed || typeof parsed !== 'object') return {}
  const next: any = { ...parsed }
  if (next.monthlySpending && Array.isArray(next.monthlySpending)) {
    next.monthlySpending = next.monthlySpending.map((m: any) => ({
      month: new Date(m.month),
      amount: Number(m.amount ?? 0),
    }))
  }
  if (next.netWorthHistory && Array.isArray(next.netWorthHistory)) {
    next.netWorthHistory = next.netWorthHistory.map((n: any) => ({
      date: new Date(n.date),
      value: Number(n.value ?? 0),
    }))
  }
  if (next.categories && typeof next.categories === 'object') {
    for (const k of Object.keys(next.categories)) {
      next.categories[k] = {
        planned: Number(next.categories[k]?.planned ?? 0),
        rules: Array.isArray(next.categories[k]?.rules)
          ? next.categories[k].rules
          : [],
      }
    }
  }
  if (
    next.transactionCategories &&
    typeof next.transactionCategories === 'object'
  ) {
    next.transactionCategories = { ...next.transactionCategories }
  }
  if (typeof next.currentMonth !== 'string') {
    const d = new Date()
    next.currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  if (next.settings && typeof next.settings === 'object') {
    next.settings = {
      currency: next.settings.currency || 'USD',
      locale: next.settings.locale,
      monthlyIncome: Number(next.settings.monthlyIncome ?? 0),
      monthlyInvestContribution: Number(
        next.settings.monthlyInvestContribution ?? 0
      ),
      withdrawalRatePercent: Number(next.settings.withdrawalRatePercent ?? 4),
      enableRollovers: Boolean(next.settings.enableRollovers),
    }
  }
  if (next.targetAllocation && typeof next.targetAllocation === 'object') {
    const m: Record<string, number> = {}
    for (const k of Object.keys(next.targetAllocation))
      m[k] = Number(next.targetAllocation[k] ?? 0)
    next.targetAllocation = m
  }
  if (next.balances && typeof next.balances === 'object') {
    next.balances = {
      cash: Number(next.balances.cash ?? 0),
      investments: Number(next.balances.investments ?? 0),
      debt: Number(next.balances.debt ?? 0),
    }
  }
  if (next.holdings && typeof next.holdings === 'object') {
    const h: Record<string, number> = {}
    for (const k of Object.keys(next.holdings))
      h[k] = Number(next.holdings[k] ?? 0)
    next.holdings = h
  }
  if (next.budgetCategories && typeof next.budgetCategories === 'object') {
    const b: Record<string, number> = {}
    for (const k of Object.keys(next.budgetCategories))
      b[k] = Number(next.budgetCategories[k] ?? 0)
    next.budgetCategories = b
  }
  return next as Partial<FinanceState>
}

function loadPersisted(): Partial<FinanceState> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return coercePersisted(parsed)
  } catch (e) {
    console.warn('Failed to parse persisted state', e)
    return null
  }
}

function persist(state: FinanceState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state))
  } catch {}
}

export const useFinanceStore = create<FinanceState>((set, get) => {
  const persisted = loadPersisted()
  const base = { ...initialState, ...(persisted ?? {}) } as FinanceState
  return {
    ...base,
    addTransactions: (rows) =>
      set(() => {
        const tx = [...get().transactions, ...rows]
        const monthly = deriveMonthlySpending(tx)
        const netWorth = deriveNetWorthHistory(get().balances, monthly)
        const next = {
          ...get(),
          transactions: tx,
          monthlySpending: monthly,
          netWorthHistory: netWorth,
        } as FinanceState
        persist(next)
        return next
      }),
    clearTransactions: () =>
      set(() => {
        const next = {
          ...get(),
          transactions: [],
          monthlySpending: [],
          netWorthHistory: [],
        } as FinanceState
        persist(next)
        return next
      }),
    addCategory: (name) =>
      set(() => {
        if (!name) return get()
        const categories = { ...get().categories }
        if (!categories[name]) categories[name] = { planned: 0, rules: [] }
        const next = { ...get(), categories } as FinanceState
        persist(next)
        return next
      }),
    removeCategory: (name) =>
      set(() => {
        const categories = { ...get().categories }
        delete categories[name]
        const next = { ...get(), categories } as FinanceState
        persist(next)
        return next
      }),
    setCategoryPlanned: (name, amount) =>
      set(() => {
        const categories = { ...get().categories }
        if (!categories[name]) categories[name] = { planned: 0, rules: [] }
        categories[name] = { ...categories[name], planned: amount }
        const next = { ...get(), categories } as FinanceState
        persist(next)
        return next
      }),
    addCategoryRule: (name, pattern) =>
      set(() => {
        if (!name || !pattern) return get()
        const categories = { ...get().categories }
        if (!categories[name]) categories[name] = { planned: 0, rules: [] }
        if (!categories[name].rules.includes(pattern))
          categories[name].rules.push(pattern)
        const next = { ...get(), categories } as FinanceState
        persist(next)
        return next
      }),
    removeCategoryRule: (name, pattern) =>
      set(() => {
        const categories = { ...get().categories }
        if (categories[name])
          categories[name].rules = categories[name].rules.filter(
            (p) => p !== pattern
          )
        const next = { ...get(), categories } as FinanceState
        persist(next)
        return next
      }),
    applyRules: () =>
      set((state) => {
        const newTransactionCategories = { ...state.transactionCategories }
        for (const transaction of state.transactions) {
          const normalized = normalizeRow(transaction)
          if (!normalized) continue

          // If already categorized, skip
          if (newTransactionCategories[normalized.key]) continue

          const category = categorizeTransaction(normalized.description)
          if (category) {
            newTransactionCategories[normalized.key] = category
          }
        }
        const next = { ...get(), transactionCategories: newTransactionCategories } as FinanceState
        persist(next)
        return next
      }),
    setTransactionCategory: (key, category) =>
      set(() => {
        const map = { ...get().transactionCategories } as Record<string, string>
        if (!category) delete map[key]
        else map[key] = category
        const next = { ...get(), transactionCategories: map } as FinanceState
        persist(next)
        return next
      }),
    setCurrentMonth: (ym) =>
      set(() => {
        const next = { ...get(), currentMonth: ym } as FinanceState
        persist(next)
        return next
      }),
    setBudgetAmount: (name, amount) =>
      set(() => {
        const next = {
          ...get(),
          budgetCategories: { ...get().budgetCategories, [name]: amount },
        } as FinanceState
        persist(next)
        return next
      }),
    setHolding: (symbol, shares) =>
      set(() => {
        const next = {
          ...get(),
          holdings: { ...get().holdings, [symbol]: shares },
        } as FinanceState
        persist(next)
        return next
      }),
    removeHolding: (symbol) =>
      set(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [symbol]: _, ...rest } = get().holdings
        const next = { ...get(), holdings: rest } as FinanceState
        persist(next)
        return next
      }),
    setTargetAllocation: (symbol, percent) =>
      set(() => {
        const next = {
          ...get(),
          targetAllocation: { ...get().targetAllocation, [symbol]: percent },
        } as FinanceState
        persist(next)
        return next
      }),
    setBalance: (key, value) =>
      set(() => {
        const nextBalances = {
          ...get().balances,
          [key]: value,
        } as FinanceState['balances']
        const netWorth = deriveNetWorthHistory(
          nextBalances,
          get().monthlySpending
        )
        const next = {
          ...get(),
          balances: nextBalances,
          netWorthHistory: netWorth,
        } as FinanceState
        persist(next)
        return next
      }),
    setSettings: (partial) =>
      set(() => {
        const next = {
          ...get(),
          settings: { ...get().settings, ...partial },
        } as FinanceState
        persist(next)
        return next
      }),
    exportState: () => JSON.stringify(get()),
    importState: (json: string) =>
      set(() => {
        const parsed = coercePersisted(JSON.parse(json))
        const next = { ...get(), ...parsed } as FinanceState
        persist(next)
        return next
      }),
    resetAll: () =>
      set(() => {
        const next = { ...get(), ...initialState } as FinanceState
        persist(next)
        return next
      }),
    getMonthlyTransactions: (ym) => {
      const list: NormalizedTransaction[] = []
      const map = get().transactionCategories
      for (const row of get().transactions) {
        const n = normalizeRow(row)
        if (!n) continue
        const y = n.date.getFullYear()
        const m = String(n.date.getMonth() + 1).padStart(2, '0')
        if (`${y}-${m}` !== ym) continue
        n.category = map[n.key] || undefined
        list.push(n)
      }
      return list.sort((a, b) => a.date.getTime() - b.date.getTime())
    },
    getCategoryActuals: (ym) => {
      const totals: Record<string, number> = {}
      for (const t of get().getMonthlyTransactions(ym)) {
        if (t.amount >= 0) continue
        const cat = t.category || 'Uncategorized'
        totals[cat] = (totals[cat] || 0) + Math.abs(t.amount)
      }
      return totals
    },
  }
})
