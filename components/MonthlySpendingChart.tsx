"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useFinanceStore } from "@/lib/store";
import { format } from "date-fns";

export default function MonthlySpendingChart() {
	const { monthlySpending } = useFinanceStore();
	const data = monthlySpending.map((m) => ({ label: format(m.month, "MMM yy"), amount: m.amount }));
	return (
		<div className="h-64 w-full">
			<ResponsiveContainer>
				<BarChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
					<XAxis dataKey="label" interval={Math.max(0, Math.floor(data.length / 6) - 1)} tick={{ fontSize: 12 }} />
					<YAxis tick={{ fontSize: 12 }} width={70} />
					<Tooltip formatter={(v: number) => v.toLocaleString()} labelFormatter={(l) => l} />
					<Bar dataKey="amount" fill="#94a3b8" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}