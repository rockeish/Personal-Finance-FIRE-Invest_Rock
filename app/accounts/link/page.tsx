// /app/accounts/link/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { usePlaidLink } from 'react-plaid-link'

export default function PlaidLink() {
  const [linkToken, setLinkToken] = useState<string | null>(null)

  useEffect(() => {
    async function createLinkToken() {
      try {
        const response = await fetch('/api/plaid/create_link_token', {
          method: 'POST',
        })
        const { link_token } = await response.json()
        setLinkToken(link_token)
      } catch (error) {
        console.error('Error creating link token:', error)
      }
    }
    createLinkToken()
  }, [])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      // Send the public_token to your server
      try {
        await fetch('/api/plaid/exchange_public_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ public_token }),
        })
        // TODO: Handle success, e.g., redirect to the accounts page
        console.log('Plaid link successful:', metadata)
      } catch (error) {
        console.error('Error exchanging public token:', error)
      }
    },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Link a New Account</h1>
      <p className="mb-4">
        Securely connect your financial accounts using Plaid.
      </p>
      <button
        onClick={() => open()}
        disabled={!ready}
        className="rounded bg-brand px-4 py-2 text-white disabled:opacity-50"
      >
        Link Account
      </button>
    </div>
  )
}
