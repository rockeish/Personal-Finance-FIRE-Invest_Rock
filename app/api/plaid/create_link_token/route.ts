// /app/api/plaid/create_link_token/route.ts
import { NextResponse } from 'next/server'
import {
  PlaidApi,
  Configuration,
  PlaidEnvironments,
  Products,
  CountryCode,
} from 'plaid'

// IMPORTANT: Add your Plaid credentials to a .env.local file
// PLAID_CLIENT_ID=...
// PLAID_SECRET=...
const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
})

const plaidClient = new PlaidApi(configuration)

export async function POST() {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        // This should be a unique identifier for the user
        client_user_id: 'user-id', // TODO: Replace with a real user ID
      },
      client_name: 'Personal Finance Pro',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error creating link token:', error)
    return NextResponse.json(
      { error: 'Could not create link token' },
      { status: 500 }
    )
  }
}
