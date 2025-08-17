"use client";

import { useFinanceStore } from "@/lib/store";
import NetWorthChart from "@/components/NetWorthChart";
import MonthlySpendingChart from "@/components/MonthlySpendingChart";

export default function DashboardPage() {
	const { balances } = useFinanceStore();

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
					<MonthlySpendingChart />
				</section>
				<section className="rounded-lg border p-4">
					<h2 className="font-medium mb-2">Net Worth</h2>
					<NetWorthChart />
				</section>
			</div>
		</div>
	);
}