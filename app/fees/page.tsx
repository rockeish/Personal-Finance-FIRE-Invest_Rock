'use client'

import { useFinanceStore } from '@/lib/store'
import { expenseRatios } from '@/lib/fees'

export default function FeesPage() {
  const { holdings } = useFinanceStore()
  const rows = Object.entries(holdings).map(([sym]) => {
    const er = expenseRatios[sym] ?? 0.001 // default 0.10%
    return { sym, er }
  })
  const weightedER = rows.reduce((s, r) => s + r.er, 0) / (rows.length || 1)
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Fee Analyzer</h1>
      <p className="text-sm text-gray-600">
        Lower expense ratios directly boost long-term returns. Typical
        broad-market index funds charge 0.02%–0.10%.
      </p>
      <table className="w-full text-sm">
        <thead className="text-left">
          <tr className="border-b">
            <th className="py-2">Symbol</th>
            <th className="text-right">Expense Ratio</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.sym} className="border-b">
              <td className="py-1">{r.sym}</td>
              <td className="text-right">{(r.er * 100).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm">
        Portfolio average expense ratio: {(weightedER * 100).toFixed(2)}%
      </p>
    </div>
  )
}
