'use client'

import { useState, useEffect } from 'react';

interface Investment {
  id: number;
  symbol: string;
  shares: number;
  purchase_price: number;
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [quotes, setQuotes] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [formData, setFormData] = useState({ symbol: '', shares: '', purchase_price: '', purchase_date: '' });

  useEffect(() => {
    const fetchInvestments = async () => {
      setIsLoading(true);
      const res = await fetch('/api/data/initial');
      if (res.ok) {
        const data = await res.json();
        setInvestments(data.investments);
        if (data.investments.length > 0) {
          const symbols = data.investments.map(i => i.symbol).join(',');
          const quotesRes = await fetch(`/api/quotes?s=${symbols}`);
          if (quotesRes.ok) {
            const quotesData = await quotesRes.json();
            setQuotes(quotesData);
          }
        }
      }
      setIsLoading(false);
    };
    fetchInvestments();
  }, []);

  if (isLoading) {
    return <div>Loading investments...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Investments</h1>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium mb-2">{editingInvestment ? 'Edit Investment' : 'Add New Investment'}</h2>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const url = editingInvestment ? `/api/investments/${editingInvestment.id}` : '/api/investments';
          const method = editingInvestment ? 'PUT' : 'POST';

          const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });

          if (res.ok) {
            const updatedInvestment = await res.json();
            if (editingInvestment) {
              setInvestments(investments.map(i => i.id === updatedInvestment.id ? updatedInvestment : i));
            } else {
              setInvestments([...investments, updatedInvestment]);
            }
            setEditingInvestment(null);
            setFormData({ symbol: '', shares: '', purchase_price: '', purchase_date: '' });
          }
        }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <input name="symbol" placeholder="Symbol (e.g., VTI)" value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value})} className="border rounded px-2 py-1" required />
          <input name="shares" type="number" placeholder="Shares" value={formData.shares} onChange={(e) => setFormData({...formData, shares: e.target.value})} className="border rounded px-2 py-1" required />
          <input name="purchase_price" type="number" placeholder="Purchase Price" value={formData.purchase_price} onChange={(e) => setFormData({...formData, purchase_price: e.target.value})} className="border rounded px-2 py-1" />
          <input name="purchase_date" type="date" value={formData.purchase_date} onChange={(e) => setFormData({...formData, purchase_date: e.target.value})} className="border rounded px-2 py-1" />
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-brand px-3 py-2 text-white">{editingInvestment ? 'Update' : 'Add'}</button>
            {editingInvestment && (
              <button type="button" onClick={() => {
                setEditingInvestment(null);
                setFormData({ symbol: '', shares: '', purchase_price: '', purchase_date: '' });
              }} className="rounded border px-3 py-2">Cancel</button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium mb-2">Your Portfolio</h2>
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr className="border-b">
              <th className="py-2">Symbol</th>
              <th>Shares</th>
              <th>Purchase Price</th>
              <th>Live Price</th>
              <th>Market Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((inv) => (
              <tr key={inv.id} className="border-b hover:bg-gray-50">
                <td className="py-1">{inv.symbol}</td>
                <td>{inv.shares}</td>
                <td>${inv.purchase_price?.toFixed(2)}</td>
                <td>${quotes[inv.symbol]?.toFixed(2) || 'N/A'}</td>
                <td>${(inv.shares * (quotes[inv.symbol] || 0)).toFixed(2)}</td>
                <td>
                  <button onClick={() => {
                    setEditingInvestment(inv);
                    setFormData({
                      symbol: inv.symbol,
                      shares: inv.shares.toString(),
                      purchase_price: inv.purchase_price.toString(),
                      purchase_date: inv.purchase_date ? new Date(inv.purchase_date).toISOString().slice(0, 10) : ''
                    });
                  }} className="text-xs text-blue-600">Edit</button>
                  <button onClick={async () => {
                    if (confirm('Are you sure you want to delete this investment?')) {
                      const res = await fetch(`/api/investments/${inv.id}`, { method: 'DELETE' });
                      if (res.ok) {
                        setInvestments(investments.filter(i => i.id !== inv.id));
                      }
                    }
                  }} className="text-xs text-red-600 ml-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
