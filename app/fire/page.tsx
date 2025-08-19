'use client'

import { useFinanceStore } from '@/lib/store'
import Link from 'next/link'
import { useMemo } from 'react'

function calculateFIRE({
  annualSpending,
  withdrawalRatePercent,
  currentPortfolio,
  annualContributions,
  expectedReturnPercent,
}: {
  annualSpending: number
  withdrawalRatePercent: number
  currentPortfolio: number
  annualContributions: number
  expectedReturnPercent: number
}) {
  const target = annualSpending / (withdrawalRatePercent / 100)
  let years = 0
  let balance = currentPortfolio
  const r = expectedReturnPercent / 100
  while (balance < target && years < 100) {
    balance = balance * (1 + r) + annualContributions
    years += 1
  }
  return { target, yearsToFI: years, projectedBalance: balance }
}

export default function FIREPage() {
  const { balances, monthlySpending, settings, setSettings } = useFinanceStore()
  const avgMonthly = useMemo(() => {
    if (monthlySpending.length === 0) return 0
    return (
      monthlySpending.reduce((s, m) => s + m.amount, 0) / monthlySpending.length
    )
  }, [monthlySpending])

  const result = calculateFIRE({
    annualSpending: avgMonthly * 12,
    withdrawalRatePercent: settings.withdrawalRatePercent,
    currentPortfolio: balances.investments,
    annualContributions: settings.monthlyInvestContribution * 12,
    expectedReturnPercent: 5,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">FIRE</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded border p-4 space-y-3">
          <h2 className="font-medium">Inputs</h2>
          <label className="block text-sm">
            Withdrawal rate (%)
            <input
              className="mt-1 w-full border rounded px-2 py-1"
              type="number"
              value={settings.withdrawalRatePercent}
              onChange={(e) =>
                setSettings({ withdrawalRatePercent: Number(e.target.value) })
              }
            />
          </label>
          <label className="block text-sm">
            Monthly investment contribution ($)
            <input
              className="mt-1 w-full border rounded px-2 py-1"
              type="number"
              value={settings.monthlyInvestContribution}
              onChange={(e) =>
                setSettings({
                  monthlyInvestContribution: Number(e.target.value),
                })
              }
            />
          </label>
          <p className="text-xs text-gray-500">
            Adjust budgeted expenses in{' '}
            <Link className="text-brand" href="/budget">
              Budget
            </Link>{' '}
            and target allocations in{' '}
            <Link className="text-brand" href="/investments">
              Investments
            </Link>
            .
          </p>
        </section>
        <section className="rounded border p-4 space-y-2">
          <h2 className="font-medium">Results</h2>
          <p>
            <span className="text-gray-600">Target number:</span> $
            {result.target.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </p>
          <p>
            <span className="text-gray-600">Years to FI:</span>{' '}
            {result.yearsToFI}
          </p>
          <p>
            <span className="text-gray-600">Projected balance at FI:</span> $
            {result.projectedBalance.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </p>
        </section>
      </div>
    </div>
  )
}
