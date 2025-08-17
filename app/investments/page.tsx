"use client";

import { useEffect, useState } from "react";
import { useFinanceStore } from "@/lib/store";

export default function InvestmentsPage() {
	const { holdings, setHolding, removeHolding } = useFinanceStore();
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
			<table className="w-full text-sm">
				<thead className="text-left">
					<tr className="border-b">
						<th className="py-2">Symbol</th>
						<th className="text-right">Shares</th>
						<th className="text-right">Price</th>
						<th className="text-right">Value</th>
						<th className="text-right">Alloc %</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{Object.entries(holdings).map(([sym, sh]) => {
						const price = priceMap[sym] ?? 0;
						const value = sh * price;
						const alloc = totalValue ? (value / totalValue) * 100 : 0;
						return (
							<tr key={sym} className="border-b">
								<td className="py-1">{sym}</td>
								<td className="text-right">{sh.toLocaleString()}</td>
								<td className="text-right">${price.toFixed(2)}</td>
								<td className="text-right">${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
								<td className="text-right">{alloc.toFixed(1)}%</td>
								<td className="text-right"><button className="text-red-600" onClick={() => removeHolding(sym)}>Remove</button></td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}