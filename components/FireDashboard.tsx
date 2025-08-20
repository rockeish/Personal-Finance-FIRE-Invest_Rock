// components/FireDashboard.tsx
'use client'

import { useState } from 'react'
import { useFinanceStore } from '@/lib/store'
import { formatCurrency, formatPercent } from '@/lib/format'

export default function FireDashboard() {
  const { settings } = useFinanceStore()
  const [annualExpenses, setAnnualExpenses] = useState(40000)
  const [withdrawalRate, setWithdrawalRate] = useState(
    settings.withdrawalRatePercent || 4
  )

  const fireNumber = annualExpenses / (withdrawalRate / 100)
  const savingsRate =
    settings.monthlyIncome > 0
      ? (settings.monthlyInvestContribution / settings.monthlyIncome) * 100
      : 0

  // A very simplified "Years to FI" calculation.
  // This does not account for investment growth, which is a major simplification.
  // A real implementation would use a more complex formula.
  const yearsToFI =
    savingsRate > 0
      ? Math.log(
          (fireNumber * (0.05 / 12)) /
            (settings.monthlyInvestContribution * 12) +
            1
        ) /
        Math.log(1 + 0.05 / 12) /
        12
      : 'N/A'

  return (
    <div className="p-4 rounded-lg bg-white shadow">
      <h2 className="text-lg font-semibold mb-4">FIRE Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-4 rounded-lg border">
          <h3 className="font-medium text-sm text-gray-600">FIRE Number</h3>
          <p className="text-2xl font-bold">{formatCurrency(fireNumber)}</p>
        </div>
        <div className="p-4 rounded-lg border">
          <h3 className="font-medium text-sm text-gray-600">Savings Rate</h3>
          <p className="text-2xl font-bold">
            {formatPercent(savingsRate / 100)}
          </p>
        </div>
        <div className="p-4 rounded-lg border">
          <h3 className="font-medium text-sm text-gray-600">Years to FI</h3>
          <p className="text-2xl font-bold">
            {typeof yearsToFI === 'number' ? yearsToFI.toFixed(1) : yearsToFI}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estimated Annual Expenses
          </label>
          <input
            type="number"
            value={annualExpenses}
            onChange={(e) => setAnnualExpenses(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Withdrawal Rate (%)
          </label>
          <input
            type="number"
            value={withdrawalRate}
            onChange={(e) => setWithdrawalRate(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  )
}
