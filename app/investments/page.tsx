"use client";

import { useEffect, useMemo, useState } from "react";
import { useFinanceStore } from "@/lib/store";

export default function InvestmentsPage() {
	const { holdings, setHolding, removeHolding, targetAllocation, setTargetAllocation, settings } = useFinanceStore();
	const [symbol, setSymbol] = useState("");
	const [shares, setShares] = useState<number>(0);
	const [priceMap, setPriceMap] = useState<Record<string, number>>({});

	useEffect(() => {
		async function loadPrices() {
			const symbols = Object.keys(holdings);
			if (symbols.length === 0) return;
			const params = new URLSearchParams({ s: symbols.join(",") });
			const res = await fetch(`/api/quotes?${params.toString()}`);
			if (!res.ok) return;
			const data = (await res.json()) as Record<string, number>;
			setPriceMap(data);
		}
		loadPrices();
	}, [holdings]);

	const totalValue = Object.entries(holdings).reduce((sum, [sym, sh]) => sum + sh * (priceMap[sym] ?? 0), 0);

	const drift = useMemo(() => {
		const allocs: Array<{ sym: string; currentPct: number; targetPct: number; value: number; price: number }>= [];
		for (const [sym, sh] of Object.entries(holdings)) {
			const price = priceMap[sym] ?? 0;
			const value = sh * price;
			const currentPct = totalValue ? (value / totalValue) * 100 : 0;
			const targetPct = targetAllocation[sym] ?? 0;
			allocs.push({ sym, currentPct, targetPct, value, price });
		}
		return allocs.sort((a, b) => (b.targetPct - b.currentPct) - (a.targetPct - a.currentPct));
	}, [holdings, priceMap, targetAllocation, totalValue]);

	const suggestions = useMemo(() => {
		let budget = settings.monthlyInvestContribution || 0;
		const plan: Array<{ sym: string; shares: number; cost: number }> = [];
		if (budget <= 0) return plan;
		// Greedy: allocate funds to the most underweight assets first
		const under = drift.filter((d) => d.targetPct > d.currentPct && d.price > 0);
		for (const d of under) {
			if (budget <= 0) break;
			const desiredValue = (d.targetPct / 100) * (totalValue + budget);
			const need = Math.max(0, desiredValue - d.value);
			const buyCost = Math.min(budget, need);
			const shares = Math.floor(buyCost / d.price);
			if (shares > 0) {
				const cost = shares * d.price;
				plan.push({ sym: d.sym, shares, cost });
				budget -= cost;
			}
		}
		return plan;
	}, [drift, settings.monthlyInvestContribution, totalValue]);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Investments</h1>
			<div className="flex gap-2">
				<input className="border rounded px-2 py-1 w-32" placeholder="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
				<input className="border rounded px-2 py-1 w-32" type="number" placeholder="Shares" value={shares} onChange={(e) => setShares(Number(e.target.value))} />
				<button className="rounded bg-brand px-3 py-2 text-white" onClick={() => {
					if (!symbol || shares <= 0) return;
					setHolding(symbol, shares);
					setSymbol("");
					setShares(0);
				}}>Add/Update</button>
			</div>
			<section className="rounded border p-4">
				<h2 className="font-medium mb-2">Target Allocation (%)</h2>
				<div className="flex flex-wrap gap-2">
					{Object.keys(holdings).map((sym) => (
						<label key={sym} className="text-sm">{sym}
							<input className="ml-2 border rounded px-2 py-1 w-20 text-right" type="number" value={targetAllocation[sym] ?? 0} onChange={(e) => setTargetAllocation(sym, Number(e.target.value))} />
						</label>
					))}
				</div>
			</section>
			<table className="w-full text-sm">
				<thead className="text-left">
					<tr className="border-b">
						<th className="py-2">Symbol</th>
						<th className="text-right">Shares</th>
						<th className="text-right">Price</th>
						<th className="text-right">Value</th>
						<th className="text-right">Alloc %</th>
						<th className="text-right">Target %</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{Object.entries(holdings).map(([sym, sh]) => {
						const price = priceMap[sym] ?? 0;
						const value = sh * price;
						const alloc = totalValue ? (value / totalValue) * 100 : 0;
						const target = targetAllocation[sym] ?? 0;
						return (
							<tr key={sym} className="border-b">
								<td className="py-1">{sym}</td>
								<td className="text-right">{sh.toLocaleString()}</td>
								<td className="text-right">${price.toFixed(2)}</td>
								<td className="text-right">${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
								<td className="text-right">{alloc.toFixed(1)}%</td>
								<td className="text-right">{target.toFixed(0)}%</td>
								<td className="text-right"><button className="text-red-600" onClick={() => removeHolding(sym)}>Remove</button></td>
							</tr>
						);
					})}
				</tbody>
			</table>
			{suggestions.length > 0 && (
				<section className="rounded border p-4">
					<h2 className="font-medium mb-2">Suggested buys (budget ${settings.monthlyInvestContribution})</h2>
					<ul className="text-sm text-gray-600">
						{suggestions.map((s) => (
							<li key={s.sym}>{s.sym}: buy {s.shares} shares (~${s.cost.toFixed(2)})</li>
						))}
					</ul>
				</section>
			)}
		</div>
	);
}