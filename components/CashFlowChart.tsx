'use client'

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface CashFlowData {
  month: string;
  income: number;
  expenses: number;
}

export default function CashFlowChart() {
  const [data, setData] = useState<CashFlowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await fetch('/api/charts/cash-flow');
      if (res.ok) {
        const cashFlowData = await res.json();
        setData(cashFlowData);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading chart...</div>;
  }

  if (data.length === 0) {
    return <div>Not enough data to display cash flow.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        <Legend />
        <Bar dataKey="income" fill="#82ca9d" />
        <Bar dataKey="expenses" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
