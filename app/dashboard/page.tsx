"use client";

import { useFinanceStore } from "@/lib/store";
import { format } from "date-fns";

export default function DashboardPage() {
	const { balances, monthlySpending, netWorthHistory } = useFinanceStore();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Dashboard</h1>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<section className="rounded-lg border p-4">
					<h2 className="font-medium mb-2">Monthly Spending</h2>
					<ul className="text-sm text-gray-600 space-y-1">
						{monthlySpending.map((m) => (
							<li key={m.month.toISOString()} className="flex justify-between">
								<span>{format(m.month, "MMM yyyy")}</span>
								<span>${m.amount.toLocaleString()}</span>
							</li>
						))}
					</ul>
				</section>
				<section className="rounded-lg border p-4">
					<h2 className="font-medium mb-2">Net Worth (last 12 months)</h2>
					<ul className="text-sm text-gray-600 space-y-1">
						{netWorthHistory.slice(-12).map((n) => (
							<li key={n.date.toISOString()} className="flex justify-between">
								<span>{format(n.date, "MMM yyyy")}</span>
								<span>${n.value.toLocaleString()}</span>
							</li>
						))}
					</ul>
				</section>
			</div>
		</div>
	);
}