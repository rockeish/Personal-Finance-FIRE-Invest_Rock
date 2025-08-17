"use client";

import Papa from "papaparse";
import { useRef } from "react";
import { useFinanceStore } from "@/lib/store";

export default function TransactionsPage() {
	const fileRef = useRef<HTMLInputElement | null>(null);
	const { transactions, addTransactions, clearTransactions } = useFinanceStore();

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
			<div className="flex gap-2">
				<input ref={fileRef} type="file" accept=".csv" onChange={(e) => onUpload(e.target.files)} />
				<button className="rounded bg-brand px-3 py-2 text-white" onClick={() => fileRef.current?.click()}>Upload CSV</button>
				<button className="rounded border px-3 py-2" onClick={() => clearTransactions()}>Clear</button>
			</div>
			<table className="w-full text-sm">
				<thead className="text-left">
					<tr className="border-b">
						<th className="py-2">Date</th>
						<th>Description</th>
						<th className="text-right">Amount</th>
					</tr>
				</thead>
				<tbody>
					{transactions.slice(0, 200).map((t, i) => (
						<tr key={i} className="border-b hover:bg-gray-50">
							<td className="py-1">{t.date || t.Date || t.posted || t.POSTED || ""}</td>
							<td>{t.description || t.Description || t.name || t.memo || ""}</td>
							<td className="text-right">{(t.amount || t.Amount || t.debit || t.credit || 0).toLocaleString()}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}