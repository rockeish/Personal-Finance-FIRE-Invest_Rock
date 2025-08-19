"use client";

import { useMemo } from "react";
import { useFinanceStore } from "@/lib/store";

export default function MonthPicker() {
	const { transactions, currentMonth, setCurrentMonth } = useFinanceStore();
	const months = useMemo(() => {
		const set = new Set<string>();
		for (const row of transactions) {
			const raw = (row as any).date || (row as any).Date || (row as any).posted || (row as any).POSTED;
			if (!raw) continue;
			const d = new Date(raw);
			if (isNaN(d.getTime())) continue;
			const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
			set.add(ym);
		}
		return Array.from(set).sort();
	}, [transactions]);
	if (months.length === 0) return null;
	return (
		<select className="border rounded px-2 py-1 text-sm" value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)}>
			{months.map((m) => (
				<option key={m} value={m}>{m}</option>
			))}
		</select>
	);
}