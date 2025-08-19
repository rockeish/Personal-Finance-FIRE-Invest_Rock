'use client'

import { useMemo } from 'react'
import { useFinanceStore } from '@/lib/store'
import NetWorthChart from '@/components/NetWorthChart'
import MonthlySpendingChart from '@/components/MonthlySpendingChart'
import MonthPicker from '@/components/MonthPicker'

export default function DashboardPage() {
  const { balances, currentMonth, getCategoryActuals, settings } =
    useFinanceStore()
  const kpis = useMemo(() => {
    const actuals = getCategoryActuals(currentMonth)
    const totalSpent = Object.values(actuals).reduce((s, v) => s + v, 0)
    const savings = Math.max(
      0,
      (settings.monthlyIncome || 0) -
        totalSpent -
        (settings.monthlyInvestContribution || 0)
    )
    return { totalSpent, savings }
  }, [
    currentMonth,
    getCategoryActuals,
    settings.monthlyIncome,
    settings.monthlyInvestContribution,
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="ml-auto">
          <MonthPicker />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <section className="rounded-lg border p-4">
          <h2 className="font-medium">Cash</h2>
          <p className="text-2xl">${balances.cash.toLocaleString()}</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="font-medium">Investments</h2>
          <p className="text-2xl">${balances.investments.toLocaleString()}</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="font-medium">Debts</h2>
          <p className="text-2xl">${balances.debt.toLocaleString()}</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="font-medium">This Month Spent</h2>
          <p className="text-2xl">${kpis.totalSpent.toLocaleString()}</p>
        </section>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-lg border p-4">
          <h2 className="font-medium mb-2">Monthly Spending</h2>
          <MonthlySpendingChart />
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="font-medium mb-2">Net Worth</h2>
          <NetWorthChart />
        </section>
      </div>
    </div>
  )
}
