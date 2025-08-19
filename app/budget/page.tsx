"use client";

import { useMemo, useState } from "react";
import { useFinanceStore } from "@/lib/store";
import ProgressBar from "@/components/ProgressBar";
import MonthPicker from "@/components/MonthPicker";

export default function BudgetPage() {
	const { categories, setCategoryPlanned, addCategory, getCategoryActuals, currentMonth } = useFinanceStore();
	const [newCategory, setNewCategory] = useState("");
	const actuals = useMemo(() => getCategoryActuals(currentMonth), [getCategoryActuals, currentMonth, categories]);
	const totalPlanned = Object.values(categories).reduce((s, c) => s + (c.planned || 0), 0);
	const totalActual = Object.values(actuals).reduce((s, v) => s + v, 0);

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<h1 className="text-2xl font-semibold">Budget</h1>
				<div className="ml-auto"><MonthPicker /></div>
			</div>
			<div className="flex gap-2">
				<input className="border rounded px-2 py-1" placeholder="New category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
				<button className="rounded bg-brand px-3 py-2 text-white" onClick={() => {
					if (!newCategory.trim()) return;
					addCategory(newCategory.trim());
					setNewCategory("");
				}}>Add</button>
			</div>
			<table className="w-full text-sm">
				<thead className="text-left">
					<tr className="border-b">
						<th className="py-2">Category</th>
						<th className="text-right">Planned</th>
						<th className="text-right">Actual</th>
						<th className="w-1/3">Progress</th>
					</tr>
				</thead>
				<tbody>
					{Object.entries(categories).map(([name, cfg]) => {
						const planned = cfg.planned || 0;
						const actual = actuals[name] || 0;
						return (
							<tr key={name} className="border-b">
								<td className="py-1">{name}</td>
								<td className="text-right">
									<input type="number" className="w-32 border rounded px-2 py-1 text-right" value={planned} onChange={(e) => setCategoryPlanned(name, Number(e.target.value))} />
								</td>
								<td className="text-right">{actual.toLocaleString()}</td>
								<td className="align-middle"><ProgressBar value={actual} max={planned} /></td>
							</tr>
						);
					})}
				</tbody>
				<tfoot>
					<tr>
						<td className="py-2 font-medium">Total</td>
						<td className="text-right font-medium">{totalPlanned.toLocaleString()}</td>
						<td className="text-right font-medium">{totalActual.toLocaleString()}</td>
						<td></td>
					</tr>
				</tfoot>
			</table>
		</div>
	);
}