'use client'

import Papa from 'papaparse'
import { useMemo, useRef, useState, useEffect } from 'react'
import Papa from 'papaparse'
import { useRef, useState, useEffect } from 'react'
import MonthPicker from '@/components/MonthPicker'

interface Account {
  id: number;
  name: string;
}

export default function TransactionsPage() {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  useEffect(() => {
    const fetchInitialData = async () => {
      const res = await fetch('/api/data/initial');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts);
        setCategories(data.categories);
        if (data.accounts.length > 0) {
          setSelectedAccountId(data.accounts[0].id.toString());
        }
      }
    };
    fetchInitialData();
  }, []);

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await fetch(`/api/transactions?month=${currentMonth}`);
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    };
    if (currentMonth) {
      fetchTransactions();
    }
  }, [currentMonth]);

  const monthTx = transactions;
  const [newCat, setNewCat] = useState('')
  const [ruleCat, setRuleCat] = useState('')
  const [rulePattern, setRulePattern] = useState('')

  async function onUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    if (!selectedAccountId) {
      alert('Please select an account first.');
      return;
    }
    const file = files[0]
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: async (result) => {
        const rows = (result.data as Transaction[]).filter(Boolean)

        const res = await fetch('/api/transactions/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactions: rows,
            accountId: selectedAccountId
          })
        });

        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }

        // Refresh the transaction list after import
        if (res.ok) {
          const fetchRes = await fetch(`/api/transactions?month=${currentMonth}`);
          if (fetchRes.ok) {
            const data = await fetchRes.json();
            setTransactions(data);
          }
        }
      },
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Select Account</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => onUpload(e.target.files)}
        />
        <button
          className="rounded bg-brand px-3 py-2 text-white"
          onClick={() => fileRef.current?.click()}
        >
          Upload CSV
        </button>
        <button
          className="rounded border px-3 py-2"
          onClick={async () => {
            if (confirm('Are you sure you want to clear all transactions?')) {
              const res = await fetch('/api/transactions/clear', { method: 'DELETE' });
              if (res.status === 401) {
                window.location.href = '/login';
                return;
              }
              // Refresh transactions
              if (res.ok) {
                setTransactions([]);
              }
            }
          }}
        >
          Clear
        </button>
        <div className="ml-auto">
          <MonthPicker currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded border p-4 space-y-2">
          <h2 className="font-medium">Categories</h2>
          <div className="flex gap-2">
            <input
              className="border rounded px-2 py-1 text-sm"
              placeholder="New category"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
            />
            <button
              className="rounded border px-2 py-1 text-sm"
              onClick={async () => {
                if (newCat.trim()) {
                  const res = await fetch('/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newCat.trim() })
                  });
                  if (res.ok) {
                    const newCategory = await res.json();
                    setCategories([...categories, newCategory]);
                    setNewCat('');
                  }
                }
              }}
            >
              Add
            </button>
          </div>
          <ul className="text-sm text-gray-600 max-h-56 overflow-auto">
            {categories.map((c) => (
              <li key={c.id} className="flex justify-between border-b py-1">
                <span>{c.name}</span>
                <span className="text-xs text-gray-400">
                  {c.rules?.length || 0} rules
                </span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 items-center">
            <select
              className="border rounded px-2 py-1 text-sm"
              value={ruleCat}
              onChange={(e) => setRuleCat(e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              className="border rounded px-2 py-1 text-sm"
              placeholder="Rule pattern (regex)"
              value={rulePattern}
              onChange={(e) => setRulePattern(e.target.value)}
            />
            <button
              className="rounded border px-2 py-1 text-sm"
              onClick={async () => {
                if (ruleCat && rulePattern) {
                  const category = categories.find(c => c.name === ruleCat);
                  if (!category) return;

                  const res = await fetch(`/api/categories/${category.id}/rules`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rule: rulePattern })
                  });

                  if (res.ok) {
                    const updatedCategory = await res.json();
                    setCategories(categories.map(c => c.id === updatedCategory.id ? updatedCategory : c));
                    setRulePattern('');
                  }
                }
              }}
            >
              Add Rule
            </button>
            <button
              className="rounded bg-brand text-white px-2 py-1 text-sm"
              onClick={async () => {
                const res = await fetch('/api/transactions/apply-rules', { method: 'POST' });
                if (res.ok) {
                  const result = await res.json();
                  alert(result.message);
                  // Refresh transactions
                  const fetchRes = await fetch(`/api/transactions?month=${currentMonth}`);
                  if (fetchRes.ok) {
                    const data = await fetchRes.json();
                    setTransactions(data);
                  }
                }
              }}
            >
              Apply Rules
            </button>
          </div>
        </section>
        <section className="rounded border p-4">
          <h2 className="font-medium">{currentMonth} Transactions</h2>
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="border-b">
                <th className="py-2">Date</th>
                <th>Description</th>
                <th>Category</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {monthTx.slice(0, 300).map((t: any) => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="py-1">{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.description}</td>
                  <td>
                    <select
                      className="border rounded px-2 py-1 text-xs"
                      value={t.category_id || ''}
                      onChange={async (e) => {
                        const categoryId = e.target.value;
                        const res = await fetch(`/api/transactions/${t.id}/categorize`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ categoryId })
                        });
                        if (res.ok) {
                          const updatedTransaction = await res.json();
                          setTransactions(transactions.map(tx => tx.id === updatedTransaction.id ? updatedTransaction : tx));
                        }
                      }}
                    >
                      <option value="">—</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="text-right">{parseFloat(t.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
