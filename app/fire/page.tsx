"use client";

import { useFinanceStore } from "@/lib/store";
import { useMemo, useState } from "react";

function calculateFIRE({ annualSpending, withdrawalRatePercent, currentPortfolio, annualContributions, expectedReturnPercent }: { annualSpending: number; withdrawalRatePercent: number; currentPortfolio: number; annualContributions: number; expectedReturnPercent: number; }) {
	const target = annualSpending / (withdrawalRatePercent / 100);
	let years = 0;
	let balance = currentPortfolio;
	const r = expectedReturnPercent / 100;
	while (balance < target && years < 100) {
		balance = balance * (1 + r) + annualContributions;
		years += 1;
	}
	return { target, yearsToFI: years, projectedBalance: balance };
}

export default function FIREPage() {
	const { balances, monthlySpending } = useFinanceStore();
	const avgMonthly = useMemo(() => {
		if (monthlySpending.length === 0) return 0;
		return monthlySpending.reduce((s, m) => s + m.amount, 0) / monthlySpending.length;
	}, [monthlySpending]);

	const [withdrawalRatePercent, setWR] = useState(4);
	const [expectedReturnPercent, setReturn] = useState(5);
	const [annualContributions, setContrib] = useState(12000);

	const result = calculateFIRE({
		annualSpending: avgMonthly * 12,
		withdrawalRatePercent,
		currentPortfolio: balances.investments,
		annualContributions,
		expectedReturnPercent,
	});

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">FIRE</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<section className="rounded border p-4 space-y-3">
					<h2 className="font-medium">Inputs</h2>
					<label className="block text-sm">Withdrawal rate (%)
						<input className="mt-1 w-full border rounded px-2 py-1" type="number" value={withdrawalRatePercent} onChange={(e) => setWR(Number(e.target.value))} />
					</label>
					<label className="block text-sm">Expected return (%)
						<input className="mt-1 w-full border rounded px-2 py-1" type="number" value={expectedReturnPercent} onChange={(e) => setReturn(Number(e.target.value))} />
					</label>
					<label className="block text-sm">Annual contributions ($)
						<input className="mt-1 w-full border rounded px-2 py-1" type="number" value={annualContributions} onChange={(e) => setContrib(Number(e.target.value))} />
					</label>
				</section>
				<section className="rounded border p-4 space-y-2">
					<h2 className="font-medium">Results</h2>
					<p><span className="text-gray-600">Target number:</span> ${result.target.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
					<p><span className="text-gray-600">Years to FI:</span> {result.yearsToFI}</p>
					<p><span className="text-gray-600">Projected balance at FI:</span> ${result.projectedBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
				</section>
			</div>
		</div>
	);
}