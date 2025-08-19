'use client'

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useFinanceStore } from '@/lib/store'
import { format } from 'date-fns'

export default function NetWorthChart() {
  const { netWorthHistory } = useFinanceStore()
  const data = netWorthHistory.map((n) => ({
    date: n.date,
    label: format(n.date, 'MMM yy'),
    value: n.value,
  }))
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
        >
          <XAxis
            dataKey="label"
            interval={Math.max(0, Math.floor(data.length / 6) - 1)}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} width={70} />
          <Tooltip
            formatter={(v: number) => v.toLocaleString()}
            labelFormatter={(l) => l}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
