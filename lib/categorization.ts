// lib/categorization.ts

export type CategorizationRule = {
  category: string
  keywords: string[]
}

export const defaultRules: CategorizationRule[] = [
  { category: 'Groceries', keywords: ['grocery', 'supermarket', 'safeway', 'trader joe', 'whole foods'] },
  { category: 'Restaurants', keywords: ['restaurant', 'cafe', 'starbucks', 'mcdonalds', 'chipotle'] },
  { category: 'Shopping', keywords: ['amazon', 'target', 'walmart', 'best buy'] },
  { category: 'Transportation', keywords: ['uber', 'lyft', 'bart', 'scooter', 'gas'] },
  { category: 'Housing', keywords: ['rent', 'mortgage', 'landlord'] },
  { category: 'Utilities', keywords: ['internet', 'cable', 'electric', 'water', 'gas'] },
  { category: 'Entertainment', keywords: ['netflix', 'spotify', 'hulu', 'cinema', 'movie'] },
  { category: 'Health', keywords: ['pharmacy', 'doctor', 'hospital', 'cvs', 'walgreens'] },
]

export function categorizeTransaction(
  description: string,
  rules: CategorizationRule[] = defaultRules
): string | null {
  const lowerDesc = description.toLowerCase()
  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (lowerDesc.includes(keyword)) {
        return rule.category
      }
    }
  }
  return null
}
