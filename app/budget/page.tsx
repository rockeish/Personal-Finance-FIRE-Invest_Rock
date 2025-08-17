"use client";

import { useFinanceStore } from "@/lib/store";
import { useState } from "react";

export default function BudgetPage() {
	const { budgetCategories, setBudgetAmount } = useFinanceStore();
	const [newCategory, setNewCategory] = useState("");

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Budget</h1>
			<div className="flex gap-2">
				<input className="border rounded px-2 py-1" placeholder="New category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
				<button className="rounded bg-brand px-3 py-2 text-white" onClick={() => {
					if (!newCategory.trim()) return;
					setBudgetAmount(newCategory.trim(), 0);
					setNewCategory("");
				}}>Add</button>
			</div>
			<table className="w-full text-sm">
				<thead className="text-left">
					<tr className="border-b">
						<th className="py-2">Category</th>
						<th className="text-right">Planned</th>
					</tr>
				</thead>
				<tbody>
					{Object.entries(budgetCategories).map(([name, planned]) => (
						<tr key={name} className="border-b">
							<td className="py-1">{name}</td>
							<td className="text-right">
								<input type="number" className="w-32 border rounded px-2 py-1 text-right" value={planned} onChange={(e) => setBudgetAmount(name, Number(e.target.value))} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}