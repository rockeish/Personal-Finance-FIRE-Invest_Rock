// components/NetWorthDashboard.tsx
'use client'

import { useFinanceStore } from '@/lib/store'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/format'

export default function NetWorthDashboard() {
  const { balances, netWorthHistory } = useFinanceStore()
  const currentNetWorth = balances.cash + balances.investments - balances.debt

  // TODO: Replace with real data from the store once available
  const mockedHistory = [
    { date: '2023-01-01', value: 50000 },
    { date: '2023-02-01', value: 52000 },
    { date: '2023-03-01', value: 51000 },
    { date: '2023-04-01', value: 55000 },
    { date: '2023-05-01', value: 58000 },
    { date: '2023-06-01', value: 62000 },
  ]

  const data = (netWorthHistory.length > 1 ? netWorthHistory : mockedHistory).map(
    (item) => ({
      // a bit of a hack to make sure date is a string
      date: new Date(item.date).toLocaleDateString(),
      value: item.value,
    })
  )

  return (
    <div className="p-4 rounded-lg bg-white shadow">
      <h2 className="text-lg font-semibold">Net Worth</h2>
      <p className="text-3xl font-bold text-gray-800">
        {formatCurrency(currentNetWorth)}
      </p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => formatCurrency(value, undefined, 'USD').slice(0, -3) + 'k'} />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
