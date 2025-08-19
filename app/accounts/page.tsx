'use client'

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Accounts</h1>
      <p className="text-sm text-gray-600">
        Link bank, credit, and investment accounts securely. Placeholder for
        Plaid/Finicity integration. Configure keys and enable linking in a
        future iteration.
      </p>
      <div className="rounded border p-4">
        <button
          className="rounded bg-brand text-white px-3 py-2"
          onClick={() => alert('Plaid Link placeholder')}
        >
          Link an Account
        </button>
      </div>
    </div>
  )
}
