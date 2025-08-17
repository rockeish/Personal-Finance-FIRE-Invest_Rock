import { create } from "zustand";

export type Transaction = Record<string, any> & { amount?: number; date?: string };

export type FinanceState = {
	balances: { cash: number; investments: number; debt: number };
	transactions: Transaction[];
	monthlySpending: { month: Date; amount: number }[];
	netWorthHistory: { date: Date; value: number }[];
	budgetCategories: Record<string, number>;
	holdings: Record<string, number>;
	addTransactions: (rows: Transaction[]) => void;
	clearTransactions: () => void;
	setBudgetAmount: (name: string, amount: number) => void;
	setHolding: (symbol: string, shares: number) => void;
	removeHolding: (symbol: string) => void;
	setBalance: (key: "cash" | "investments" | "debt", value: number) => void;
	exportState: () => string;
	importState: (json: string) => void;
	resetAll: () => void;
};

const LOCAL_KEY = "finance-pro-state-v1";

const initialState: Omit<FinanceState, "addTransactions" | "clearTransactions" | "setBudgetAmount" | "setHolding" | "removeHolding" | "setBalance" | "exportState" | "importState" | "resetAll"> = {
	balances: { cash: 10000, investments: 25000, debt: 5000 },
	transactions: [],
	monthlySpending: [],
	netWorthHistory: [],
	budgetCategories: { Rent: 1500, Groceries: 400, Utilities: 150, Fun: 200 },
	holdings: { VTI: 50, VXUS: 30, BND: 20 },
};

function deriveMonthlySpending(transactions: Transaction[]): { month: Date; amount: number }[] {
	const map = new Map<string, number>();
	for (const t of transactions) {
		const raw = t.date || t.Date || t.posted || t.POSTED;
		if (!raw) continue;
		const date = new Date(raw);
		if (isNaN(date.getTime())) continue;
		const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
		const amount = Number(t.amount ?? t.Amount ?? t.debit ?? t.credit ?? 0);
		map.set(key, (map.get(key) || 0) + amount);
	}
	return Array.from(map.entries()).map(([ym, amount]) => {
		const [y, m] = ym.split("-").map(Number);
		return { month: new Date(y, m - 1, 1), amount };
	}).sort((a, b) => a.month.getTime() - b.month.getTime());
}

function deriveNetWorthHistory(balances: FinanceState["balances"], monthlySpending: { month: Date; amount: number }[]) {
	const history: { date: Date; value: number }[] = [];
	let base = balances.cash + balances.investments - balances.debt;
	for (const m of monthlySpending) {
		base -= Math.max(0, m.amount);
		history.push({ date: m.month, value: base });
	}
	return history;
}

function coercePersisted(parsed: any): Partial<FinanceState> {
	if (!parsed || typeof parsed !== "object") return {};
	const next: any = { ...parsed };
	if (next.monthlySpending && Array.isArray(next.monthlySpending)) {
		next.monthlySpending = next.monthlySpending.map((m: any) => ({ month: new Date(m.month), amount: Number(m.amount ?? 0) }));
	}
	if (next.netWorthHistory && Array.isArray(next.netWorthHistory)) {
		next.netWorthHistory = next.netWorthHistory.map((n: any) => ({ date: new Date(n.date), value: Number(n.value ?? 0) }));
	}
	if (next.balances && typeof next.balances === "object") {
		next.balances = {
			cash: Number(next.balances.cash ?? 0),
			investments: Number(next.balances.investments ?? 0),
			debt: Number(next.balances.debt ?? 0),
		};
	}
	if (next.holdings && typeof next.holdings === "object") {
		const h: Record<string, number> = {};
		for (const k of Object.keys(next.holdings)) h[k] = Number(next.holdings[k] ?? 0);
		next.holdings = h;
	}
	if (next.budgetCategories && typeof next.budgetCategories === "object") {
		const b: Record<string, number> = {};
		for (const k of Object.keys(next.budgetCategories)) b[k] = Number(next.budgetCategories[k] ?? 0);
		next.budgetCategories = b;
	}
	return next as Partial<FinanceState>;
}

function loadPersisted(): Partial<FinanceState> | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(LOCAL_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		return coercePersisted(parsed);
	} catch (e) {
		console.warn("Failed to parse persisted state", e);
		return null;
	}
}

function persist(state: FinanceState) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
	} catch {}
}

export const useFinanceStore = create<FinanceState>((set, get) => {
	const persisted = loadPersisted();
	const base = { ...initialState, ...(persisted ?? {}) } as FinanceState;
	return {
		...base,
		addTransactions: (rows) => set(() => {
			const tx = [...get().transactions, ...rows];
			const monthly = deriveMonthlySpending(tx);
			const netWorth = deriveNetWorthHistory(get().balances, monthly);
			const next = { ...get(), transactions: tx, monthlySpending: monthly, netWorthHistory: netWorth } as FinanceState;
			persist(next);
			return next;
		}),
		clearTransactions: () => set(() => {
			const next = { ...get(), transactions: [], monthlySpending: [], netWorthHistory: [] } as FinanceState;
			persist(next);
			return next;
		}),
		setBudgetAmount: (name, amount) => set(() => {
			const next = { ...get(), budgetCategories: { ...get().budgetCategories, [name]: amount } } as FinanceState;
			persist(next);
			return next;
		}),
		setHolding: (symbol, shares) => set(() => {
			const next = { ...get(), holdings: { ...get().holdings, [symbol]: shares } } as FinanceState;
			persist(next);
			return next;
		}),
		removeHolding: (symbol) => set(() => {
			const { [symbol]: _, ...rest } = get().holdings;
			const next = { ...get(), holdings: rest } as FinanceState;
			persist(next);
			return next;
		}),
		setBalance: (key, value) => set(() => {
			const nextBalances = { ...get().balances, [key]: value } as FinanceState["balances"];
			const netWorth = deriveNetWorthHistory(nextBalances, get().monthlySpending);
			const next = { ...get(), balances: nextBalances, netWorthHistory: netWorth } as FinanceState;
			persist(next);
			return next;
		}),
		exportState: () => JSON.stringify(get()),
		importState: (json: string) => set(() => {
			const parsed = coercePersisted(JSON.parse(json));
			const next = { ...get(), ...parsed } as FinanceState;
			persist(next);
			return next;
		}),
		resetAll: () => set(() => {
			const next = { ...get(), ...initialState } as FinanceState;
			persist(next);
			return next;
		}),
	};
});