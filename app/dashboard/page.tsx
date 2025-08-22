'use client'

import { useState, useEffect } from 'react'
import NetWorthDashboard from '@/components/NetWorthDashboard'
import MonthlySpendingChart from '@/components/MonthlySpendingChart'
import MonthPicker from '@/components/MonthPicker'

interface Account {
  id: number;
  user_id: number;
  name: string;
  type: 'cash' | 'investments' | 'debt';
  balance: number;
  created_at: string;
}

interface InitialData {
  accounts: Account[];
  kpis: {
    totalSpent: number;
  }
}

export default function DashboardPage() {
  const [balances, setBalances] = useState({ cash: 0, investments: 0, debt: 0 });
  const [kpis, setKpis] = useState({ totalSpent: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/data/initial');

        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }

        if (response.ok) {
          const data: InitialData = await response.json();
          const cash = data.accounts.filter(a => a.type === 'cash').reduce((sum, a) => sum + parseFloat(a.balance as any), 0);
          const investments = data.accounts.filter(a => a.type === 'investments').reduce((sum, a) => sum + parseFloat(a.balance as any), 0);
          const debt = data.accounts.filter(a => a.type === 'debt').reduce((sum, a) => sum + parseFloat(a.balance as any), 0);
          setBalances({ cash, investments, debt });
          setKpis(data.kpis);
        } else {
          console.error("Failed to fetch initial data");
        }
      } catch (error) {
        console.error('Failed to fetch initial data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="ml-auto flex items-center gap-4">
          <MonthPicker />
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login';
            }}
            className="rounded border px-3 py-2 text-sm"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <section className="rounded-lg border p-4">
          <h2 className="font-medium">Cash</h2>
          <p className="text-2xl">${balances.cash.toLocaleString()}</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="font-medium">Investments</h2>
          <p className="text-2xl">${balances.investments.toLocaleString()}</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="font-medium">Debts</h2>
          <p className="text-2xl">${balances.debt.toLocaleString()}</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="font-medium">This Month Spent</h2>
          <p className="text-2xl">${kpis.totalSpent.toLocaleString()}</p>
        </section>
      </div>
      {/* These components will be re-added after they are refactored */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-lg border p-4">
          <h2 className="font-medium mb-2">Monthly Spending</h2>
          <MonthlySpendingChart />
        </section>
        <section className="rounded-lg border p-4">
          <NetWorthDashboard />
        </section>
      </div> */}
    </div>
  )
}
