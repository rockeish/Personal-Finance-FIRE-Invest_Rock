"use client";

import Papa from "papaparse";
import { useMemo, useRef, useState } from "react";
import { useFinanceStore } from "@/lib/store";
import MonthPicker from "@/components/MonthPicker";

export default function TransactionsPage() {
	const fileRef = useRef<HTMLInputElement | null>(null);
	const {
		transactions,
		addTransactions,
		clearTransactions,
		currentMonth,
		getMonthlyTransactions,
		categories,
		transactionCategories,
		setTransactionCategory,
		applyRules,
		addCategory,
		addCategoryRule,
	} = useFinanceStore();

	const monthTx = useMemo(() => getMonthlyTransactions(currentMonth), [getMonthlyTransactions, currentMonth, transactions, transactionCategories]);
	const [newCat, setNewCat] = useState("");
	const [ruleCat, setRuleCat] = useState("");
	const [rulePattern, setRulePattern] = useState("");

	function onUpload(files: FileList | null) {
		if (!files || files.length === 0) return;
		const file = files[0];
		Papa.parse(file, {
			header: true,
			dynamicTyping: true,
			complete: (result) => {
				const rows = (result.data as any[]).filter(Boolean);
				addTransactions(rows);
			},
		});
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Transactions</h1>
			<div className="flex flex-wrap items-center gap-2">
				<input ref={fileRef} type="file" accept=".csv" onChange={(e) => onUpload(e.target.files)} />
				<button className="rounded bg-brand px-3 py-2 text-white" onClick={() => fileRef.current?.click()}>Upload CSV</button>
				<button className="rounded border px-3 py-2" onClick={() => clearTransactions()}>Clear</button>
				<div className="ml-auto"><MonthPicker /></div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<section className="rounded border p-4 space-y-2">
					<h2 className="font-medium">Categories</h2>
					<div className="flex gap-2">
						<input className="border rounded px-2 py-1 text-sm" placeholder="New category" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
						<button className="rounded border px-2 py-1 text-sm" onClick={() => { if (newCat.trim()) { addCategory(newCat.trim()); setNewCat(""); } }}>Add</button>
					</div>
					<ul className="text-sm text-gray-600 max-h-56 overflow-auto">
						{Object.keys(categories).map((c) => (
							<li key={c} className="flex justify-between border-b py-1"><span>{c}</span><span className="text-xs text-gray-400">{categories[c].rules.length} rules</span></li>
						))}
					</ul>
					<div className="flex gap-2 items-center">
						<select className="border rounded px-2 py-1 text-sm" value={ruleCat} onChange={(e) => setRuleCat(e.target.value)}>
							<option value="">Select category</option>
							{Object.keys(categories).map((c) => <option key={c} value={c}>{c}</option>)}
						</select>
						<input className="border rounded px-2 py-1 text-sm" placeholder="Rule pattern (regex)" value={rulePattern} onChange={(e) => setRulePattern(e.target.value)} />
						<button className="rounded border px-2 py-1 text-sm" onClick={() => { if (ruleCat && rulePattern) { addCategoryRule(ruleCat, rulePattern); setRulePattern(""); } }}>Add Rule</button>
						<button className="rounded bg-brand text-white px-2 py-1 text-sm" onClick={() => applyRules()}>Apply Rules</button>
					</div>
				</section>
				<section className="rounded border p-4">
					<h2 className="font-medium">{currentMonth} Transactions</h2>
					<table className="w-full text-sm">
						<thead className="text-left">
							<tr className="border-b">
								<th className="py-2">Date</th>
								<th>Description</th>
								<th>Category</th>
								<th className="text-right">Amount</th>
							</tr>
						</thead>
						<tbody>
							{monthTx.slice(0, 300).map((t) => (
								<tr key={t.key} className="border-b hover:bg-gray-50">
									<td className="py-1">{t.date.toISOString().slice(0,10)}</td>
									<td>{t.description}</td>
									<td>
										<select className="border rounded px-2 py-1 text-xs" value={t.category || ""} onChange={(e) => setTransactionCategory(t.key, e.target.value || undefined)}>
											<option value="">—</option>
											{Object.keys(categories).map((c) => <option key={c} value={c}>{c}</option>)}
										</select>
									</td>
									<td className="text-right">{t.amount.toLocaleString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>
			</div>
		</div>
	);
}