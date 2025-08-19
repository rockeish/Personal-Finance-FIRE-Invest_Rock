export function formatCurrency(amount: number, locale: string = undefined as any, currency: string = "USD") {
	try {
		return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
	} catch {
		return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
	}
}

export function formatPercent(value: number, locale: string = undefined as any) {
	try {
		return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(value);
	} catch {
		return `${(value * 100).toFixed(1)}%`;
	}
}