// /app/api/plaid/exchange_public_token/route.ts
import { NextResponse } from 'next/server'
import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid'

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

export async function POST(request: Request) {
  try {
    const { public_token } = await request.json()
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    })

    const accessToken = response.data.access_token
    const itemId = response.data.item_id

    // TODO: Store the access_token and item_id securely,
    // associated with the user. This is a critical security step.
    // For this example, we're just logging it.
    console.log({
      message: 'Access token created successfully',
      accessToken,
      itemId,
    })

    return NextResponse.json({ message: 'Public token exchanged successfully' })
  } catch (error) {
    console.error('Error exchanging public token:', error)
    return NextResponse.json(
      { error: 'Could not exchange public token' },
      { status: 500 }
    )
  }
}
