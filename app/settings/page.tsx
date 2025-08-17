"use client";

import { useFinanceStore } from "@/lib/store";

export default function SettingsPage() {
	const { balances, setBalance, exportState, importState, resetAll } = useFinanceStore();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Settings</h1>
			<section className="rounded border p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
				<label className="block text-sm">Cash
					<input className="mt-1 w-full border rounded px-2 py-1" type="number" value={balances.cash} onChange={(e) => setBalance("cash", Number(e.target.value))} />
				</label>
				<label className="block text-sm">Investments
					<input className="mt-1 w-full border rounded px-2 py-1" type="number" value={balances.investments} onChange={(e) => setBalance("investments", Number(e.target.value))} />
				</label>
				<label className="block text-sm">Debt
					<input className="mt-1 w-full border rounded px-2 py-1" type="number" value={balances.debt} onChange={(e) => setBalance("debt", Number(e.target.value))} />
				</label>
			</section>
			<section className="rounded border p-4 space-y-3">
				<h2 className="font-medium">Backup</h2>
				<div className="flex gap-2">
					<button className="rounded border px-3 py-2" onClick={() => {
						const blob = new Blob([exportState()], { type: "application/json" });
						const url = URL.createObjectURL(blob);
						const a = document.createElement("a");
						a.href = url;
						a.download = "finance.json";
						a.click();
						URL.revokeObjectURL(url);
					}}>Download JSON</button>
					<label className="rounded bg-brand px-3 py-2 text-white cursor-pointer">
						Restore JSON
						<input type="file" accept="application/json" hidden onChange={async (e) => {
							const file = e.target.files?.[0];
							if (!file) return;
							const text = await file.text();
							importState(text);
						}} />
					</label>
					<button className="rounded border px-3 py-2 text-red-600" onClick={() => resetAll()}>Reset All</button>
				</div>
			</section>
		</div>
	);
}