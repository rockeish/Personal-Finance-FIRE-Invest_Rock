export function formatCurrency(
  amount: number,
  locale?: string,
  currency: string = 'USD'
) {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  }
}

export function formatPercent(value: number, locale?: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value)
  } catch {
    return `${(value * 100).toFixed(1)}%`
  }
}
