'use client'

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface MonthlySpendingChartProps {
  currentMonth: string;
}

interface SpendingData {
  category: string;
  amount: number;
}

export default function MonthlySpendingChart({ currentMonth }: MonthlySpendingChartProps) {
  const [data, setData] = useState<SpendingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await fetch(`/api/charts/monthly-spending?month=${currentMonth}`);
      if (res.ok) {
        const spendingData = await res.json();
        setData(spendingData);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [currentMonth]);

  if (isLoading) {
    return <div>Loading chart...</div>;
  }

  if (data.length === 0) {
    return <div>No spending data for this month.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="category" type="category" width={80} />
        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        <Bar dataKey="amount" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
