import { formatCurrency, formatPercent } from './format'

describe('formatCurrency', () => {
  it('formats a number as USD currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('handles negative numbers', () => {
    expect(formatCurrency(-50)).toBe('-$50.00')
  })
})

describe('formatPercent', () => {
  it('formats a number as a percentage', () => {
    expect(formatPercent(0.75)).toBe('75.0%')
  })

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0.0%')
  })

  it('handles numbers greater than 1', () => {
    expect(formatPercent(1.5)).toBe('150.0%')
  })
})
